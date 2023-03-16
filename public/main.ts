import { BrowserWindow } from "electron";
import { ChildProcessWithoutNullStreams } from "child_process";
import { AxiosResponse } from "axios";
import { z, ZodError } from "zod";
import { Atom, Prisma, Project, Test } from "@prisma/client";
import {
  AtomRespSchema,
  NewProject,
  NewProjectSchema,
  NewTest,
  NewTestSchema,
  ValidAtomResp,
  ValidPredResp,
} from "./validation/formValidation";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { app, ipcMain, dialog, Menu, session } from "electron";
import axios from "axios";
import fs from "fs";
import os from "os";
import {
  CLOSE_TEST,
  DELETE_PROJECT,
  GET_ATOM_SOURCE,
  GET_ATOM_SOURCES,
  GET_PROJECT,
  UPDATE_ATOM,
  UPDATE_PROJECT_FILE,
  GET_PROJECT_FILE,
  GET_PROJECTS,
  OPEN_PROJECT,
  GET_TESTS,
  SELECT_FILE,
  CREATE_NEW_PROJECT,
  GET_HOME_DIRECTORY,
  CREATE_NEW_TEST,
  GET_ATOM_COLOR,
  GET_ATOM_LABEL,
  SET_ATOM_COLOR,
  CREATE_CONNECTION,
  DELETE_ATOM,
  DELETE_CONNECTION,
  GET_ATOM_MULTIPLICITY,
  GET_ACCEPT_TYPES,
  GET_RELATIONS,
  GET_CONNECTIONS,
  RUN_TEST,
  SET_ACTIVE_TEST,
  DELETE_TEST,
  GET_PREDICATES,
  SET_PREDICATE_TEST,
  GET_ATOM_SHAPE,
  SET_ATOM_SHAPE,
  SET_ATOM_INSTANCE_NICKNAME,
  OPEN_TEST,
  TEST_ADD_ATOM,
  TEST_CAN_ADD_ATOM,
  READ_TEST,
  GET_ACTIVE_TEST,
} from "../src/utils/constants";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const prisma = new PrismaClient();

export type AtomSourceWithRelations = Prisma.AtomSourceGetPayload<{
  include: { fromRelations: true; toRelations: true; isChildOf: true };
}>;

export type TestWithCanvas = Prisma.TestGetPayload<{
  include: {
    atoms: {
      include: {
        srcAtom: {
          include: {
            fromRelations: true;
            isChildOf: true;
            toRelations: true;
          };
        };
      };
    };
    connections: true;
  };
}>;

export type AtomWithSource = Prisma.AtomGetPayload<{
  include: {
    srcAtom: {
      include: { fromRelations: true; isChildOf: true; toRelations: true };
    };
  };
}>;

// Global window variable
let mainWindow: BrowserWindow, projectSelectWindow: BrowserWindow;

// Number coercion helper because ipc encodes numbers as strings.
const number = z.coerce.number();
const isDev = true;

let springAPI: ChildProcessWithoutNullStreams;
let isMac = true;

async function createNewTest(
  projectID: number,
  testName: string
): Promise<{ success: boolean; error?: any; test?: Test }> {
  // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
  // Validate data. If there is an error, return it to the client.
  let validationResp = await validateNewTest({ testName, projectID });
  if (!validationResp.success) {
    console.log(validationResp);
    return validationResp;
  }

  const project = await prisma.project.findFirst({
    where: { id: number.parse(projectID) },
  });
  if (project) {
    let testFilePath = path.join(project.projectPath, `tests/${testName}.txt`);

    // Create temp test file at the given path. If error, return it to the client.
    fs.writeFile(testFilePath, "Placeholder file...", function (err: any) {
      if (err) return { success: false, error: err.message };
    });

    // Insert new test into the database
    const newTest = await prisma.test.create({
      data: {
        name: testName,
        projectID: project.id,
        testFile: testFilePath,
      },
    });

    if (!newTest) {
      return { success: false, error: "Could not create test." };
    } else {
      return { success: true, error: null, test: newTest };
    }
  }
  return { success: false, error: "Could not create test." };
}

/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
async function validateNewProject(
  data: NewProject
): Promise<{ success: boolean; error?: any }> {
  try {
    await NewProjectSchema.parseAsync(data);
    return { success: true, error: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: e.issues };
    } else {
      throw e;
    }
  }
}

async function initializeAtoms(atoms: ValidAtomResp[], projectID: number) {
  let colors = getColorArray();

  // Validate all Atom.
  atoms.forEach((atom) => {
    try {
      AtomRespSchema.parse(atom);
    } catch (e) {
      if (e instanceof ZodError) {
        return { success: false, error: e.issues };
      } else {
        throw e;
      }
    }
  });

  for (const atom of atoms) {
    // Reset colors if needed, then grab a color for assignment.
    if (colors.length === 0) getColorArray();
    let selectedColor = colors.splice(
      Math.floor(Math.random() * colors.length),
      1
    )[0];

    // Insert AtomSource data into the database (sans parent/child data)
    const newAtom = await prisma.atomSource.create({
      data: {
        projectID: projectID,
        label: atom.label,
        isEnum: atom.isEnum ? true : undefined, // Prisma cannot handle null, so must be undefined (schema default is false).
        isLone: atom.isLone ? true : undefined,
        isOne: atom.isOne ? true : undefined,
        isSome: atom.isSome ? true : undefined,
        isAbstract: atom.isAbstract ? true : undefined,
        color: selectedColor,
      },
    });
    if (newAtom === undefined) {
      // TODO: Error handling for issue inserting atom.
    }
  }
}

async function initializeInheritance(
  atoms: ValidAtomResp[],
  projectID: number
) {
  for (const atom of atoms) {
    // Insert parents of atom to atomInheritance table.
    if (atom.parents) {
      for (const parent of atom.parents) {
        // See if the inheritance is already in the database.
        await prisma.atomInheritance.upsert({
          where: {
            atomInheritanceID: {
              parentLabel: parent,
              childLabel: atom.label,
              projectID: projectID,
            },
          },
          create: {
            parentLabel: parent,
            childLabel: atom.label,
            projectID: projectID,
          },
          update: {},
        });
      }
    }

    // Insert children of atom to atomChildren table
    if (atom.children) {
      for (const child of atom.children) {
        await prisma.atomInheritance.upsert({
          where: {
            atomInheritanceID: {
              parentLabel: atom.label,
              childLabel: child,
              projectID: projectID,
            },
          },
          create: {
            parentLabel: atom.label,
            childLabel: child,
            projectID: projectID,
          },
          update: {},
        });
      }
    }
  }
}

async function initializeRelations(atoms: ValidAtomResp[], projectID: number) {
  for (const atom of atoms) {
    // Insert parents of atom to atomInheritance table.
    if (atom.relations) {
      for (const relation of atom.relations) {
        // Nasty transformation to get the last label in a -> chain e.g. "{this/Book->this/Name->this/Listing}"
        const toLabel = relation.type
          .split("->")
          [relation.type.split("->").length - 1].split("}")[0];
        // See if the inheritance is already in the database.
        await prisma.relation.upsert({
          where: {
            relationID: {
              projectID: projectID,
              label: relation.label,
            },
          },
          create: {
            projectID: projectID,
            label: relation.label,
            multiplicity: relation.multiplicity,
            type: relation.type,
            fromLabel: atom.label,
            toLabel: toLabel,
          },
          update: {},
        });
      }
    }
  }
}

async function initializePredicates(
  predicates: ValidPredResp[],
  projectID: number
) {
  for (const pred of predicates) {
    const newPred = await prisma.predicate.create({
      data: {
        projectID: projectID,
        name: pred.label,
      },
    });
    for (const param of pred.parameters) {
      await prisma.predParam.create({
        data: {
          predID: newPred.id,
          label: param.label,
          paramType: param.paramType,
        },
      });
    }
  }
}

async function initProjectData(data: NewProject, projectID: number) {
  try {
    // Convert file path into array based on current platform.  Prevents json serialization issues with '\' characters.
    // Send file to alloy API and get back metadata
    const options = {
      method: "POST",
      url: "http://localhost:8080/files",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        filePath:
          process.platform === "win32"
            ? data.alloyFile.split("\\")
            : data.alloyFile.split("/"),
        operatingSystem: process.platform,
      },
    };

    const apiRequest = axios.request(options);

    let resp: AxiosResponse<{
      atoms: ValidAtomResp[];
      functions: ValidPredResp[];
    }> = await apiRequest;

    if (resp.data) {
      await initializeAtoms(resp.data.atoms, projectID);
      await initializeInheritance(resp.data.atoms, projectID);
      await initializeRelations(resp.data.atoms, projectID);
      await initializePredicates(resp.data.functions, projectID);
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Insert new project record into the database and initialize project assets based on SpringBoot response.
 * @param data
 */
async function createNewProject(data: NewProject) {
  // Validate data. If there is an error, return it to the client.
  let validationResp = await validateNewProject(data);
  if (!validationResp.success) return validationResp;

  // Create project directories
  const fullProjectPath = data.projectPath + data.projectName;
  const projectFolder = fs.mkdirSync(fullProjectPath, { recursive: true });
  const testsFolder = fs.mkdirSync(path.join(fullProjectPath, "tests"), {
    recursive: true,
  });

  if (projectFolder && testsFolder) {
    // Insert project data if paths are good.
    const project = await prisma.project.create({
      data: {
        name: data.projectName,
        projectPath: fullProjectPath,
        alloyFile: data.alloyFile,
      },
    });

    if (!project) {
      return { success: false, error: "Could not create project." };
    }

    await initProjectData(data, project.id);
    return { success: true, error: null, projectID: project.id };
  }
}

/**
 * Validate the form data to ensure no duplicate test names are used and all paths are valid.
 * @returns boolean
 * @param data
 */
async function validateNewTest(
  data: NewTest
): Promise<{ success: boolean; error?: any }> {
  try {
    await NewTestSchema.parseAsync(data);
    return { success: true, error: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: e.issues };
    } else {
      throw e;
    }
  }
}
function createASketchMenu() {
  const template: any = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: "File",
      submenu: [
        {
          label: "Open Project",
          click: async () => {
            if (mainWindow) {
              //
            }
            createProjectSelectWindow();
          },
        },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
              },
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" },
            ]
          : [{ role: "close" }]),
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://electronjs.org");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createProjectSelectWindow() {
  projectSelectWindow = new BrowserWindow({
    width: 960,
    height: 640,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  projectSelectWindow.loadURL(
    isDev
      ? "http://localhost:3000/projects"
      : `${path.join(__dirname, "../build/index.html/projects")}`
  );

  if (isDev) {
    projectSelectWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function createMainWindow(projectID: number) {
  mainWindow = new BrowserWindow({
    // Set browser window parameters
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    //titleBarStyle: "hiddenInset",
  });

  //Load index.html
  mainWindow.loadURL(
    isDev
      ? `http://localhost:3000/main/${projectID}`
      : `${path.join(__dirname, `../build/index.html/main/${projectID}`)}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function openProject(projectID: number) {
  projectSelectWindow.close();
  createMainWindow(projectID);
}

function getColorArray() {
  // Mantine colors at value '4'
  return [
    "#FFA94D",
    "#FFD43B",
    "#A9E34B",
    "#69DB7C",
    "#38D9A9",
    "#3BC9DB",
    "#4DABF7",
    "#748FFC",
    "#9775FA",
    "#DA77F2",
    "#F783AC",
    "#FF8787",
  ];
}

/* Deploy Alloy Analyzer SpringBoot API on port 8080*/
async function deployAlloyAPI() {
  const jarPath = `${path.join(__dirname, "../src/JARs/aSketch-API.jar")}`;
  springAPI = require("child_process").spawn("java", ["-jar", jarPath, ""]);
}

// Open dev tools on launch in dev mode

// After initialization, create new browser window.
// Some APIs only available after this call.
app.whenReady().then(() => {
  deployAlloyAPI().then(() => {
    createASketchMenu();
    createProjectSelectWindow();

    // on macOS
    const reactDevToolsPath = path.join(
      os.homedir(),
      "/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0"
    );

    app.whenReady().then(async () => {
      await session.defaultSession.loadExtension(reactDevToolsPath);
    });

    app.on("activate", function () {
      // On macOS, it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      //if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
      if (BrowserWindow.getAllWindows().length === 0)
        createProjectSelectWindow();
    });
  });
});

// Close app on exit for linux/windows.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();

    // Shutdown spring-boot api
    const kill = require("tree-kill");
    kill(springAPI.pid);
  }
});

ipcMain.on(GET_PROJECTS, async (event) => {
  const projects = await prisma.project.findMany();
  event.sender.send("get-projects-success", projects ? projects : {});
});

ipcMain.on(OPEN_PROJECT, (event, projectID) => {
  openProject(projectID);
});

ipcMain.on(SELECT_FILE, (event) => {
  //console.log("Main Received: SELECT_FILE")

  dialog
    .showOpenDialog({
      title: "Select Project File",
      filters: [
        { name: "Alloy Files", extensions: ["als"] },
        { name: "Any File", extensions: ["*"] },
      ],
      properties: ["openFile"],
    })
    .then(function (response) {
      if (!response.canceled) {
        //console.log(response.filePaths[0])
        event.sender.send("file-selected", response.filePaths[0]);
      } else {
        event.sender.send("file-selected", null);
      }
    });
});

ipcMain.on(GET_HOME_DIRECTORY, (event) => {
  const homedir = require("os").homedir();
  //console.log(homedir)
  event.sender.send("got-home-directory", homedir);
});

ipcMain.on(DELETE_ATOM, async (event, atomID) => {
  const deletion = await prisma.atom.delete({
    where: { id: number.parse(atomID) },
  });

  if (deletion) {
    mainWindow.webContents.send("canvas-update");
  }
});

ipcMain.on(DELETE_CONNECTION, async (event, connID) => {
  const deletion = await prisma.atom.delete({
    where: { id: number.parse(connID) },
  });

  if (deletion) {
    mainWindow.webContents.send("canvas-update");
  }
});

// TODO: Get rid of any types

// ipcMain.on(RUN_TEST, (event, projectKey, testKey, returnChannel) => {
//   // let canvas = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
//   // let atoms = store.get(`projects.${projectKey}.atoms`);
//   let commandString = "";
//   let atomsWithIndexes = {};
//
//   // Type assignment
//   // For atomType in project.Atom
//   Object.entries(atoms).map(([sourceAtomKey, sourceAtom]: any) => {
//     // // Assign each atom a numeral for use in command string
//     // Object.entries(canvas["Atom"]).map(([canvasAtomKey, canvasAtom], index) => {
//     //   atomsWithIndexes[canvasAtomKey] = index;
//     // })
//
//     // For atom in canvas where type matches atomType
//     commandString += "some disj";
//     let atomsOfType: any = Object.entries(canvas["atoms"]).filter(
//       ([canvasAtomKey, canvasAtom]: any) =>
//         sourceAtomKey === canvasAtom["sourceAtomKey"]
//     );
//     for (let i = 0; i < atomsOfType.length; i++) {
//       console.log(atomsOfType[i][1].nickname);
//       commandString += ` ${atomsOfType[i][1].nickname.split("/")[1]}`;
//       if (i < atomsOfType.length - 1) {
//         commandString += ",";
//       }
//     }
//     commandString += `: ${sourceAtom["label"].split("/")[1]} {`;
//   });
//
//   // Set equals these Atom and only these Atom.
//   // For each type of atom in our project.
//   Object.entries(atoms).map(([sourceAtomKey, sourceAtom]: any) => {
//     commandString += `${sourceAtom["label"].split("/")[1]} = `;
//     // Get Atom on the canvas with a matching type.
//     let matchedAtoms: any = Object.entries(canvas["atoms"]).filter(
//       ([key, value]: any) => sourceAtomKey === value["sourceAtomKey"]
//     );
//     // console.log(matchedAtoms)
//     // For each matching atom, append their nickname to the string
//     for (let i = 0; i < matchedAtoms.length; i++) {
//       commandString += `${matchedAtoms[i][1].nickname.split("/")[1]} `;
//       if (i < matchedAtoms.length - 1) {
//         commandString += "+ ";
//       }
//     }
//     commandString += ` and `;
//   });
//
//   // Get a list of the unique connection types in the canvas
//   let connectionTypes = [
//     ...new Set(
//       Object.entries(canvas["connections"]).map(
//         (value: any) => value[1]["connectionLabel"]
//       )
//     ),
//   ];
//
//   // Iterate over the found connection types
//   for (let i = 0; i < connectionTypes.length; i++) {
//     commandString += `${connectionTypes[i]}=`;
//     // Filter our canvas connections down to just the ones that match the current connection type
//     let canvasConnections = Object.entries(canvas["connections"]).filter(
//       ([key, value]: any) => value["connectionLabel"] === connectionTypes[i]
//     );
//     // Add each connection to the commandString, and if we aren't on the last one, add a plus.
//     for (let j = 0; j < canvasConnections.length; j++) {
//       let value: any = canvasConnections[j][1];
//       commandString += `${value["fromNickname"].split("/")[1]}->${
//         value["toNickname"].split("/")[1]
//       }`;
//       if (j < canvasConnections.length - 1) {
//         commandString += `+`;
//       }
//     }
//     // If we have more connection types, string them with 'and'
//     if (i < connectionTypes.length - 1) {
//       commandString += " and ";
//     }
//   }
//
//   // Get the active predicates
//   let activePreds: any = Object.entries(
//     store.get(`projects.${projectKey}.predicates`)
//   ).filter(
//     ([key, value]: any) =>
//       value.status === "equals" || value.status === "negate"
//   );
//
//   if (activePreds.length > 0) {
//     commandString += " and ";
//   }
//
//   // Iterate over the active predicates and add them in
//   for (let i = 0; i < activePreds.length; i++) {
//     console.log(activePreds[i]);
//     if (activePreds[i][1].status === "negate") {
//       commandString += `not ${activePreds[i][0]}[${
//         activePreds[i][1].params[0].atom.split("/")[1]
//       }]`;
//     } else if (activePreds[i][1].status === "equals") {
//       commandString += `${activePreds[i][0]}[${
//         activePreds[i][1].params[0].atom.split("/")[1]
//       }]`;
//     }
//
//     if (i < activePreds.length - 1) {
//       commandString += " and ";
//     }
//   }
//
//   // Close our brackets all at the end
//   commandString += "}".repeat(commandString.split("{").length - 1);
//
//   console.log(commandString);
//   // Send command string to Alloy Analyzer
//   let reqBody = JSON.stringify({
//     path: store.get(`projects.${projectKey}.alloyFile`),
//     command: commandString,
//   });
//   const apiRequest = axios.post("http://localhost:8080/tests", reqBody, {
//     headers: { "Content-Type": "application/json" },
//   });
//   apiRequest.then((data: AxiosResponse) => {
//     if (data.data) {
//       data.data.includes("Unsatisfiable")
//         ? event.sender.send(returnChannel, "Fail")
//         : event.sender.send(returnChannel, "Pass");
//     }
//   });
// });

ipcMain.on(GET_ACTIVE_TEST, async (event, projectID: number) => {
  let project = await prisma.project.findFirst({
    where: { id: number.parse(projectID) },
  });
  if (project) {
    event.sender.send(`${GET_ACTIVE_TEST}-resp`, project.activeTab);
  }
});

ipcMain.on(SET_ACTIVE_TEST, async (event, { projectID, testName }) => {
  let activeTab = await prisma.project.update({
    where: { id: number.parse(projectID) },
    data: { activeTab: testName },
  });
  if (activeTab) {
    mainWindow.webContents.send("tabs-update");
  }
});

// ipcMain.on(
//   SET_ATOM_INSTANCE_NICKNAME,
//   (event, projectKey, testKey, atomKey, nickname) => {
//     store.set(
//       `projects.${projectKey}.tests.${testKey}.canvas.atoms.${atomKey}.nickname`,
//       nickname
//     );
//     mainWindow.webContents.send("nickname-update");
//   }
// );

/*
 * NEW TYPESAFE ipcMain Functions
 */

ipcMain.on(
  CREATE_NEW_TEST,
  async (event, projectID: number, testName: string) => {
    let result = await createNewTest(projectID, testName);
    event.sender.send("created-new-test", result);
  }
);

ipcMain.on(
  READ_TEST,
  async (event, data: { testID: number; returnKey: string }) => {
    console.log("MAIN Reading tests from ID: ", data.testID);
    const test = await prisma.test.findFirst({
      where: { id: number.parse(data.testID) },
      include: {
        atoms: {
          include: {
            srcAtom: {
              include: {
                fromRelations: true,
                toRelations: true,
                isChildOf: true,
              },
            },
          },
        },
        connections: true,
      },
    });
    event.sender.send(data.returnKey, test ? test : {});
  }
);

ipcMain.on(GET_TESTS, async (event, projectID: number) => {
  const tests = await prisma.test.findMany({
    where: { projectID: number.parse(projectID) },
  });
  event.sender.send(`${GET_TESTS}-resp`, tests ? tests : []);
});

ipcMain.on(DELETE_TEST, async (event, projectID, testID) => {
  const test = await prisma.test.delete({
    where: { id: number.parse(testID) },
  });
  // TODO: Alert client to change in tests table.
});

// TODO: This can likely be simplified to a single query
ipcMain.on(
  TEST_CAN_ADD_ATOM,
  async (
    event,
    { testID, sourceAtomID }: { testID: number; sourceAtomID: number }
  ) => {
    console.log(sourceAtomID);
    try {
      let test = await prisma.test.findFirstOrThrow({
        where: { id: number.parse(testID) },
        include: { atoms: true },
      });
      console.log("Found Test: ", test);

      let atomSource = await prisma.atomSource.findFirstOrThrow({
        where: { id: number.parse(sourceAtomID) },
      });
      console.log("Found Source: ", atomSource);

      if (atomSource.isLone || atomSource.isOne) {
        if (
          test.atoms.filter((atom: Atom) => atom.srcID === atomSource.id)
            .length > 0
        ) {
          console.log("Found an atom");
          event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: false }); // already an atom with a matching source
        }
      }

      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: true }); // No multiplicity issues, eligible atom
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        console.log(e.message);
      }

      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, {
        success: false,
        // @ts-ignore
        error: e.message,
      });
    }
  }
);

ipcMain.on(
  TEST_ADD_ATOM,
  async (
    event,
    {
      testID,
      sourceAtomID,
      top,
      left,
    }: { testID: number; sourceAtomID: number; top: number; left: number }
  ) => {
    console.log("MAIN: TEST ADDING ATOM");
    console.log(testID);
    console.log(sourceAtomID);
    let test = await prisma.test.findFirst({
      where: { id: number.parse(testID) },
    });

    let sourceAtom = await prisma.atomSource.findFirst({
      where: { id: number.parse(sourceAtomID) },
    });

    if (test && sourceAtom) {
      let atom = await prisma.atom.create({
        data: {
          testID: number.parse(testID),
          srcID: number.parse(sourceAtomID),
          top: number.parse(top),
          left: number.parse(left),
          nickname: `${sourceAtom.label} ${test.atomCount}`,
        },
      });
      console.log("ATOM CREATED");
      let updateTest = await prisma.test.update({
        where: { id: number.parse(testID) },
        data: { atomCount: { increment: 1 } },
      });
    }

    // Alert the browser to a change in state.
    mainWindow.webContents.send("canvas-update");
  }
);

ipcMain.on(
  OPEN_TEST,
  async (
    event,
    { testID, projectID }: { testID: number; projectID: number }
  ) => {
    let test = await prisma.test.update({
      where: { id: number.parse(testID) },
      data: { tabIsOpen: true },
    });
    if (test) {
      await prisma.project.update({
        where: { id: number.parse(projectID) },
        data: { activeTab: test.name },
      });
      event.sender.send(`${OPEN_TEST}-resp`, { success: true });
      mainWindow.webContents.send("tabs-update");
    }
  }
);

ipcMain.on(
  CLOSE_TEST,
  async (
    event,
    { testID, projectID }: { testID: number; projectID: number }
  ) => {
    // Close the test.
    let test = await prisma.test.update({
      where: { id: number.parse(testID) },
      data: { tabIsOpen: false },
    });

    let openTest = await prisma.test.findFirst({
      where: { tabIsOpen: true },
    });

    // Set active tab to a different test if closed test is active tab.
    if (test) {
      await prisma.project.update({
        where: { id: number.parse(projectID) },
        data: { activeTab: openTest ? openTest.name : "" },
      });

      event.sender.send(`${CLOSE_TEST}-resp`, { success: true });
      mainWindow.webContents.send("tabs-update");
    }
  }
);

ipcMain.on(
  CREATE_CONNECTION,
  async (
    event,
    {
      projectID,
      testID,
      fromAtom,
      toAtom,
    }: {
      projectID: number;
      testID: number;
      fromAtom: AtomWithSource;
      toAtom: AtomWithSource;
    }
  ) => {
    console.log("WORKING ON CONNECTION");
    console.log("pID: ", projectID);
    console.log("from: ", fromAtom);
    console.log("to: ", toAtom);
    // Find relation with fromAtom.atomSrc.label and toAtom.atomSrc.label
    const relation = await prisma.relation.findFirst({
      where: {
        projectID: number.parse(projectID),
        fromLabel: fromAtom.srcAtom.label,
        toLabel: toAtom.srcAtom.label,
      },
    });

    // 2. Check relation multiplicity
    if (relation) {
      console.log(relation.multiplicity);
      if (
        relation.multiplicity.split(" ")[0] === "lone" ||
        relation.multiplicity.split(" ")[0] === "one"
      ) {
        // 3. Find out if there are preexisting connections of that kind.
        const existingRels = await prisma.test.findFirst({
          where: { id: number.parse(testID) },
          select: {
            connections: {
              where: {
                fromLabel: relation.fromLabel,
                toLabel: relation.toLabel,
                fromID: number.parse(fromAtom.id),
                toID: number.parse(toAtom.id),
              },
            },
          },
        });

        if (existingRels && existingRels.connections.length) {
          console.log("exisitingRels: ", existingRels);
          // TODO: Return error and show notification
          return;
        }
      }
      // 4. Else, add connection.
      const connection = await prisma.connection.create({
        data: {
          fromID: number.parse(fromAtom.id),
          toID: number.parse(toAtom.id),
          fromLabel: fromAtom.srcAtom.label,
          toLabel: toAtom.srcAtom.label,
          testID: number.parse(fromAtom.testID),
        },
      });
      console.log("Connection created");

      // Alert GUI to successful connection creation and refresh test.
      if (connection) {
        event.sender.send(`${CREATE_CONNECTION}-resp`, { success: true });
        mainWindow.webContents.send("canvas-update");
      }
    }
  }
);

ipcMain.on(GET_ATOM_SOURCES, async (event, projectID: number) => {
  console.log(`Getting atoms with projectID: ${projectID}`);
  const atoms = await prisma.atomSource.findMany({
    where: { projectID: number.parse(projectID) },
    include: {
      fromRelations: true,
      isChildOf: true,
    },
  });
  event.sender.send("get-atom-sources-resp", atoms ? atoms : {});
});

ipcMain.on(CREATE_NEW_PROJECT, async (event, data: NewProject) => {
  const result = await createNewProject(data);
  projectSelectWindow.webContents.send("projects-update");
  event.sender.send("new-project-resp", result);
});

ipcMain.on(GET_PROJECT, async (event, projectID: number) => {
  const project = await prisma.project.findFirst({ where: { id: projectID } });
  event.sender.send("get-project-resp", project);
});

ipcMain.on(DELETE_PROJECT, async (event, project: Project) => {
  await fs.rmdir(project.projectPath, { recursive: true }, (err) => {
    if (err) {
      return console.log("error occurred in deleting directory", err);
    }
  });

  const delResp = await prisma.project.delete({ where: { id: project.id } });
  event.sender.send("delete-project-resp", delResp);
  projectSelectWindow.webContents.send("projects-update");
});

ipcMain.on(UPDATE_ATOM, async (event, { atomID, left, top }) => {
  const updatedAtom = await prisma.atom.update({
    where: { id: number.parse(atomID) },
    data: { left: number.parse(left), top: number.parse(top) },
  });

  if (updatedAtom) {
    console.log("Updated Atom");
    mainWindow.webContents.send("canvas-update");
  }
});

ipcMain.on(GET_ATOM_SOURCE, async (event, { srcAtomID }) => {
  const atom = await prisma.atomSource.findFirst({
    where: { id: number.parse(srcAtomID) },
    include: {
      fromRelations: true,
      toRelations: true,
      isChildOf: true,
    },
  });
  event.sender.send(`${GET_ATOM_SOURCE}-resp`, atom ? atom : {});
});

ipcMain.on(SET_ATOM_COLOR, async (event, { sourceAtomID, color }: SetColor) => {
  const number = z.coerce.number();
  const update = await prisma.atomSource.update({
    where: { id: number.parse(sourceAtomID) },
    data: { color: color },
  });

  if (update) {
    mainWindow.webContents.send("meta-data-update");
  }
});
