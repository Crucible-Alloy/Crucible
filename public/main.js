const { PrismaClient } = require("@prisma/client");
const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  session,
} = require("electron");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const fs = require("fs");

// Import ipcMain API so that it loads and listeners are created.
const ipcMainProjects = require("./ipc/projects");
const ipcMainAtoms = require("./ipc/atoms");
const ipcMaintests = require("./ipc/tests");

const prisma = new PrismaClient();

// Global window variable
let mainWindow, projectSelectWindow;

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
} = require("../src/utils/constants");

let itemsToTrack;

const Store = require("electron-store");
const os = require("os");

let store = new Store();

const isDev = true;
let springAPI;
let isMac = true;

// if (require("electron-is-dev")) {
//     app.quit();
// }

function createASketchMenu() {
  const template = [
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

function createMainWindow(projectID) {
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

function openProject(projectID) {
  projectSelectWindow.close();
  createMainWindow(projectID);
}

function createNewFolder(folder) {
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  } catch (err) {
    console.log("Error creating directory:", err);
  }
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

function initProjectData(filePath, projectKey) {
  let colors = getColorArray();
  let atomData = {};
  let predicateData = {};

  try {
    // Send file to alloy API and get back metadata
    const apiRequest = axios.post("http://localhost:8080/files", null, {
      params: { filePath: filePath },
    });
    apiRequest
      .then((data) => {
        if (data.data) {
          console.log(data.data);
          for (const atom in data.data["atoms"]) {
            // If colors array is empty, repopulate it.
            if (!colors.length) {
              colors = getColorArray();
            }
            // Pop a random color from the colors array and assign to the atom
            data.data["atoms"][atom]["color"] = colors.splice(
              Math.floor(Math.random() * colors.length),
              1
            )[0];

            // Set the shape of the atom.
            data.data["atoms"][atom]["shape"] = "rectangle";

            atomData[uuidv4()] = data.data["atoms"][atom];
          }

          // Post-processing on the relations information for multiplicity enforcement
          for (const [key, atom] of Object.entries(atomData)) {
            // Get the multiplicity and related atom label from the response returned to the API
            atom["relations"].forEach(function (item) {
              let multiplicity = item["multiplicity"].split(" ")[0];
              let relationFromLabel = item["type"].split("->")[0].split("{")[1];
              let relationToLabel = item["type"].split("->")[1].split("}")[0];

              // Overwrite the multiplicity key and set related_label
              item["multiplicity"] = multiplicity;
              item["toLabel"] = relationToLabel;
              item["fromLabel"] = relationFromLabel;

              // Find the related atom key
              for (const [key, value] of Object.entries(atomData)) {
                if (value["label"] === relationToLabel) {
                  item["toKey"] = key;
                } else if (value["label"] === relationFromLabel) {
                  item["fromKey"] = key;
                }
              }
            });
          }

          let preds = data.data.functions;

          // Status can be 'null', 'equals', or 'negate'
          preds.forEach((predicate) => {
            predicateData[predicate["label"].split("/").at(-1)] = {
              status: "null",
              params: predicate["parameters"],
            };
          });

          Object.values(predicateData).forEach((predicate) => {
            predicate.params.forEach((param) => {
              param.atom = "null";
            });
          });
        }
      })
      .then(() => {
        // Write all atom data to the project
        store.set(`projects.${projectKey}.atoms`, atomData);
        store.set(`projects.${projectKey}.predicates`, predicateData);
      });
  } catch (err) {
    console.log(err);
  }
}

// Open dev tools on launch in dev mode

// After initialization, create new browser window.
// Some APIs only available after this call.
app.whenReady().then(() => {
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

  const jarPath = `${path.join(__dirname, "../src/JARs/aSketch-API.jar")}`;
  springAPI = require("child_process").spawn("java", ["-jar", jarPath, ""]);

  app.on("activate", function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    if (BrowserWindow.getAllWindows().length === 0) createProjectSelectWindow();
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

ipcMain.on(FETCH_DATA_FROM_STORAGE, (event, message) => {
  mainWindow.send(HANDLE_FETCH_DATA, {
    success: true,
    message: message,
  });

  store.get(message, (error, data) => {
    itemsToTrack = JSON.stringify(data) === "{}" ? [] : data;
    if (error) {
      mainWindow.send(HANDLE_FETCH_DATA, {
        success: false,
        message: "itemsToTrack not returned",
      });
    } else {
      mainWindow.send(HANDLE_FETCH_DATA, {
        success: true,
        message: itemsToTrack,
      });
    }
  });
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

// ipcMain.on(GET_CANVAS, (event, projectKey, testKey, returnKey) => {
//   //console.log("Main Received: LOAD_CANVAS_STATE with: ", projectKey, testKey)
//
//   // Send canvas state back to ipcRenderer via api.
//   let canvasState = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
//   event.sender.send(returnKey, canvasState ? canvasState : {});
// });

ipcMain.on(GET_PROJECT_FILE, (event, projectKey) => {
  //console.log("MAIN: GET_PROJECT_FILE");

  let projectFile = store.get(`projects.${projectKey}.path`);
  event.sender.send("got-project-file", projectFile ? projectFile : null);
});

ipcMain.on(UPDATE_PROJECT_FILE, (event, projectKey) => {
  //console.log("Main Received: SET_MAIN_PROJECT_FILE")

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
        console.log(response.filePaths[0]);

        store.set(`projects.${projectKey}.path`, response.filePaths[0]);
        initProjectData(response.filePaths[0], projectKey);

        event.reply("project-file-set", response.filePaths[0]);
      } else {
        event.reply("project-file-set", null);
      }
    });
});

// ipcMain.on(GET_ATOMS, (event, projectKey) => {
//     //console.log("MAIN RECEIVED GET_ATOMS FROM RENDERER")
//     //console.log(projectKey);
//     let Atom = store.get(`projects.${projectKey}.Atom`);
//     //console.log(Atom);
//     event.sender.send('got-Atom', Atom ? Atom : {})
// })

ipcMain.on(GET_ATOM, (event, projectKey, atomKey) => {
  let atom = store.get(`projects.${projectKey}.atoms.${atomKey}`);
  event.sender.send("got-atom", atom);
});

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
  store.delete(
    `projects.${projectKey}.tests.${testKey}.canvas.atoms.${atomID}`
  );
  let connections = store.get(
    `projects.${projectKey}.tests.${testKey}.canvas.connections`
  );
  Object.entries(connections).map(([key, value]) => {
    if (value["from"] === atomID) {
      store.delete(
        `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
      );
    } else if (value["to"] === atomID) {
      store.delete(
        `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
      );
    }
  });
  let canvasState = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
  event.sender.send("deleted-atom", canvasState);
  mainWindow.webContents.send("canvas-update");
});

ipcMain.on(DELETE_CONNECTION, (event, projectKey, testKey, atomID) => {
  let connections = store.get(
    `projects.${projectKey}.tests.${testKey}.canvas.connections`
  );
  Object.entries(connections).map(([key, value]) => {
    if (value["from"] === atomID) {
      store.delete(
        `projects.${projectKey}.tests.${testKey}.canvas.connections.${key}`
      );
    }
  });
  let canvasState = store.get(`projects.${projectKey}.tests.${testKey}.canvas`);
  event.sender.send("deleted-connection", canvasState);
  mainWindow.webContents.send("canvas-update");
});

ipcMain.on(
  CREATE_CONNECTION,
  (
    event,
    projectKey,
    testKey,
    fromAtom,
    toAtom,
    fromAtomLabel,
    toAtomLabel,
    fromNickname,
    toNickname,
    connectionLabel
  ) => {
    let connectionId = uuidv4();
    let connection = {
      from: fromAtom,
      to: toAtom,
      fromLabel: fromAtomLabel,
      toLabel: toAtomLabel,
      fromNickname: fromNickname,
      toNickname: toNickname,
      connectionLabel: connectionLabel,
    };
    console.log(connection);
    // Todo: Get relation label based on sourceAtomKeys?
    //  Filter relations down based to toLabel compared to relatedLabel

    store.set(
      `projects.${projectKey}.tests.${testKey}.canvas.connections.${connectionId}`,
      connection
    );

    mainWindow.webContents.send("canvas-update");
  }
);

ipcMain.on(
  GET_ACCEPT_TYPES,
  (event, projectKey, sourceAtomKey, returnChannel) => {
    const atoms = store.get(`projects.${projectKey}.atoms`);
    let types = [];
    let typesLabels = [];
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

    Object.entries(atoms).map(([key, atom]) => {
      if (atom["relations"]) {
        Object.entries(atom["relations"]).map(([relationKey, relation]) => {
          targetLabels.forEach((label) => {
            if (relation["toLabel"] === label) {
              types.push(key);
            }
          });
        });
      }
    });

    types.forEach(function (x) {
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
    const foundConnections = [];
    Object.entries(connections).map(([key, value]) => {
      if (value["from"] === atomKey) {
        foundConnections.push(value);
      }
    });
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
  Object.entries(atoms).map(([sourceAtomKey, sourceAtom]) => {
    // // Assign each atom a numeral for use in command string
    // Object.entries(canvas["Atom"]).map(([canvasAtomKey, canvasAtom], index) => {
    //   atomsWithIndexes[canvasAtomKey] = index;
    // })

    // For atom in canvas where type matches atomType
    commandString += "some disj";
    let atomsOfType = Object.entries(canvas["atoms"]).filter(
      ([canvasAtomKey, canvasAtom]) =>
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
  Object.entries(atoms).map(([sourceAtomKey, sourceAtom]) => {
    commandString += `${sourceAtom["label"].split("/")[1]} = `;
    // Get Atom on the canvas with a matching type.
    let matchedAtoms = Object.entries(canvas["atoms"]).filter(
      ([key, value]) => sourceAtomKey === value["sourceAtomKey"]
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
        (value) => value[1]["connectionLabel"]
      )
    ),
  ];

  // Iterate over the found connection types
  for (let i = 0; i < connectionTypes.length; i++) {
    commandString += `${connectionTypes[i]}=`;
    // Filter our canvas connections down to just the ones that match the current connection type
    let canvasConnections = Object.entries(canvas["connections"]).filter(
      ([key, value]) => value["connectionLabel"] === connectionTypes[i]
    );
    // Add each connection to the commandString, and if we aren't on the last one, add a plus.
    for (let j = 0; j < canvasConnections.length; j++) {
      let value = canvasConnections[j][1];
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
  let activePreds = Object.entries(
    store.get(`projects.${projectKey}.predicates`)
  ).filter(
    ([key, value]) => value.status === "equals" || value.status === "negate"
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
  apiRequest.then((data) => {
    if (data.data) {
      data.data.includes("Unsatisfiable")
        ? event.sender.send(returnChannel, "Fail")
        : event.sender.send(returnChannel, "Pass");
    }
  });
});

ipcMain.on(GET_PROJECT_TABS, (event, projectKey) => {
  let projectTabs = store.get(`projects.${projectKey}.tabs`);
  let activeTab = store.get(`projects.${projectKey}.activeTab`);
  event.sender.send("got-tabs", projectTabs, activeTab);
});

ipcMain.on(SET_PROJECT_TABS, (event, projectKey, tabs, activeTab) => {
  console.log(tabs);
  store.set(`projects.${projectKey}.tabs`, tabs);
  store.set(`projects.${projectKey}.activeTab`, activeTab);
  console.log(store.get(`projects.${projectKey}.tabs`));

  mainWindow.webContents.send("tabs-update");
});

ipcMain.on(SET_ACTIVE_TAB, (event, projectKey, activeTab) => {
  if (store.get(`projects.${projectKey}.activeTab`) !== activeTab) {
    store.set(`projects.${projectKey}.activeTab`, activeTab);
    mainWindow.webContents.send("tabs-update");
  }
});

ipcMain.on(OPEN_AND_SET_ACTIVE, (event, projectKey, newTab) => {
  console.log("OPEN_AND_SET_ACTIVE");
  let tabData = { testKey: newTab.testKey, name: newTab.name };
  let activeTab = store.get(`projects.${projectKey}.activeTab`);
  let projectTabs = store.get(`projects.${projectKey}.tabs`);

  // If there is no tab with a matching name already, push the new tab and store
  if (projectTabs.filter((tab) => newTab.name === tab.name).length === 0) {
    projectTabs.push(tabData);
    store.set(`projects.${projectKey}.tabs`, projectTabs);
    store.set(`projects.${projectKey}.activeTab`, newTab.name);
    mainWindow.webContents.send("tabs-update");
  } else if (activeTab.name !== newTab) {
    store.set(`projects.${projectKey}.activeTab`, newTab.name);
    mainWindow.webContents.send("tabs-update");
  }
});

ipcMain.on(CLOSE_TAB, (event, projectKey, tabName) => {
  let projectTabs = store.get(`projects.${projectKey}.tabs`);

  function updateActiveTab(projectKey) {
    let name = store.get(`projects.${projectKey}.tabs`)[0].name;
    store.set(`projects.${projectKey}.activeTab`, name);
  }

  if (store.get(`projects.${projectKey}.activeTab`) === tabName) {
    console.log("Closing tab is active");
    if (store.get(`projects.${projectKey}.activeTab`) === tabName) {
      if (store.get(`projects.${projectKey}.tabs`).length > 0) {
        store.set(
          `projects.${projectKey}.tabs`,
          projectTabs.filter((tab) => tabName !== tab.name)
        );
        console.log(store.get(`projects.${projectKey}.tabs`));
        store.set(
          `projects.${projectKey}.tabs`,
          projectTabs.filter((tab) => tabName !== tab.name)
        );
        updateActiveTab(projectKey);
      }
    }
  }

  mainWindow.webContents.send("tabs-update");
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
