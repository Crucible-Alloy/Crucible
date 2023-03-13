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

// Import ipcMain API so that it loads and listeners are created.
// import * as ipcMainProjects from "./ipc/projects";
import * as ipcMainAtoms from "./ipc/atoms";
import * as ipcMaintests from "./ipc/tests";

import { PrismaClient } from "@prisma/client";
import path from "path";
import { app, ipcMain, dialog, Menu, session } from "electron";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import fs from "fs";
import {
  CLOSE_TEST,
  DELETE_PROJECT,
  GET_ATOM_SOURCES,
  GET_PROJECT,
  VALIDATE_NEW_PROJECT_FORM,
} from "../src/utils/constants";

const prisma = new PrismaClient();

// Global window variable
let mainWindow: BrowserWindow, projectSelectWindow: BrowserWindow;

// State persistence constants.
const {
  FETCH_DATA_FROM_STORAGE,
  HANDLE_FETCH_DATA,
  SAVE_CANVAS_STATE,
  GET_CANVAS,
  UPDATE_PROJECT_FILE,
  GET_PROJECT_FILE,
  GET_ATOMS,
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
  GET_RELATION_MULTIPLICITY,
  GET_RELATIONS,
  GET_CONNECTION,
  GET_CONNECTIONS,
  RUN_TEST,
  GET_PROJECT_TABS,
  SET_PROJECT_TABS,
  OPEN_AND_SET_ACTIVE,
  SET_ACTIVE_TAB,
  CLOSE_TAB,
  DELETE_TEST,
  CREATE_ATOM,
  GET_ATOM,
  GET_PREDICATES,
  SET_PREDICATE_TEST,
  GET_ATOM_SHAPE,
  SET_ATOM_SHAPE,
  GET_ATOM_INSTANCE,
  SET_ATOM_INSTANCE_NICKNAME,
  OPEN_TEST,
  TEST_ADD_ATOM,
  TEST_CAN_ADD_ATOM,
  READ_TEST,
  GET_ACTIVE_TAB,
} = require("../src/utils/constants");

let itemsToTrack;

const number = z.coerce.number();

const Store = require("electron-store");
const os = require("os");

let store = new Store();

const isDev = true;
let springAPI: ChildProcessWithoutNullStreams;
let isMac = true;

// if (require("electron-is-dev")) {
//     app.quit();
// }

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

// function createNewFolder(folder:string) {
//   try {
//     if (!fs.existsSync(folder)) {
//       fs.mkdirSync(folder, { recursive: true });
//     }
//   } catch (err) {
//     console.log("Error creating directory:", err);
//   }
// }

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

// TODO: Refactor to get rid of any types and make typesafe.
// function initProjectData(filePath: string, projectID: number) {
//   let colors = getColorArray();
//   let atomData: any = {};
//   let predicateData: any = {};
//
//   try {
//     // Send file to alloy API and get back metadata
//     const apiRequest = axios.post("http://localhost:8080/files", null, {
//       params: { filePath: filePath },
//     });
//     apiRequest
//       .then((data: AxiosResponse) => {
//         if (data.data) {
//           console.log(data.data);
//           for (const atom in data.data["atoms"]) {
//             // If colors array is empty, repopulate it.
//             if (!colors.length) {
//               colors = getColorArray();
//             }
//             // Pop a random color from the colors array and assign to the atom
//             data.data["atoms"][atom]["color"] = colors.splice(
//               Math.floor(Math.random() * colors.length),
//               1
//             )[0];
//
//             // Set the shape of the atom.
//             data.data["atoms"][atom]["shape"] = "rectangle";
//
//             atomData[uuidv4()] = data.data["atoms"][atom];
//           }
//
//           // Post-processing on the relations information for multiplicity enforcement
//           for (const [key, atom] of Object.entries(atomData)) {
//             // Get the multiplicity and related atom label from the response returned to the API
//             //@ts-ignore
//             atom["relations"].forEach(function (item) {
//               let multiplicity = item["multiplicity"].split(" ")[0];
//               let relationFromLabel = item["type"].split("->")[0].split("{")[1];
//               let relationToLabel = item["type"].split("->")[1].split("}")[0];
//
//               // Overwrite the multiplicity key and set related_label
//               item["multiplicity"] = multiplicity;
//               item["toLabel"] = relationToLabel;
//               item["fromLabel"] = relationFromLabel;
//
//               // Find the related atom key
//
//               for (const [key, value] of Object.entries(atomData)) {
//                 //@ts-ignore
//                 if (value["label"] === relationToLabel) {
//                   item["toKey"] = key;
//                   //@ts-ignore
//                 } else if (value["label"] === relationFromLabel) {
//                   item["fromKey"] = key;
//                 }
//               }
//             });
//           }
//
//           let preds = data.data.functions;
//
//           // Status can be 'null', 'equals', or 'negate'
//           preds.forEach((predicate: any) => {
//             predicateData[predicate["label"].split("/").at(-1)] = {
//               status: "null",
//               params: predicate["parameters"],
//             };
//           });
//
//           Object.values(predicateData).forEach((predicate: any) => {
//             predicate.params.forEach((param: any) => {
//               param.atom = "null";
//             });
//           });
//         }
//       })
//       .then(() => {
//         // Write all atom data to the project
//         store.set(`projects.${projectID}.atoms`, atomData);
//         store.set(`projects.${projectID}.predicates`, predicateData);
//       });
//   } catch (err) {
//     console.log(err);
//   }
// }

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

ipcMain.on(SAVE_CANVAS_STATE, (event, canvasItems, projectKey, testKey) => {
  console.log(
    "Main Received: SAVE_CANVAS_STATE with: ",
    canvasItems,
    projectKey,
    testKey
  );
  store.set(`projects.${projectKey}.tests.${testKey}.canvas`, canvasItems);
});

ipcMain.on(GET_PROJECT_FILE, (event, projectKey) => {
  //console.log("MAIN: GET_PROJECT_FILE");
  let projectFile = store.get(`projects.${projectKey}.path`);
  event.sender.send("got-project-file", projectFile ? projectFile : null);
});

// ipcMain.on(UPDATE_PROJECT_FILE, (event, projectKey) => {
//   //console.log("Main Received: SET_MAIN_PROJECT_FILE")
//
//   dialog
//     .showOpenDialog({
//       title: "Select Project File",
//       filters: [
//         { name: "Alloy Files", extensions: ["als"] },
//         { name: "Any File", extensions: ["*"] },
//       ],
//       properties: ["openFile"],
//     })
//     .then(function (response) {
//       if (!response.canceled) {
//         console.log(response.filePaths[0]);
//
//         store.set(`projects.${projectKey}.path`, response.filePaths[0]);
//         initProjectData(response.filePaths[0], projectKey);
//
//         event.reply("project-file-set", response.filePaths[0]);
//       } else {
//         event.reply("project-file-set", null);
//       }
//     });
// });

ipcMain.on(
  GET_ATOM_INSTANCE,
  (event, projectKey, testKey, atomKey, returnChannel) => {
    let atom = store.get(
      `projects.${projectKey}.tests.${testKey}.canvas.atoms.${atomKey}`
    );
    event.sender.send(returnChannel, atom);
  }
);

// Returns all projects in database
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

ipcMain.on(
  GET_ATOM_COLOR,
  (event, projectKey, atomSourceKey, returnChannel) => {
    let loadedColor = store.get(
      `projects.${projectKey}.atoms.${atomSourceKey}.color`
    );
    event.sender.send(returnChannel, loadedColor);
  }
);

ipcMain.on(GET_ATOM_LABEL, (event, projectKey, atomKey, returnChannel) => {
  let atomLabel = store.get(`projects.${projectKey}.atoms.${atomKey}.label`);
  event.sender.send(returnChannel, atomLabel ? atomLabel : "No Label");
});

ipcMain.on(
  GET_ATOM_MULTIPLICITY,
  (event, projectKey, atomKey, returnChannel) => {
    const keys = ["isLone", "isOne", "isSome"];
    let returnValue = null;
    keys.forEach((key, i) => {
      if (
        store.get(`projects.${projectKey}.atoms.${atomKey}.${key}`) !== null
      ) {
        //console.log(`MAIN FOUND MULTIPLICITY: ${key}`)
        returnValue = key;
      }
    });
    event.sender.send(returnChannel, returnValue);
  }
);

ipcMain.on(DELETE_ATOM, (event, projectKey, testKey, atomID) => {
  // store.delete(
  //   `projects.${projectKey}.tests.${testKey}.canvas.atoms.${atomID}`
  // );
  // let connections = store.get(
  //   `projects.${projectKey}.tests.${testKey}.canvas.connections`
  // );
  // Object.entries(connections).map(([key, value]) => {
  //   if (value["from"] === atomID) {
  //     store.delete(
  //       `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
  //     );
  //   } else if (value["to"] === atomID) {
  //     store.delete(
  //       `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
  //     );
  //   }
  // });
  // let canvasState = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
  // event.sender.send("deleted-atom", canvasState);
  // mainWindow.webContents.send("canvas-update");
});

ipcMain.on(DELETE_CONNECTION, (event, projectKey, testKey, atomID) => {
  // let connections = store.get(
  //   `projects.${projectKey}.tests.${testKey}.canvas.connections`
  // );
  // Object.entries(connections).map(([key, value]) => {
  //   if (value["from"] === atomID) {
  //     store.delete(
  //       `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
  //     );
  //   }
  // });
  // let canvasState = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
  // event.sender.send("deleted-connection", canvasState);
  // mainWindow.webContents.send("canvas-update");
});

// ipcMain.on(
//   CREATE_CONNECTION,
//   (
//     event,
//     projectKey,
//     testKey,
//     fromAtom,
//     toAtom,
//     fromAtomLabel,
//     toAtomLabel,
//     fromNickname,
//     toNickname,
//     connectionLabel
//   ) => {
//     let connectionId = uuidv4();
//     let connection = {
//       from: fromAtom,
//       to: toAtom,
//       fromLabel: fromAtomLabel,
//       toLabel: toAtomLabel,
//       fromNickname: fromNickname,
//       toNickname: toNickname,
//       connectionLabel: connectionLabel,
//     };
//     console.log(connection);
//     // Todo: Get relation label based on sourceAtomKeys?
//     //  Filter relations down based to toLabel compared to relatedLabel
//
//     store.set(
//       `projects.${projectKey}.tests.${testKey}.canvas.connections.${connectionId}`,
//       connection
//     );
//
//     mainWindow.webContents.send("canvas-update");
//   }
// );

// TODO: Get rid of any types
ipcMain.on(
  GET_ACCEPT_TYPES,
  (event, projectKey, sourceAtomKey, returnChannel) => {
    const atoms = store.get(`projects.${projectKey}.atoms`);
    let types: any = [];
    let typesLabels: any = [];
    const sourceAtom = store.get(
      `projects.${projectKey}.atoms.${sourceAtomKey}`
    );
    // for atom in Atom
    // for relation in relations
    // if atom related to sourceAtomKey
    // accept type found
    // atom.label added to the types array
    // if atom has children, add children to accept types

    let targetLabels = [sourceAtom.label, ...sourceAtom.parents];
    console.log(`Target Labels: ${targetLabels}`);

    Object.entries(atoms).map(([key, atom]: [key: any, atom: any]) => {
      if (atom["relations"]) {
        Object.entries(atom["relations"]).map(
          ([relationKey, relation]: [relationKey: any, relation: any]) => {
            targetLabels.forEach((label: any) => {
              if (relation["toLabel"] === label) {
                types.push(key);
              }
            });
          }
        );
      }
    });

    types.forEach(function (x: any) {
      typesLabels.push(store.get(`projects.${projectKey}.atoms.${x}.label`));
    });

    event.sender.send(returnChannel, typesLabels);
  }
);

ipcMain.on(GET_RELATIONS, (event, projectKey, sourceAtomKey, returnChannel) => {
  const relations = store.get(
    `projects.${projectKey}.atoms.${sourceAtomKey}.relations`
  );
  event.sender.send(returnChannel, relations);
});

ipcMain.on(
  GET_CONNECTIONS,
  (event, projectKey, testKey, atomKey, returnChannel) => {
    const connections = store.get(
      `projects.${projectKey}.tests.${testKey}.canvas.connections`
    );
    //@ts-ignore
    const foundConnections = [];
    Object.entries(connections).map(([key, value]) => {
      //@ts-ignore
      if (value["from"] === atomKey) {
        foundConnections.push(value);
      }
    });
    //@ts-ignore
    event.sender.send(returnChannel, foundConnections);
  }
);

ipcMain.on(RUN_TEST, (event, projectKey, testKey, returnChannel) => {
  let canvas = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
  let atoms = store.get(`projects.${projectKey}.atoms`);
  let commandString = "";
  let atomsWithIndexes = {};

  // Type assignment
  // For atomType in project.Atom
  Object.entries(atoms).map(([sourceAtomKey, sourceAtom]: any) => {
    // // Assign each atom a numeral for use in command string
    // Object.entries(canvas["Atom"]).map(([canvasAtomKey, canvasAtom], index) => {
    //   atomsWithIndexes[canvasAtomKey] = index;
    // })

    // For atom in canvas where type matches atomType
    commandString += "some disj";
    let atomsOfType: any = Object.entries(canvas["atoms"]).filter(
      ([canvasAtomKey, canvasAtom]: any) =>
        sourceAtomKey === canvasAtom["sourceAtomKey"]
    );
    for (let i = 0; i < atomsOfType.length; i++) {
      console.log(atomsOfType[i][1].nickname);
      commandString += ` ${atomsOfType[i][1].nickname.split("/")[1]}`;
      if (i < atomsOfType.length - 1) {
        commandString += ",";
      }
    }
    commandString += `: ${sourceAtom["label"].split("/")[1]} {`;
  });

  // Set equals these Atom and only these Atom.
  // For each type of atom in our project.
  Object.entries(atoms).map(([sourceAtomKey, sourceAtom]: any) => {
    commandString += `${sourceAtom["label"].split("/")[1]} = `;
    // Get Atom on the canvas with a matching type.
    let matchedAtoms: any = Object.entries(canvas["atoms"]).filter(
      ([key, value]: any) => sourceAtomKey === value["sourceAtomKey"]
    );
    // console.log(matchedAtoms)
    // For each matching atom, append their nickname to the string
    for (let i = 0; i < matchedAtoms.length; i++) {
      commandString += `${matchedAtoms[i][1].nickname.split("/")[1]} `;
      if (i < matchedAtoms.length - 1) {
        commandString += "+ ";
      }
    }
    commandString += ` and `;
  });

  // Get a list of the unique connection types in the canvas
  let connectionTypes = [
    ...new Set(
      Object.entries(canvas["connections"]).map(
        (value: any) => value[1]["connectionLabel"]
      )
    ),
  ];

  // Iterate over the found connection types
  for (let i = 0; i < connectionTypes.length; i++) {
    commandString += `${connectionTypes[i]}=`;
    // Filter our canvas connections down to just the ones that match the current connection type
    let canvasConnections = Object.entries(canvas["connections"]).filter(
      ([key, value]: any) => value["connectionLabel"] === connectionTypes[i]
    );
    // Add each connection to the commandString, and if we aren't on the last one, add a plus.
    for (let j = 0; j < canvasConnections.length; j++) {
      let value: any = canvasConnections[j][1];
      commandString += `${value["fromNickname"].split("/")[1]}->${
        value["toNickname"].split("/")[1]
      }`;
      if (j < canvasConnections.length - 1) {
        commandString += `+`;
      }
    }
    // If we have more connection types, string them with 'and'
    if (i < connectionTypes.length - 1) {
      commandString += " and ";
    }
  }

  // Get the active predicates
  let activePreds: any = Object.entries(
    store.get(`projects.${projectKey}.predicates`)
  ).filter(
    ([key, value]: any) =>
      value.status === "equals" || value.status === "negate"
  );

  if (activePreds.length > 0) {
    commandString += " and ";
  }

  // Iterate over the active predicates and add them in
  for (let i = 0; i < activePreds.length; i++) {
    console.log(activePreds[i]);
    if (activePreds[i][1].status === "negate") {
      commandString += `not ${activePreds[i][0]}[${
        activePreds[i][1].params[0].atom.split("/")[1]
      }]`;
    } else if (activePreds[i][1].status === "equals") {
      commandString += `${activePreds[i][0]}[${
        activePreds[i][1].params[0].atom.split("/")[1]
      }]`;
    }

    if (i < activePreds.length - 1) {
      commandString += " and ";
    }
  }

  // Close our brackets all at the end
  commandString += "}".repeat(commandString.split("{").length - 1);

  console.log(commandString);
  // Send command string to Alloy Analyzer
  let reqBody = JSON.stringify({
    path: store.get(`projects.${projectKey}.alloyFile`),
    command: commandString,
  });
  const apiRequest = axios.post("http://localhost:8080/tests", reqBody, {
    headers: { "Content-Type": "application/json" },
  });
  apiRequest.then((data: AxiosResponse) => {
    if (data.data) {
      data.data.includes("Unsatisfiable")
        ? event.sender.send(returnChannel, "Fail")
        : event.sender.send(returnChannel, "Pass");
    }
  });
});

ipcMain.on(GET_ACTIVE_TAB, async (event, { projectID, testName }) => {
  let project = await prisma.project.findFirst({
    where: { id: projectID },
  });
  if (project) {
    event.sender.send(`${GET_ACTIVE_TAB}-resp`, project.activeTab);
  }
});

ipcMain.on(SET_ACTIVE_TAB, async (event, { projectID, testName }) => {
  let activeTab = await prisma.project.update({
    where: { id: projectID },
    data: { activeTab: testName },
  });
  if (activeTab) {
    mainWindow.webContents.send("tabs-update");
  }
});

// ipcMain.on(OPEN_AND_SET_ACTIVE, (event, projectKey, newTab) => {
//   console.log("OPEN_AND_SET_ACTIVE");
//   let tabData = { testKey: newTab.testKey, name: newTab.name };
//   let activeTab = store.get(`projects.${projectKey}.activeTab`);
//   let projectTabs = store.get(`projects.${projectKey}.tabs`);
//
//   // If there is no tab with a matching name already, push the new tab and store
//   if (projectTabs.filter((tab) => newTab.name === tab.name).length === 0) {
//     projectTabs.push(tabData);
//     store.set(`projects.${projectKey}.tabs`, projectTabs);
//     store.set(`projects.${projectKey}.activeTab`, newTab.name);
//     mainWindow.webContents.send("tabs-update");
//   } else if (activeTab.name !== newTab) {
//     store.set(`projects.${projectKey}.activeTab`, newTab.name);
//     mainWindow.webContents.send("tabs-update");
//   }
// });

ipcMain.on(CLOSE_TAB, async (event, { testID }) => {
  let tab = await prisma.test.update({
    where: { id: testID },
    data: { tabIsOpen: false },
  });
  if (tab) {
    mainWindow.webContents.send("tabs-update");
  }
});

ipcMain.on(CREATE_ATOM, (event, projectKey, testKey, atomKey, atom) => {
  // Count up Atom of atomType and add nickname with count appended to it.
  let canvas = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);

  if (!(atomKey in canvas.atoms)) {
    atom["nickname"] = `${atom.atomLabel}${canvas.atomCount}`;
    canvas.atomCount++;
  }

  canvas.atoms[atomKey] = atom;

  store.set(`projects.${projectKey}.tests.${testKey}.canvas`, canvas);
  mainWindow.webContents.send("canvas-update");
});

ipcMain.on(GET_PREDICATES, (event, projectKey) => {
  let predicates = store.get(`projects.${projectKey}.predicates`);
  event.sender.send("got-predicates", predicates);
});

ipcMain.on(SET_PREDICATE_TEST, (event, projectKey, predicateName, value) => {
  store.set(`projects.${projectKey}.predicates.${predicateName}`, value);
  mainWindow.webContents.send("predicates-update");
});

ipcMain.on(GET_ATOM_SHAPE, (event, projectKey, sourceAtomKey) => {
  let shape = store.get(`projects.${projectKey}.atoms.${sourceAtomKey}.shape`);
  event.sender.send("got-atom-shape", shape);
});

ipcMain.on(SET_ATOM_SHAPE, (event, projectKey, sourceAtomKey, shape) => {
  store.set(`projects.${projectKey}.atoms.${sourceAtomKey}.shape`, shape);
  mainWindow.webContents.send("meta-data-update");
});

ipcMain.on(
  SET_ATOM_INSTANCE_NICKNAME,
  (event, projectKey, testKey, atomKey, nickname) => {
    store.set(
      `projects.${projectKey}.tests.${testKey}.canvas.atoms.${atomKey}.nickname`,
      nickname
    );
    mainWindow.webContents.send("nickname-update");
  }
);

/*
 * NEW TYPESAFE ipcMain Functions
 */

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

ipcMain.on(
  CREATE_NEW_TEST,
  async (event, projectID: number, testName: string) => {
    let result = await createNewTest(projectID, testName);
    event.sender.send("created-new-test", result);
  }
);

ipcMain.on(
  READ_TEST,
  async (
    event,
    { testID, returnKey }: { testID: number; returnKey: string }
  ) => {
    const test = await prisma.test.findFirst({
      where: { id: number.parse(testID) },
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
    event.sender.send(returnKey, test ? test : {});
  }
);

ipcMain.on(GET_TESTS, async (event, projectID: number) => {
  const tests = await prisma.test.findMany({
    where: { projectID: number.parse(projectID) },
  });
  event.sender.send("got-tests", tests ? tests : []);
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
    try {
      let test = await prisma.test.findFirstOrThrow({
        where: { id: number.parse(testID) },
        include: { atoms: true },
      });
      let atomSource = await prisma.atomSource.findFirstOrThrow({
        where: { id: number.parse(sourceAtomID) },
      });
      if (atomSource.isLone || atomSource.isOne) {
        if (test.atoms.filter((atom: Atom) => atom.srcID === atomSource.id)) {
          console.log("Found an atom");
          event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: false }); // already an atom with a matching source
        }
      }
      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: true }); // No multiplicity issues, eligible atom
    } catch (e) {
      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, {
        success: false,
        error: e,
      });
    }
  }
);

// TODO: Build out default nickname
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
    let atom = await prisma.atom.create({
      data: {
        testID: number.parse(testID),
        srcID: number.parse(sourceAtomID),
        top: number.parse(top),
        left: number.parse(left),
        nickname: "Test",
      },
    });

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
    { fromAtom, toAtom }: { fromAtom: AtomWithSource; toAtom: AtomWithSource }
  ) => {
    // 1. Find relation with fromAtom.atomSrc.fromRelations and toAtom.atomSrc.toRelations
    // 2. Check relation multiplicity
    // 3. If relation multiplicity is lone or one and connections > 1, return error, show notification.
    // 4. Else, add connection.
    // let relation = await prisma.relation.findFirst({
    //   where: {
    //     fromAtom: number.parse(fromAtom.id),
    //     toAtom: number.parse(toAtom.id),
    //   },
    // });
  }
);

export type AtomSourceWithRelations = Prisma.AtomSourceGetPayload<{
  include: { fromRelations: true; toRelations: true; isChildOf: true };
}>;

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

ipcMain.on(
  VALIDATE_NEW_PROJECT_FORM,
  async (event: Electron.IpcMainEvent, data: NewProject) => {
    const response = await validateNewProject(data);
    event.sender.send("project-name-validation", response);
  }
);

ipcMain.on(CREATE_NEW_PROJECT, async (event, data: NewProject) => {
  const result = await createNewProject(data);
  event.sender.send("new-project-resp", result);
});

ipcMain.on(GET_PROJECT, async (event, projectID: number) => {
  const project = await prisma.project.findFirst({ where: { id: projectID } });
  event.sender.send("get-project-resp", project);
});

ipcMain.on(
  CLOSE_TAB,
  async (
    event,
    { projectID, testID }: { projectID: number; testID: number }
  ) => {}
);

ipcMain.on(DELETE_PROJECT, async (event, project: Project) => {
  await fs.rmdir(project.projectPath, { recursive: true }, (err) => {
    if (err) {
      return console.log("error occurred in deleting directory", err);
    }
  });

  const delResp = await prisma.project.delete({ where: { id: project.id } });
  event.sender.send("delete-project-resp", delResp);
});
