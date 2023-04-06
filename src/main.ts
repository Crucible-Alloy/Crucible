declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const PROJECT_WINDOW_WEBPACK_ENTRY: string;
declare const PROJECT_WINDOW_PRELOAD_WEBPACK_ENTRY: string;


import { BrowserWindow, shell , app, ipcMain, dialog, Menu, session } from "electron";
import { ChildProcessWithoutNullStreams } from "child_process";
import axios, { AxiosResponse } from "axios";
import * as child_process from "child_process";
import { z, ZodError } from "zod";
import { Atom, PredInstance, PredParam, Prisma, Project, Test, PrismaClient } from "@prisma/client";
import {
  AtomRespSchema,
  NewProject,
  NewProjectSchema,
  NewTest,
  NewTestSchema,
  ValidAtomResp,
  ValidPredResp,
} from "./validation/formValidation";
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
  GET_ATOM_SHAPE,
  SET_ATOM_SHAPE,
  SET_ATOM_INSTANCE_NICKNAME,
  OPEN_TEST,
  TEST_ADD_ATOM,
  TEST_CAN_ADD_ATOM,
  READ_TEST,
  GET_ACTIVE_TEST,
  UPDATE_PRED_STATE,
  UPDATE_PRED_PARAM,
  GET_PARENTS,
  GET_CHILDREN,
  GET_TO_RELATIONS,
} from "./utils/constants";

import unhandled from "electron-unhandled";
unhandled();

const treeKill = require("tree-kill");
const path = require("path");
const fs = require("fs");
const os = require("os");

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

let selectedProject = -1;

export type TestWithCanvas = Prisma.TestGetPayload<{
  include: {
    atoms: {
      include: {
        srcAtom: {
          include: {
            isChildOf: true;
            fromRelations: {
              include: {
                fromAtom: {
                  include: {
                    isChildOf: true;
                  };
                };
              };
            };
            toRelations: {
              include: {
                fromAtom: true;
              };
            };
          };
        };
      };
    };
    connections: true;
  };
}>;
export type PredInstanceWithParams = Prisma.PredInstanceGetPayload<{
  include: {
    params: {
      include: {
        param: true;
      };
    };
    predicate: true;
  };
}>;
export type PredWithParams = Prisma.PredicateGetPayload<{
  include: {
    params: true;
  };
}>;
export type PredParamWithSource = Prisma.PredInstanceParamsGetPayload<{
  include: {
    param: true;
  };
}>;
export type AtomWithSource = Prisma.AtomGetPayload<{
  include: {
    srcAtom: {
      include: {
        isChildOf: true;
        fromRelations: {
          include: {
            fromAtom: {
              include: {
                isChildOf: true;
              };
            };
          };
        };
        toRelations: {
          include: {
            fromAtom: true;
          };
        };
      };
    };
  };
}>;
export type AtomSourceWithRelations = Prisma.AtomSourceGetPayload<{
  include: {
    isChildOf: true;
    fromRelations: {
      include: {
        fromAtom: {
          include: {
            isChildOf: true;
          };
        };
      };
    };
    toRelations: {
      include: {
        fromAtom: true;
      };
    };
  };
}>;

// Global window variable
let mainWindow: BrowserWindow, projectSelectWindow: BrowserWindow;

// Number/Boolean coercion helper because ipc encodes numbers as strings.
const number = z.coerce.number();
const bool = z.coerce.boolean();

const isDev = true;
let prisma: PrismaClient;

if (isDev) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(__dirname, 'native_modules', 'client', 'query_engine-darwin.dylib.node');
  prisma = new PrismaClient();

} else {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(__dirname, 'native_modules', 'client', 'query_engine-darwin.dylib.node');

  prisma = new PrismaClient({datasources: {
      db: {
        url: `file:${path.join(process.resourcesPath, 'prisma/dev.db')}`,
      },
    }});
}


let springAPI: ChildProcessWithoutNullStreams;
const isMac = true;

async function createNewTest(
  projectID: number,
  testName: string
): Promise<{ success: boolean; error?: any; test?: Test }> {
  // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
  // Validate data. If there is an error, return it to the client.
  const validationResp = await validateNewTest({ testName, projectID });
  if (!validationResp.success) {
    console.log(validationResp);
    return validationResp;
  }

  const project = await prisma.project.findFirst({
    where: { id: number.parse(projectID) },
  });
  if (project) {
    const testFilePath = path.join(project.projectPath, `tests/${testName}.txt`);

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
    }

    const testPredicates = await buildTestPredicates(projectID, newTest.id);
    if (testPredicates.success) {
      return { success: true, error: null, test: newTest };
    } else {
      return { success: false, error: "Could not init test predicates" };
    }
  }
  return { success: false, error: "Could not create test." };
}

async function buildTestPredicates(projectID: number, newTestID: number) {
  // Fetch the project predicates and their params.
  const predicates = await prisma.predicate.findMany({
    where: { projectID: projectID },
    include: { params: true },
  });

  const newPredParamInstance = async (
    param: PredParam,
    newPred: PredInstance
  ) => {
    console.log("Creating new param: ", param);
    await prisma.predInstanceParams.create({
      data: { predInstID: newPred.id, predParamID: param.id },
    });
  };

  const newPredInstance = async (predicate: PredWithParams) => {
    console.log("Creating new predicate: ", predicate.name);
    const predInstance = await prisma.predInstance.create({
      data: { predID: predicate.id, testID: newTestID, state: null },
    });

    if (predInstance) {
      predicate.params.forEach((param) => {
        newPredParamInstance(param, predInstance);
      });
    }
  };

  if (predicates) {
    console.log(predicates);
    try {
      // For each project predicate, create an instance of it associated to the test
      predicates.forEach((predicate) => {
        newPredInstance(predicate);
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        console.log(e.message);
        return { success: false, error: e.message };
      }
    }
  }
  return { success: true, error: null };
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
  const colors = getColorArray();

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
    const selectedColor = colors.splice(
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
          .split("->")[relation.type.split("->").length - 1].split("}")[0];
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

    const resp: AxiosResponse<{
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
async function createNewProject(data: NewProject): Promise<{success?: boolean, error?: any, projectID?: number}> {
  // Validate data. If there is an error, return it to the client.
  const validationResp = await validateNewProject(data);
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
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: PROJECT_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
  });

  projectSelectWindow.loadURL(
    PROJECT_WINDOW_WEBPACK_ENTRY
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
      contextIsolation: true, // must be set to true when contextBridge is enabled
      nodeIntegration: false,
      sandbox: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    //titleBarStyle: "hiddenInset",
  });

  //Load index.html
  mainWindow.loadURL(
      MAIN_WINDOW_WEBPACK_ENTRY
  ).then(() => {
    selectedProject = projectID;
  });


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
  const jarPath = `${path.join(__dirname, "/src/JARs/aSketch-API.jar")}`
  console.log(jarPath);
  springAPI = child_process.spawn("java", ["-jar", jarPath, ""], {shell: true}).on('error', (error) => {throw error});
  springAPI.stdout.on('data', (data) => {
    // This will be called with err being an AbortError if the controller aborts
    console.log("Out: ", data)
  });
  springAPI.stderr.on('data', (data) => {
    // This will be called with err being an AbortError if the controller aborts
    console.log("Error: ", data)
  });
  springAPI.on('close', (close)=>{
    console.log("Close: ", close)
  })
}

// After initialization, create new browser window.
// Some APIs only available after this call.
app.whenReady().then(() => {
  deployAlloyAPI().then(() => {
    createASketchMenu();
    createProjectSelectWindow();

    // on macOS
    // const reactDevToolsPath = path.join(
    //   os.homedir(),
    //   "/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0"
    // );

    app.whenReady().then(async () => {
      // await session.defaultSession.loadExtension(reactDevToolsPath);
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
    treeKill(springAPI.pid);
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
  const homedir = os.homedir();
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

ipcMain.on(
  RUN_TEST,
  async (
    event,
    { projectID, testID }: { projectID: number; testID: number }
  ) => {
    // some disj List0: List {some disj Node1, Node2: Node {List = List0 and Node = Node1+Node2 and header=List0->Node1 and link=Node1->Node2 and Acyclic[List0]}}
    let cmd = "";
    console.log(testID);
    const test = await prisma.test.findFirst({
      where: { id: number.parse(testID) },
      include: {
        atoms: { include: { srcAtom: true } },
        connections: {
          include: { connLabel: true, to: true, from: true },
        },
        project: true,
      },
    });

    if (!test) {
      console.log("Test not found!");
      return;
    }

    const atomTypes = new Set<string>();
    const connectionTypes = new Set<string>();
    test.atoms.forEach((atom) => atomTypes.add(atom.srcAtom.label));
    test.connections.forEach((conn) =>
      connectionTypes.add(conn.connLabel.label)
    );
    const connTypeArr = [...connectionTypes];
    const atomTypeArr = [...atomTypes];

    // For each type in the test, add its atoms to the command string.
    for (let i = 0; i < atomTypeArr.length; i++) {
      const type = atomTypeArr[i];
      cmd += "some disj";
      const atoms = test.atoms.filter((atom) => atom.srcAtom.label === type);
      for (let j = 0; j < atoms.length; j++) {
        const atom = atoms[j];
        cmd += ` ${atom.nickname.replace(" ", "")}`;
        if (j < atoms.length - 1) cmd += ",";
      }
      cmd += `: ${type.split("/")[1]} {`;
    }

    // Each set equals these atoms and only these atoms.
    for (let i = 0; i < atomTypeArr.length; i++) {
      const type = atomTypeArr[i];
      cmd += `${type.split("/")[1]}=`;
      const atoms = test.atoms.filter((atom) => atom.srcAtom.label === type);
      for (let j = 0; j < atoms.length; j++) {
        const atom = atoms[j];
        cmd += `${atom.nickname.replace(" ", "")}`;
        if (j < atoms.length - 1) cmd += "+";
      }
      if (i < atomTypeArr.length - 1) cmd += ` and `;
    }

    // Now the connections
    for (let i = 0; i < connTypeArr.length; i++) {
      const type = connTypeArr[i];
      cmd += ` and ${type}=`;
      const connections = test.connections.filter(
        (conn) => conn.connLabel.label === type
      );
      for (let j = 0; j < connections.length; j++) {
        const conn = connections[j];
        cmd += `${conn.from.nickname.replace(
          " ",
          ""
        )}->${conn.to.nickname.replace(" ", "")}`;
        if (j < connections.length - 1) cmd += "+";
      }
    }

    console.log("getting preds");
    // Now the predicates
    const preds = await prisma.predInstance.findMany({
      where: {
        testID: testID,
        NOT: {
          state: null,
        },
      },
      include: {
        params: true,
        predicate: true,
      },
    });

    if (!preds) {
      // Run command
    }

    for (let i = 0; i < preds.length; i++) {
      console.log("in preds loop");
      const pred = preds[i];
      cmd += pred.state ? " and " : " and not ";
      cmd += `${pred.predicate.name.split("/")[1]}[`;
      for (let j = 0; j < pred.params.length; j++) {
        const param = pred.params[j];
        const atomNick = test.atoms.filter((atom) => atom.id === param.atom);
        console.log(atomNick);
        cmd += `${atomNick[0].nickname}`;
        if (j < pred.params.length - 1) cmd += ",";
      }
      cmd += "]";
      if (i < preds.length - 1) cmd += " ";
    }

    // Close brackets
    cmd += "}".repeat(cmd.split("{").length - 1);
    console.log(cmd);
    console.log(test.project.alloyFile);
    const reqBody = JSON.stringify({
      path: test.project.alloyFile,
      command: cmd,
    });

    const apiRequest = axios.post("http://localhost:8080/tests", reqBody, {
      headers: { "Content-Type": "application/json" },
    });

    apiRequest.then((data: AxiosResponse) => {
      if (data.data) {
        data.data.includes("Unsatisfiable")
          ? event.sender.send(`${RUN_TEST}-${testID}-resp`, "Fail")
          : event.sender.send(`${RUN_TEST}-${testID}-resp`, "Pass");
      }
    });

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
  }
);

ipcMain.on(GET_ACTIVE_TEST, async (event, projectID: number) => {
  const project = await prisma.project.findFirst({
    where: { id: number.parse(projectID) },
  });
  if (project) {
    event.sender.send(`${GET_ACTIVE_TEST}-resp`, project.activeTab);
  }
});

ipcMain.on(SET_ACTIVE_TEST, async (event, { projectID, testName }) => {
  const activeTab = await prisma.project.update({
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
    const result = await createNewTest(projectID, testName);
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
                fromRelations: {
                  include: { fromAtom: { include: { isChildOf: true } } },
                },
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
  console.log("MAIN GETTING TESTS");
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
      const test = await prisma.test.findFirstOrThrow({
        where: { id: number.parse(testID) },
        include: { atoms: true },
      });
      console.log("Found Test: ", test);

      const atomSource = await prisma.atomSource.findFirstOrThrow({
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
    const test = await prisma.test.findFirst({
      where: { id: number.parse(testID) },
    });

    const sourceAtom = await prisma.atomSource.findFirst({
      where: { id: number.parse(sourceAtomID) },
    });

    if (test && sourceAtom) {
      const atom = await prisma.atom.create({
        data: {
          testID: number.parse(testID),
          srcID: number.parse(sourceAtomID),
          top: number.parse(top),
          left: number.parse(left),
          nickname: `${sourceAtom.label.split("/")[1]}${test.atomCount}`,
        },
      });
      console.log("ATOM CREATED");
      const updateTest = await prisma.test.update({
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
    const test = await prisma.test.update({
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
    const test = await prisma.test.update({
      where: { id: number.parse(testID) },
      data: { tabIsOpen: false },
    });

    const openTest = await prisma.test.findFirst({
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
    const relations = await prisma.relation.findMany({
      where: {
        projectID: number.parse(projectID),
        fromLabel: fromAtom.srcAtom.label,
        toLabel: {
          in: [
            toAtom.srcAtom.label,
            ...toAtom.srcAtom.isChildOf.map((rel) => rel.parentLabel),
          ],
        },
      },
    });
    console.log(relations);
    // 2. Check relation multiplicity
    if (relations.length === 1) {
      console.log(relations[0].multiplicity);
      if (
        relations[0].multiplicity.split(" ")[0] === "lone" ||
        relations[0].multiplicity.split(" ")[0] === "one"
      ) {
        // 3. Find out if there are preexisting connections of that kind.
        const existingRels = await prisma.test.findFirst({
          where: { id: number.parse(testID) },
          select: {
            connections: {
              where: {
                fromLabel: relations[0].fromLabel,
                toLabel: relations[0].toLabel,
                fromID: number.parse(fromAtom.id),
              },
            },
          },
        });

        if (existingRels && existingRels.connections.length) {
          console.log("existingRels: ", existingRels);
          event.sender.send(`${CREATE_CONNECTION}-resp`, { success: false });
          return;
        }
      }
      // 4. Else, add connection.
      const connection = await prisma.connection.create({
        data: {
          fromID: number.parse(fromAtom.id),
          toID: number.parse(toAtom.id),
          fromLabel: relations[0].fromLabel,
          toLabel: relations[0].toLabel,
          projectID: number.parse(projectID),
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

    if (relations.length > 1) {
      console.log("CONNECTION ERROR: More than one viable connection.");
      event.sender.send(`${CREATE_CONNECTION}-resp`, { success: false });
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
  await fs.rmdir(project.projectPath, { recursive: true }, (err: any) => {
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
  const update = await prisma.atomSource.update({
    where: { id: number.parse(sourceAtomID) },
    data: { color: color },
  });

  if (update) {
    mainWindow.webContents.send("canvas-update");
  }
});

ipcMain.on(GET_PREDICATES, async (event, testID: number) => {
  const predicates: PredInstanceWithParams[] =
    await prisma.predInstance.findMany({
      where: { testID: number.parse(testID) },
      include: {
        params: {
          include: {
            param: true,
          },
        },
        predicate: true,
      },
    });
  event.sender.send(`${GET_PREDICATES}-resp`, predicates ? predicates : []);
});

ipcMain.on(
  UPDATE_PRED_STATE,
  async (
    event,
    { predicateID, state }: { predicateID: number; state: boolean | null }
  ) => {
    console.log("MAIN: Updating predicate State");
    console.log(state);
    const update = await prisma.predInstance.update({
      where: { id: number.parse(predicateID) },
      data: { state: state },
      include: {
        params: true,
      },
    });

    if (update) {
      mainWindow.webContents.send("predicates-update");
    }
  }
);

ipcMain.on(
  UPDATE_PRED_PARAM,
  async (
    event,
    { predParamID, atomID }: { predParamID: number; atomID: number }
  ) => {
    console.log("MAIN: Updating predicate parameter");

    const update = await prisma.predInstanceParams.update({
      where: { id: number.parse(predParamID) },
      data: { atom: number.parse(atomID) },
    });

    if (update) {
      mainWindow.webContents.send("predicates-update");
    }
  }
);

ipcMain.on(GET_PARENTS, async (event, srcAtomID: number) => {
  const srcAtom = await prisma.atomSource.findFirst({
    where: { id: srcAtomID },
    include: { isChildOf: true },
  });
  if (srcAtom && srcAtom.isChildOf.length > 0) {
    event.sender.send(
      `${GET_PARENTS}-${srcAtomID}-resp`,
      srcAtom.isChildOf.map((parent) => parent.childLabel)
    );
  }
});

ipcMain.on(
  GET_CHILDREN,
  async (event, { label, projectID }: { label: string; projectID: number }) => {
    const srcAtom = await prisma.atomSource.findFirst({
      where: { label: label, projectID: number.parse(projectID) },
      include: { isParentOf: true },
    });
    if (srcAtom && srcAtom.isParentOf.length > 0) {
      event.sender.send(
        `${GET_PARENTS}-${label}-resp`,
        srcAtom.isParentOf.map((child) => child.childLabel)
      );
    }
  }
);

ipcMain.on(
  GET_TO_RELATIONS,
  async (event, { label, projectID }: { label: string; projectID: number }) => {
    const relations = await prisma.relation.findMany({
      where: { toLabel: label, projectID: number.parse(projectID) },
    });
    if (relations) {
      event.sender.send(`${GET_TO_RELATIONS}-${label}-resp`, relations);
    }
  }
);

ipcMain.on('get-active-project', async (event) => {
  if (mainWindow)
   event.sender.send('get-active-project-resp', selectedProject)
  }
);
