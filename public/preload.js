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
    /* TODO: Is this needed? */
    validateProjectName: (projectName) => {
        electron_1.ipcRenderer.send(constants_1.VALIDATE_NEW_PROJECT_FORM, projectName);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("project-name-validation", (event, valid) => resolve(valid));
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
    // getAtoms: (projectID: number) => {
    //   ipcRenderer.send(GET_ATOMS, projectID);
    //
    //   return new Promise((resolve) => {
    //     console.log("BRIDGE RECEIVED: GOT_ATOMS FROM MAIN");
    //     ipcRenderer.once("got-Atom", (event, atoms) => resolve(atoms));
    //   });
    // },
    getAtom: ({ projectID, atomID }) => {
        electron_1.ipcRenderer.send(constants_1.GET_ATOM, projectID, atomID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("got-atom", (event, atom) => resolve(atom));
        });
    },
    getAtomInstance: ({ projectID, testID, atomID, }) => {
        let returnChannel = uuidv4();
        electron_1.ipcRenderer.send(constants_1.GET_ATOM_INSTANCE, projectID, testID, atomID, returnChannel);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(returnChannel, (event, atom) => resolve(atom));
        });
    },
    getTests: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_TESTS, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("got-tests", (event, tests) => resolve(tests));
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
    // deleteAtom: (projectKey, testKey, atomID) => {
    //   ipcRenderer.send(DELETE_ATOM, projectKey, testKey, atomID);
    // },
    //
    // deleteConnections: (projectKey, testKey, atomId) => {
    //   ipcRenderer.send(DELETE_CONNECTION, projectKey, testKey, atomId);
    //   return new Promise((resolve) => {
    //     ipcRenderer.once("deleted-connection", (event, canvasState) =>
    //       resolve(canvasState)
    //     );
    //   });
    // },
    /* Given a From and To atom, create a connection between them */
    makeConnection: ({ fromAtom, toAtom, }) => {
        electron_1.ipcRenderer.send(constants_1.CREATE_CONNECTION, { fromAtom, toAtom });
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
    // listenForProjectsChange: (callback) => {
    //   ipcRenderer.on("project-update", callback);
    // },
    // getAtomMultiplicity: (projectKey, atomKey) => {
    //   let returnChannel = uuidv4();
    //   ipcRenderer.send(GET_ATOM_MULTIPLICITY, projectKey, atomKey, returnChannel);
    //   return new Promise((resolve) => {
    //     ipcRenderer.once(returnChannel, (event, multiplicity) =>
    //       resolve(multiplicity)
    //     );
    //   });
    // },
    // getAcceptTypes: (projectKey, sourceAtomKey) => {
    //   let returnChannel = uuidv4();
    //   ipcRenderer.send(
    //     GET_ACCEPT_TYPES,
    //     projectKey,
    //     sourceAtomKey,
    //     returnChannel
    //   );
    //   return new Promise((resolve) => {
    //     ipcRenderer.once(returnChannel, (event, types) => resolve(types));
    //   });
    // },
    getRelations: ({ projectID, sourceAtomID, }) => {
        let returnChannel = uuidv4();
        electron_1.ipcRenderer.send(constants_1.GET_RELATIONS, projectID, sourceAtomID, returnChannel);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(returnChannel, (event, relations) => resolve(relations));
        });
    },
    // getConnections: (projectKey, testKey, atomKey) => {
    //   let returnChannel = uuidv4();
    //   ipcRenderer.send(
    //     GET_CONNECTIONS,
    //     projectKey,
    //     testKey,
    //     atomKey,
    //     returnChannel
    //   );
    //   return new Promise((resolve) => {
    //     ipcRenderer.once(returnChannel, (event, connections) =>
    //       resolve(connections)
    //     );
    //   });
    // },
    runTest: ({ projectID, testID }) => {
        let returnChannel = uuidv4();
        electron_1.ipcRenderer.send(constants_1.RUN_TEST, projectID, testID, returnChannel);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(returnChannel, (event, testResponse) => resolve(testResponse));
        });
    },
    // getProjectTabs: (projectKey) => {
    //   ipcRenderer.send(GET_PROJECT_TABS, projectKey);
    //   return new Promise((resolve) => {
    //     ipcRenderer.once("got-tabs", (event, tabs, activeTab) =>
    //       resolve([tabs, activeTab])
    //     );
    //   });
    // },
    // setProjectTabs: (projectKey, tabs, activeTab) => {
    //   ipcRenderer.send(SET_PROJECT_TABS, projectKey, tabs, activeTab);
    // },
    setActiveTab: ({ projectID, testName, }) => {
        electron_1.ipcRenderer.send(constants_1.SET_ACTIVE_TAB, { projectID, testName });
    },
    getActiveTab: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_ACTIVE_TAB, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once(`${constants_1.GET_ACTIVE_TAB}-resp`, (event, activeTab) => resolve(activeTab));
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
    getPredicates: (projectID) => {
        electron_1.ipcRenderer.send(constants_1.GET_PREDICATES, projectID);
        return new Promise((resolve) => {
            electron_1.ipcRenderer.once("got-predicates", (event, predicates) => resolve(predicates));
        });
    },
    setPredicate: ({ projectID, predicateName, value, }) => {
        electron_1.ipcRenderer.send(constants_1.SET_PREDICATE_TEST, projectID, predicateName, value);
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
};
electron_1.contextBridge.exposeInMainWorld("electronAPI", api);
