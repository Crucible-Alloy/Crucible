"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const zod_1 = require("zod");
const formValidation_1 = require("./validation/formValidation");
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const electron_2 = require("electron");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const constants_1 = require("../src/utils/constants");
const runtime_1 = require("@prisma/client/runtime");
const prisma = new client_1.PrismaClient();
// Global window variable
let mainWindow, projectSelectWindow;
// Number/Boolean coercion helper because ipc encodes numbers as strings.
const number = zod_1.z.coerce.number();
const bool = zod_1.z.coerce.boolean();
const isDev = true;
let springAPI;
let isMac = true;
function createNewTest(projectID, testName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
        // Validate data. If there is an error, return it to the client.
        let validationResp = yield validateNewTest({ testName, projectID });
        if (!validationResp.success) {
            console.log(validationResp);
            return validationResp;
        }
        const project = yield prisma.project.findFirst({
            where: { id: number.parse(projectID) },
        });
        if (project) {
            let testFilePath = path_1.default.join(project.projectPath, `tests/${testName}.txt`);
            // Create temp test file at the given path. If error, return it to the client.
            fs_1.default.writeFile(testFilePath, "Placeholder file...", function (err) {
                if (err)
                    return { success: false, error: err.message };
            });
            // Insert new test into the database
            const newTest = yield prisma.test.create({
                data: {
                    name: testName,
                    projectID: project.id,
                    testFile: testFilePath,
                },
            });
            if (!newTest) {
                return { success: false, error: "Could not create test." };
            }
            const testPredicates = yield buildTestPredicates(projectID, newTest.id);
            if (testPredicates.success) {
                return { success: true, error: null, test: newTest };
            }
            else {
                return { success: false, error: "Could not init test predicates" };
            }
        }
        return { success: false, error: "Could not create test." };
    });
}
function buildTestPredicates(projectID, newTestID) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the project predicates and their params.
        const predicates = yield prisma.predicate.findMany({
            where: { projectID: projectID },
            include: { params: true },
        });
        const newPredParamInstance = (param, newPred) => __awaiter(this, void 0, void 0, function* () {
            console.log("Creating new param: ", param);
            yield prisma.predInstanceParams.create({
                data: { predInstID: newPred.id, predParamID: param.id },
            });
        });
        const newPredInstance = (predicate) => __awaiter(this, void 0, void 0, function* () {
            console.log("Creating new predicate: ", predicate.name);
            const predInstance = yield prisma.predInstance.create({
                data: { predID: predicate.id, testID: newTestID, state: null },
            });
            if (predInstance) {
                predicate.params.forEach((param) => {
                    newPredParamInstance(param, predInstance);
                });
            }
        });
        if (predicates) {
            console.log(predicates);
            try {
                // For each project predicate, create an instance of it associated to the test
                predicates.forEach((predicate) => {
                    newPredInstance(predicate);
                });
            }
            catch (e) {
                if (e instanceof runtime_1.PrismaClientKnownRequestError) {
                    console.log(e.message);
                    return { success: false, error: e.message };
                }
            }
        }
        return { success: true, error: null };
    });
}
/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
function validateNewProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield formValidation_1.NewProjectSchema.parseAsync(data);
            return { success: true, error: null };
        }
        catch (e) {
            if (e instanceof zod_1.ZodError) {
                return { success: false, error: e.issues };
            }
            else {
                throw e;
            }
        }
    });
}
function initializeAtoms(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let colors = getColorArray();
        // Validate all Atom.
        atoms.forEach((atom) => {
            try {
                formValidation_1.AtomRespSchema.parse(atom);
            }
            catch (e) {
                if (e instanceof zod_1.ZodError) {
                    return { success: false, error: e.issues };
                }
                else {
                    throw e;
                }
            }
        });
        for (const atom of atoms) {
            // Reset colors if needed, then grab a color for assignment.
            if (colors.length === 0)
                getColorArray();
            let selectedColor = colors.splice(Math.floor(Math.random() * colors.length), 1)[0];
            // Insert AtomSource data into the database (sans parent/child data)
            const newAtom = yield prisma.atomSource.create({
                data: {
                    projectID: projectID,
                    label: atom.label,
                    isEnum: atom.isEnum ? true : undefined,
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
    });
}
function initializeInheritance(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const atom of atoms) {
            // Insert parents of atom to atomInheritance table.
            if (atom.parents) {
                for (const parent of atom.parents) {
                    // See if the inheritance is already in the database.
                    yield prisma.atomInheritance.upsert({
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
                    yield prisma.atomInheritance.upsert({
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
    });
}
function initializeRelations(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const atom of atoms) {
            // Insert parents of atom to atomInheritance table.
            if (atom.relations) {
                for (const relation of atom.relations) {
                    // Nasty transformation to get the last label in a -> chain e.g. "{this/Book->this/Name->this/Listing}"
                    const toLabel = relation.type
                        .split("->")[relation.type.split("->").length - 1].split("}")[0];
                    // See if the inheritance is already in the database.
                    yield prisma.relation.upsert({
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
    });
}
function initializePredicates(predicates, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const pred of predicates) {
            const newPred = yield prisma.predicate.create({
                data: {
                    projectID: projectID,
                    name: pred.label,
                },
            });
            for (const param of pred.parameters) {
                yield prisma.predParam.create({
                    data: {
                        predID: newPred.id,
                        label: param.label,
                        paramType: param.paramType,
                    },
                });
            }
        }
    });
}
function initProjectData(data, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
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
                    filePath: process.platform === "win32"
                        ? data.alloyFile.split("\\")
                        : data.alloyFile.split("/"),
                    operatingSystem: process.platform,
                },
            };
            const apiRequest = axios_1.default.request(options);
            let resp = yield apiRequest;
            if (resp.data) {
                yield initializeAtoms(resp.data.atoms, projectID);
                yield initializeInheritance(resp.data.atoms, projectID);
                yield initializeRelations(resp.data.atoms, projectID);
                yield initializePredicates(resp.data.functions, projectID);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
/**
 * Insert new project record into the database and initialize project assets based on SpringBoot response.
 * @param data
 */
function createNewProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate data. If there is an error, return it to the client.
        let validationResp = yield validateNewProject(data);
        if (!validationResp.success)
            return validationResp;
        // Create project directories
        const fullProjectPath = data.projectPath + data.projectName;
        const projectFolder = fs_1.default.mkdirSync(fullProjectPath, { recursive: true });
        const testsFolder = fs_1.default.mkdirSync(path_1.default.join(fullProjectPath, "tests"), {
            recursive: true,
        });
        if (projectFolder && testsFolder) {
            // Insert project data if paths are good.
            const project = yield prisma.project.create({
                data: {
                    name: data.projectName,
                    projectPath: fullProjectPath,
                    alloyFile: data.alloyFile,
                },
            });
            if (!project) {
                return { success: false, error: "Could not create project." };
            }
            yield initProjectData(data, project.id);
            return { success: true, error: null, projectID: project.id };
        }
    });
}
/**
 * Validate the form data to ensure no duplicate test names are used and all paths are valid.
 * @returns boolean
 * @param data
 */
function validateNewTest(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield formValidation_1.NewTestSchema.parseAsync(data);
            return { success: true, error: null };
        }
        catch (e) {
            if (e instanceof zod_1.ZodError) {
                return { success: false, error: e.issues };
            }
            else {
                throw e;
            }
        }
    });
}
function createASketchMenu() {
    const template = [
        // { role: 'appMenu' }
        ...(isMac
            ? [
                {
                    label: electron_2.app.name,
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
                    click: () => __awaiter(this, void 0, void 0, function* () {
                        if (mainWindow) {
                            //
                        }
                        createProjectSelectWindow();
                    }),
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
                    click: () => __awaiter(this, void 0, void 0, function* () {
                        const { shell } = require("electron");
                        yield shell.openExternal("https://electronjs.org");
                    }),
                },
            ],
        },
    ];
    const menu = electron_2.Menu.buildFromTemplate(template);
    electron_2.Menu.setApplicationMenu(menu);
}
function createProjectSelectWindow() {
    projectSelectWindow = new electron_1.BrowserWindow({
        width: 960,
        height: 640,
        webPreferences: {
            nodeIntegration: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    projectSelectWindow.loadURL(isDev
        ? "http://localhost:3000/projects"
        : `${path_1.default.join(__dirname, "../build/index.html/projects")}`);
    if (isDev) {
        projectSelectWindow.webContents.openDevTools({ mode: "detach" });
    }
}
function createMainWindow(projectID) {
    mainWindow = new electron_1.BrowserWindow({
        // Set browser window parameters
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
        //titleBarStyle: "hiddenInset",
    });
    //Load index.html
    mainWindow.loadURL(isDev
        ? `http://localhost:3000/main/${projectID}`
        : `${path_1.default.join(__dirname, `../build/index.html/main/${projectID}`)}`);
    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }
}
function openProject(projectID) {
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
function deployAlloyAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        const jarPath = `${path_1.default.join(__dirname, "../src/JARs/aSketch-API.jar")}`;
        springAPI = require("child_process").spawn("java", ["-jar", jarPath, ""]);
    });
}
// After initialization, create new browser window.
// Some APIs only available after this call.
electron_2.app.whenReady().then(() => {
    deployAlloyAPI().then(() => {
        createASketchMenu();
        createProjectSelectWindow();
        // on macOS
        const reactDevToolsPath = path_1.default.join(os_1.default.homedir(), "/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0");
        electron_2.app.whenReady().then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield electron_2.session.defaultSession.loadExtension(reactDevToolsPath);
        }));
        electron_2.app.on("activate", function () {
            // On macOS, it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            //if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
            if (electron_1.BrowserWindow.getAllWindows().length === 0)
                createProjectSelectWindow();
        });
    });
});
// Close app on exit for linux/windows.
electron_2.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_2.app.quit();
        // Shutdown spring-boot api
        const kill = require("tree-kill");
        kill(springAPI.pid);
    }
});
electron_2.ipcMain.on(constants_1.GET_PROJECTS, (event) => __awaiter(void 0, void 0, void 0, function* () {
    const projects = yield prisma.project.findMany();
    event.sender.send("get-projects-success", projects ? projects : {});
}));
electron_2.ipcMain.on(constants_1.OPEN_PROJECT, (event, projectID) => {
    openProject(projectID);
});
electron_2.ipcMain.on(constants_1.SELECT_FILE, (event) => {
    //console.log("Main Received: SELECT_FILE")
    electron_2.dialog
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
        }
        else {
            event.sender.send("file-selected", null);
        }
    });
});
electron_2.ipcMain.on(constants_1.GET_HOME_DIRECTORY, (event) => {
    const homedir = require("os").homedir();
    //console.log(homedir)
    event.sender.send("got-home-directory", homedir);
});
electron_2.ipcMain.on(constants_1.DELETE_ATOM, (event, atomID) => __awaiter(void 0, void 0, void 0, function* () {
    const deletion = yield prisma.atom.delete({
        where: { id: number.parse(atomID) },
    });
    if (deletion) {
        mainWindow.webContents.send("canvas-update");
    }
}));
electron_2.ipcMain.on(constants_1.DELETE_CONNECTION, (event, connID) => __awaiter(void 0, void 0, void 0, function* () {
    const deletion = yield prisma.atom.delete({
        where: { id: number.parse(connID) },
    });
    if (deletion) {
        mainWindow.webContents.send("canvas-update");
    }
}));
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
electron_2.ipcMain.on(constants_1.GET_ACTIVE_TEST, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    let project = yield prisma.project.findFirst({
        where: { id: number.parse(projectID) },
    });
    if (project) {
        event.sender.send(`${constants_1.GET_ACTIVE_TEST}-resp`, project.activeTab);
    }
}));
electron_2.ipcMain.on(constants_1.SET_ACTIVE_TEST, (event, { projectID, testName }) => __awaiter(void 0, void 0, void 0, function* () {
    let activeTab = yield prisma.project.update({
        where: { id: number.parse(projectID) },
        data: { activeTab: testName },
    });
    if (activeTab) {
        mainWindow.webContents.send("tabs-update");
    }
}));
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
electron_2.ipcMain.on(constants_1.CREATE_NEW_TEST, (event, projectID, testName) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield createNewTest(projectID, testName);
    event.sender.send("created-new-test", result);
}));
electron_2.ipcMain.on(constants_1.READ_TEST, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MAIN Reading tests from ID: ", data.testID);
    const test = yield prisma.test.findFirst({
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
}));
electron_2.ipcMain.on(constants_1.GET_TESTS, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MAIN GETTING TESTS");
    const tests = yield prisma.test.findMany({
        where: { projectID: number.parse(projectID) },
    });
    event.sender.send(`${constants_1.GET_TESTS}-resp`, tests ? tests : []);
}));
electron_2.ipcMain.on(constants_1.DELETE_TEST, (event, projectID, testID) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield prisma.test.delete({
        where: { id: number.parse(testID) },
    });
    // TODO: Alert client to change in tests table.
}));
// TODO: This can likely be simplified to a single query
electron_2.ipcMain.on(constants_1.TEST_CAN_ADD_ATOM, (event, { testID, sourceAtomID }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(sourceAtomID);
    try {
        let test = yield prisma.test.findFirstOrThrow({
            where: { id: number.parse(testID) },
            include: { atoms: true },
        });
        console.log("Found Test: ", test);
        let atomSource = yield prisma.atomSource.findFirstOrThrow({
            where: { id: number.parse(sourceAtomID) },
        });
        console.log("Found Source: ", atomSource);
        if (atomSource.isLone || atomSource.isOne) {
            if (test.atoms.filter((atom) => atom.srcID === atomSource.id)
                .length > 0) {
                console.log("Found an atom");
                event.sender.send(`${constants_1.TEST_CAN_ADD_ATOM}-resp`, { success: false }); // already an atom with a matching source
            }
        }
        event.sender.send(`${constants_1.TEST_CAN_ADD_ATOM}-resp`, { success: true }); // No multiplicity issues, eligible atom
    }
    catch (e) {
        if (e instanceof runtime_1.PrismaClientKnownRequestError) {
            console.log(e.message);
        }
        event.sender.send(`${constants_1.TEST_CAN_ADD_ATOM}-resp`, {
            success: false,
            // @ts-ignore
            error: e.message,
        });
    }
}));
electron_2.ipcMain.on(constants_1.TEST_ADD_ATOM, (event, { testID, sourceAtomID, top, left, }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MAIN: TEST ADDING ATOM");
    console.log(testID);
    console.log(sourceAtomID);
    let test = yield prisma.test.findFirst({
        where: { id: number.parse(testID) },
    });
    let sourceAtom = yield prisma.atomSource.findFirst({
        where: { id: number.parse(sourceAtomID) },
    });
    if (test && sourceAtom) {
        let atom = yield prisma.atom.create({
            data: {
                testID: number.parse(testID),
                srcID: number.parse(sourceAtomID),
                top: number.parse(top),
                left: number.parse(left),
                nickname: `${sourceAtom.label} ${test.atomCount}`,
            },
        });
        console.log("ATOM CREATED");
        let updateTest = yield prisma.test.update({
            where: { id: number.parse(testID) },
            data: { atomCount: { increment: 1 } },
        });
    }
    // Alert the browser to a change in state.
    mainWindow.webContents.send("canvas-update");
}));
electron_2.ipcMain.on(constants_1.OPEN_TEST, (event, { testID, projectID }) => __awaiter(void 0, void 0, void 0, function* () {
    let test = yield prisma.test.update({
        where: { id: number.parse(testID) },
        data: { tabIsOpen: true },
    });
    if (test) {
        yield prisma.project.update({
            where: { id: number.parse(projectID) },
            data: { activeTab: test.name },
        });
        event.sender.send(`${constants_1.OPEN_TEST}-resp`, { success: true });
        mainWindow.webContents.send("tabs-update");
    }
}));
electron_2.ipcMain.on(constants_1.CLOSE_TEST, (event, { testID, projectID }) => __awaiter(void 0, void 0, void 0, function* () {
    // Close the test.
    let test = yield prisma.test.update({
        where: { id: number.parse(testID) },
        data: { tabIsOpen: false },
    });
    let openTest = yield prisma.test.findFirst({
        where: { tabIsOpen: true },
    });
    // Set active tab to a different test if closed test is active tab.
    if (test) {
        yield prisma.project.update({
            where: { id: number.parse(projectID) },
            data: { activeTab: openTest ? openTest.name : "" },
        });
        event.sender.send(`${constants_1.CLOSE_TEST}-resp`, { success: true });
        mainWindow.webContents.send("tabs-update");
    }
}));
electron_2.ipcMain.on(constants_1.CREATE_CONNECTION, (event, { projectID, testID, fromAtom, toAtom, }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("WORKING ON CONNECTION");
    console.log("pID: ", projectID);
    console.log("from: ", fromAtom);
    console.log("to: ", toAtom);
    // Find relation with fromAtom.atomSrc.label and toAtom.atomSrc.label
    const relations = yield prisma.relation.findMany({
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
        if (relations[0].multiplicity.split(" ")[0] === "lone" ||
            relations[0].multiplicity.split(" ")[0] === "one") {
            // 3. Find out if there are preexisting connections of that kind.
            const existingRels = yield prisma.test.findFirst({
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
                console.log("exisitingRels: ", existingRels);
                event.sender.send(`${constants_1.CREATE_CONNECTION}-resp`, { success: false });
                return;
            }
        }
        // 4. Else, add connection.
        const connection = yield prisma.connection.create({
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
            event.sender.send(`${constants_1.CREATE_CONNECTION}-resp`, { success: true });
            mainWindow.webContents.send("canvas-update");
        }
    }
    if (relations.length > 1) {
        console.log("CONNECTION ERROR: More than one viable connection.");
        event.sender.send(`${constants_1.CREATE_CONNECTION}-resp`, { success: false });
    }
}));
electron_2.ipcMain.on(constants_1.GET_ATOM_SOURCES, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Getting atoms with projectID: ${projectID}`);
    const atoms = yield prisma.atomSource.findMany({
        where: { projectID: number.parse(projectID) },
        include: {
            fromRelations: true,
            isChildOf: true,
        },
    });
    event.sender.send("get-atom-sources-resp", atoms ? atoms : {});
}));
electron_2.ipcMain.on(constants_1.CREATE_NEW_PROJECT, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield createNewProject(data);
    projectSelectWindow.webContents.send("projects-update");
    event.sender.send("new-project-resp", result);
}));
electron_2.ipcMain.on(constants_1.GET_PROJECT, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield prisma.project.findFirst({ where: { id: projectID } });
    event.sender.send("get-project-resp", project);
}));
electron_2.ipcMain.on(constants_1.DELETE_PROJECT, (event, project) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.rmdir(project.projectPath, { recursive: true }, (err) => {
        if (err) {
            return console.log("error occurred in deleting directory", err);
        }
    });
    const delResp = yield prisma.project.delete({ where: { id: project.id } });
    event.sender.send("delete-project-resp", delResp);
    projectSelectWindow.webContents.send("projects-update");
}));
electron_2.ipcMain.on(constants_1.UPDATE_ATOM, (event, { atomID, left, top }) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedAtom = yield prisma.atom.update({
        where: { id: number.parse(atomID) },
        data: { left: number.parse(left), top: number.parse(top) },
    });
    if (updatedAtom) {
        console.log("Updated Atom");
        mainWindow.webContents.send("canvas-update");
    }
}));
electron_2.ipcMain.on(constants_1.GET_ATOM_SOURCE, (event, { srcAtomID }) => __awaiter(void 0, void 0, void 0, function* () {
    const atom = yield prisma.atomSource.findFirst({
        where: { id: number.parse(srcAtomID) },
        include: {
            fromRelations: true,
            toRelations: true,
            isChildOf: true,
        },
    });
    event.sender.send(`${constants_1.GET_ATOM_SOURCE}-resp`, atom ? atom : {});
}));
electron_2.ipcMain.on(constants_1.SET_ATOM_COLOR, (event, { sourceAtomID, color }) => __awaiter(void 0, void 0, void 0, function* () {
    const update = yield prisma.atomSource.update({
        where: { id: number.parse(sourceAtomID) },
        data: { color: color },
    });
    if (update) {
        mainWindow.webContents.send("canvas-update");
    }
}));
electron_2.ipcMain.on(constants_1.GET_PREDICATES, (event, testID) => __awaiter(void 0, void 0, void 0, function* () {
    const predicates = yield prisma.predInstance.findMany({
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
    event.sender.send(`${constants_1.GET_PREDICATES}-resp`, predicates ? predicates : []);
}));
electron_2.ipcMain.on(constants_1.UPDATE_PRED_STATE, (event, { predicateID, state }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MAIN: Updating predicate State");
    console.log(state);
    const update = yield prisma.predInstance.update({
        where: { id: number.parse(predicateID) },
        data: { state: state },
        include: {
            params: true,
        },
    });
    if (update) {
        mainWindow.webContents.send("predicates-update");
    }
}));
electron_2.ipcMain.on(constants_1.UPDATE_PRED_PARAM, (event, { predParamID, atomID }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MAIN: Updating predicate parameter");
    const update = yield prisma.predInstanceParams.update({
        where: { id: number.parse(predParamID) },
        data: { atom: number.parse(atomID) },
    });
    if (update) {
        mainWindow.webContents.send("predicates-update");
    }
}));
electron_2.ipcMain.on(constants_1.GET_PARENTS, (event, srcAtomID) => __awaiter(void 0, void 0, void 0, function* () {
    const srcAtom = yield prisma.atomSource.findFirst({
        where: { id: srcAtomID },
        include: { isChildOf: true },
    });
    if (srcAtom && srcAtom.isChildOf.length > 0) {
        event.sender.send(`${constants_1.GET_PARENTS}-${srcAtomID}-resp`, srcAtom.isChildOf.map((parent) => parent.childLabel));
    }
}));
electron_2.ipcMain.on(constants_1.GET_CHILDREN, (event, { label, projectID }) => __awaiter(void 0, void 0, void 0, function* () {
    const srcAtom = yield prisma.atomSource.findFirst({
        where: { label: label, projectID: number.parse(projectID) },
        include: { isParentOf: true },
    });
    if (srcAtom && srcAtom.isParentOf.length > 0) {
        event.sender.send(`${constants_1.GET_PARENTS}-${label}-resp`, srcAtom.isParentOf.map((child) => child.childLabel));
    }
}));
electron_2.ipcMain.on(constants_1.GET_TO_RELATIONS, (event, { label, projectID }) => __awaiter(void 0, void 0, void 0, function* () {
    const relations = yield prisma.relation.findMany({
        where: { toLabel: label, projectID: number.parse(projectID) },
    });
    if (relations) {
        event.sender.send(`${constants_1.GET_TO_RELATIONS}-${label}-resp`, relations);
    }
}));
