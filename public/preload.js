"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const constants_1 = require("../src/utils/constants");
const { v4: uuidv4 } = require("uuid");
require("events").EventEmitter.defaultMaxListeners = 0;
//const projectSelect = require("../src/components/ProjectSelection/ProjectSelect");
const api = {
    /* Given the id of a test object, returns said Test object. */
    readTest: (testID) => {
        let returnKey = uuidv4();
        console.log("TEST ID: ", testID);
        console.log("Preload loading tests.");
        electron_1.ipcRenderer.send(constants_1.READ_TEST, { testID, returnKey });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(returnKey, (event, canvasState) => resolve(canvasState));
        });
    },
    /* Given the id of a project object, returns said project object. */
    readProject: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_PROJECT, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("get-project-resp", (event, project) => resolve(project));
        });
    },
    /* Returns an array of all projects in the database. */
    getAllProjects: () => {
        electron_1.ipcRenderer.send(constants_1.GET_PROJECTS);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("get-projects-success", (event, projects) => resolve(projects));
        });
    },
    /* Given a project id, returns the file path of the alloy file associated. */
    getProjectFile: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_PROJECT_FILE, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("got-project-file", (event, filePath) => resolve(filePath));
        });
    },
    // TODO: Below this, finish out proper function signatures and finish interface.
    /* Given a projectID and file path, update the Projects associated alloy file */
    /* TODO: Check implementation on main.ts, can we just write one updateProject()? */
    updateProjectFile: (projectID, filePath) => {
        electron_1.ipcRenderer.send(constants_1.UPDATE_PROJECT_FILE, { projectID, filePath });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("project-file-set", (event, filePath) => resolve(filePath));
        });
    },
    /* Given a projectID, delete the project from the database. */
    /* TODO: Check implementation on main */
    deleteProject: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.DELETE_PROJECT, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("delete-project-resp", (event, resp) => resolve(resp));
        });
    },
    getAtomSources: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_ATOM_SOURCES, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("get-atom-sources-resp", (event, atoms) => resolve(atoms));
        });
    },
    getAtomSource: (srcAtomID) => {
        electron_1.ipcRenderer.send(constants_1.GET_ATOM_SOURCE, { srcAtomID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("get-atom-sources-resp", (event, atoms) => resolve(atoms));
        });
    },
    getTests: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_TESTS, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_TESTS}-resp`, (event, tests) => resolve(tests));
        });
    },
    selectFile: () => {
        electron_1.ipcRenderer.send(constants_1.SELECT_FILE);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("file-selected", (event, filePath) => resolve(filePath));
        });
    },
    createNewProject: (data) => {
        electron_1.ipcRenderer.send(constants_1.CREATE_NEW_PROJECT, data);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("new-project-resp", (event, resp) => resolve(resp));
        });
    },
    openProject: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.OPEN_PROJECT, projectID);
    },
    getHomeDirectory: () => {
        electron_1.ipcRenderer.send(constants_1.GET_HOME_DIRECTORY);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("got-home-directory", (event, homedir) => resolve(homedir));
        });
    },
    createNewTest: ({ projectID, testName, }) => {
        electron_1.ipcRenderer.send(constants_1.CREATE_NEW_TEST, projectID, testName);
        console.log("IPC RENDERER");
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("created-new-test", (event, test) => resolve(test));
        });
    },
    getAtomColor: ({ projectID, atomSourceID, }) => {
        let returnChannel = uuidv4();
        electron_1.ipcRenderer.send(constants_1.GET_ATOM_COLOR, projectID, atomSourceID, returnChannel);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(returnChannel, (event, atomColor) => resolve(atomColor));
        });
    },
    setAtomColor: ({ sourceAtomID, color, }) => {
        electron_1.ipcRenderer.send(constants_1.SET_ATOM_COLOR, { sourceAtomID, color });
    },
    // getAtomLabel: (projectKey, atomKey) => {
    //   let returnChannel = uuidv4();
    //   ipcRenderer.send(GET_ATOM_LABEL, projectKey, atomKey, returnChannel);
    //   return new Promise((resolve) => {
    //     ipcRenderer.once(returnChannel, (event, atomLabel) => resolve(atomLabel));
    //   });
    // },
    // setAtomLabel: (projectKey, atomKey, atomLabel) => {
    //   ipcRenderer.send(SET_ATOM_LABEL, projectKey, atomKey, atomLabel);
    // },
    //
    /* Given a From and To atom, create a connection between them */
    createConnection: ({ projectID, testID, fromAtom, toAtom, }) => {
        electron_1.ipcRenderer.send(constants_1.CREATE_CONNECTION, {
            projectID,
            testID,
            fromAtom,
            toAtom,
        });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.CREATE_CONNECTION}-resp`, (event, resp) => resolve(resp));
        });
    },
    deleteConnection: (connID) => {
        electron_1.ipcRenderer.send(constants_1.DELETE_CONNECTION, connID);
    },
    listenForCanvasChange: (callback) => {
        electron_1.ipcRenderer.on("canvas-update", callback);
    },
    listenForMetaDataChange: (callback) => {
        electron_1.ipcRenderer.on("meta-data-update", callback);
    },
    listenForColorChange: (callback) => {
        electron_1.ipcRenderer.on("color-update", callback);
    },
    listenForTabsChange: (callback) => {
        electron_1.ipcRenderer.on("tabs-update", callback);
    },
    listenForPredicatesChange: (callback) => {
        electron_1.ipcRenderer.on("predicates-update", callback);
    },
    // listenForShapeChange: (callback) => {
    //   ipcRenderer.on("shape-update", callback);
    // },
    //
    listenForProjectsChange: (callback) => {
        electron_1.ipcRenderer.on("projects-update", callback);
    },
    runTest: ({ projectID, testID }) => {
        electron_1.ipcRenderer.send(constants_1.RUN_TEST, { projectID, testID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.RUN_TEST}-${testID}-resp`, (event, testResponse) => resolve(testResponse));
        });
    },
    setActiveTest: ({ projectID, testName, }) => {
        electron_1.ipcRenderer.send(constants_1.SET_ACTIVE_TEST, { projectID, testName });
    },
    getActiveTest: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_ACTIVE_TEST, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_ACTIVE_TEST}-resp`, (event, activeTab) => resolve(activeTab));
        });
    },
    closeTest: ({ projectID, testID }) => {
        electron_1.ipcRenderer.send(constants_1.CLOSE_TEST, { projectID, testID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.CLOSE_TEST}-resp`, (event, resp) => resolve(resp));
        });
    },
    deleteTest: ({ projectID, testID, }) => {
        electron_1.ipcRenderer.send(constants_1.DELETE_TEST, projectID, testID);
    },
    testAddAtom: ({ testID, sourceAtomID, top, left, }) => {
        electron_1.ipcRenderer.send(constants_1.TEST_ADD_ATOM, { testID, sourceAtomID, top, left });
    },
    deleteAtom: (atomID) => {
        electron_1.ipcRenderer.send(constants_1.DELETE_ATOM, atomID);
    },
    getPredicates: (testID) => {
        electron_1.ipcRenderer.send(constants_1.GET_PREDICATES, testID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_PREDICATES}-resp`, (event, predicates) => resolve(predicates));
        });
    },
    updatePredicateState: ({ predicateID, state, }) => {
        electron_1.ipcRenderer.send(constants_1.UPDATE_PRED_STATE, { predicateID, state });
    },
    updatePredParam: ({ predParamID, atomID, }) => {
        electron_1.ipcRenderer.send(constants_1.UPDATE_PRED_PARAM, { predParamID, atomID });
    },
    // getAtomShape: (projectKey, sourceAtomKey) => {
    //   ipcRenderer.send(GET_ATOM_SHAPE, projectKey, sourceAtomKey);
    //   return new Promise((resolve) => {
    //     ipcRenderer.once("got-atom-shape", (event, shape) => resolve(shape));
    //   });
    // },
    setAtomShape: (args) => {
        electron_1.ipcRenderer.send(constants_1.SET_ATOM_SHAPE, args);
    },
    // setAtomInstanceNickname: (projectKey, testKey, atomKey, nickname) => {
    //   ipcRenderer.send(
    //     SET_ATOM_INSTANCE_NICKNAME,
    //     projectKey,
    //     testKey,
    //     atomKey,
    //     nickname
    //   );
    // },
    testCanAddAtom: ({ testID, sourceAtomID, }) => {
        console.log("preload: Test Can Add");
        electron_1.ipcRenderer.send(constants_1.TEST_CAN_ADD_ATOM, { testID, sourceAtomID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.TEST_CAN_ADD_ATOM}-resp`, (event, resp) => resolve(resp));
        });
    },
    openTest: ({ testID, projectID }) => {
        electron_1.ipcRenderer.send(constants_1.OPEN_TEST, { testID, projectID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.OPEN_TEST}-resp`, (event, resp) => resolve(resp));
        });
    },
    updateAtom: ({ atomID, left, top, }) => {
        electron_1.ipcRenderer.send(constants_1.UPDATE_ATOM, { atomID, left, top });
    },
    getAtomParents: (srcAtomID) => {
        electron_1.ipcRenderer.send(constants_1.GET_PARENTS, srcAtomID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_PARENTS}-${srcAtomID}-resp`, (event, resp) => resolve(resp));
        });
    },
    getAtomChildren: ({ label, projectID, }) => {
        electron_1.ipcRenderer.send(constants_1.GET_CHILDREN, { label, projectID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_CHILDREN}-${label}-resp`, (event, resp) => resolve(resp));
        });
    },
    getRelationsToAtom({ projectID, label, }) {
        electron_1.ipcRenderer.send(constants_1.GET_TO_RELATIONS, { label, projectID });
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_TO_RELATIONS}-${label}-resp`, (event, resp) => resolve(resp));
        });
    },
};
electron_1.contextBridge.exposeInMainWorld("electronAPI", api);
