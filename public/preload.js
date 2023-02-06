const { ipcRenderer, contextBridge } = require("electron");
require("events").EventEmitter.defaultMaxListeners = 0;
const { v4: uuidv4 } = require("uuid");

const {
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
  SET_ATOM_COLOR,
  GET_ATOM_COLOR,
  GET_ATOM_LABEL,
  SET_ATOM_LABEL,
  CREATE_CONNECTION,
  DELETE_ATOM,
  DELETE_CONNECTION,
  GET_ATOM_MULTIPLICITY,
  GET_ACCEPT_TYPES,
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
  VALIDATE_NEW_PROJECT_FORM,
  GET_PROJECT,
  DELETE_PROJECT,
  GET_ATOM_SOURCES,
  GET_ATOM_SOURCE_RELATIONS_FROM,
  READ_TEST,
  TEST_CAN_ADD_ATOM,
  TEST_ADD_ATOM,
  OPEN_TEST,
  GET_ACTIVE_TAB,
  GET_ATOM_SOURCE,
} = require("../src/utils/constants");

//const projectSelect = require("../src/components/ProjectSelection/ProjectSelect");

contextBridge.exposeInMainWorld("electronAPI", {
  saveCanvasState: (canvasItems, projectKey, testKey) =>
    ipcRenderer.send(SAVE_CANVAS_STATE, canvasItems, projectKey, testKey),

  readTest: ({ testID }) => {
    let returnKey = uuidv4();
    ipcRenderer.send(READ_TEST, { testID, returnKey });

    return new Promise((resolve) => {
      ipcRenderer.once(returnKey, (event, canvasState) => resolve(canvasState));
    });
  },

  getProject: (projectID) => {
    ipcRenderer.send(GET_PROJECT, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once("get-project-resp", (event, project) =>
        resolve(project)
      );
    });
  },

  getProjects: () => {
    ipcRenderer.send(GET_PROJECTS);

    return new Promise((resolve) => {
      ipcRenderer.once("get-projects-success", (event, projects) =>
        resolve(projects)
      );
    });
  },

  getProjectFile: (projectKey) => {
    ipcRenderer.send(GET_PROJECT_FILE, projectKey);

    return new Promise((resolve) => {
      ipcRenderer.once("got-project-file", (event, filePath) =>
        resolve(filePath)
      );
    });
  },

  updateProjectFile: (projectKey) => {
    ipcRenderer.send(UPDATE_PROJECT_FILE, projectKey);
    return new Promise((resolve) => {
      ipcRenderer.once("project-file-set", (event, filePath) =>
        resolve(filePath)
      );
    });
  },

  validateProjectName: (projectName) => {
    ipcRenderer.send(VALIDATE_NEW_PROJECT_FORM, projectName);
    return new Promise((resolve) => {
      ipcRenderer.once("project-name-validation", (event, valid) =>
        resolve(valid)
      );
    });
  },

  deleteProject: (project) => {
    ipcRenderer.send(DELETE_PROJECT, project);
    return new Promise((resolve) => {
      ipcRenderer.once("delete-project-resp", (event, resp) => resolve(resp));
    });
  },

  getAtomSources: (projectID) => {
    ipcRenderer.send(GET_ATOM_SOURCES, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once("get-atom-sources-resp", (event, atoms) =>
        resolve(atoms)
      );
    });
  },

  getAtomSource: (srcAtomID) => {
    ipcRenderer.send(GET_ATOM_SOURCE, { srcAtomID });

    return new Promise((resolve) => {
      ipcRenderer.once("get-atom-sources-resp", (event, atoms) =>
        resolve(atoms)
      );
    });
  },

  getAtoms: (projectKey) => {
    ipcRenderer.send(GET_ATOMS, projectKey);

    return new Promise((resolve) => {
      console.log("BRIDGE RECEIVED: GOT_ATOMS FROM MAIN");
      ipcRenderer.once("got-Atom", (event, atoms) => resolve(atoms));
    });
  },

  getAtom: (projectKey, atomKey) => {
    ipcRenderer.send(GET_ATOM, projectKey, atomKey);

    return new Promise((resolve) => {
      ipcRenderer.once("got-atom", (event, atom) => resolve(atom));
    });
  },

  getAtomInstance: (projectKey, testKey, atomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(
      GET_ATOM_INSTANCE,
      projectKey,
      testKey,
      atomKey,
      returnChannel
    );

    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, atom) => resolve(atom));
    });
  },

  getTests: (projectID) => {
    ipcRenderer.send(GET_TESTS, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once("got-tests", (event, tests) => resolve(tests));
    });
  },

  selectFile: () => {
    ipcRenderer.send(SELECT_FILE);

    return new Promise((resolve) => {
      ipcRenderer.once("file-selected", (event, filePath) => resolve(filePath));
    });
  },

  createNewProject: (data) => {
    ipcRenderer.send(CREATE_NEW_PROJECT, data);
    return new Promise((resolve) => {
      ipcRenderer.once("new-project-resp", (event, resp) => resolve(resp));
    });
  },

  openProject: (projectKey) => {
    ipcRenderer.send(OPEN_PROJECT, projectKey);
  },

  getHomeDirectory: () => {
    ipcRenderer.send(GET_HOME_DIRECTORY);
    return new Promise((resolve) => {
      ipcRenderer.once("got-home-directory", (event, homedir) =>
        resolve(homedir)
      );
    });
  },

  createNewTest: ({ projectID, testName }) => {
    ipcRenderer.send(CREATE_NEW_TEST, projectID, testName);
    console.log("IPC RENDERER");
    return new Promise((resolve) => {
      ipcRenderer.once("created-new-test", (event, test) => resolve(test));
    });
  },

  getAtomColor: (projectKey, atomSourceKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_ATOM_COLOR, projectKey, atomSourceKey, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, atomColor) => resolve(atomColor));
    });
  },

  setAtomColor: ({ sourceAtomID, color }) => {
    ipcRenderer.send(SET_ATOM_COLOR, { sourceAtomID, color });
  },

  getAtomLabel: (projectKey, atomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_ATOM_LABEL, projectKey, atomKey, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, atomLabel) => resolve(atomLabel));
    });
  },

  setAtomLabel: (projectKey, atomKey, atomLabel) => {
    ipcRenderer.send(SET_ATOM_LABEL, projectKey, atomKey, atomLabel);
  },

  deleteAtom: (projectKey, testKey, atomID) => {
    ipcRenderer.send(DELETE_ATOM, projectKey, testKey, atomID);
  },

  deleteConnections: (projectKey, testKey, atomId) => {
    ipcRenderer.send(DELETE_CONNECTION, projectKey, testKey, atomId);
    return new Promise((resolve) => {
      ipcRenderer.once("deleted-connection", (event, canvasState) =>
        resolve(canvasState)
      );
    });
  },

  makeConnection: (
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
    ipcRenderer.send(
      CREATE_CONNECTION,
      projectKey,
      testKey,
      fromAtom,
      toAtom,
      fromAtomLabel,
      toAtomLabel,
      fromNickname,
      toNickname,
      connectionLabel
    );
  },

  listenForCanvasChange: (callback) => {
    ipcRenderer.on("canvas-update", callback);
  },

  listenForMetaDataChange: (callback) => {
    ipcRenderer.on("meta-data-update", callback);
  },

  listenForColorChange: (callback) => {
    ipcRenderer.on("color-update", callback);
  },

  listenForTabsChange: (callback) => {
    ipcRenderer.on("tabs-update", callback);
  },

  listenForPredicatesChange: (callback) => {
    ipcRenderer.on("predicates-update", callback);
  },

  listenForShapeChange: (callback) => {
    ipcRenderer.on("shape-update", callback);
  },

  listenForProjectsChange: (callback) => {
    ipcRenderer.on("project-update", callback);
  },

  getAtomMultiplicity: (projectKey, atomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_ATOM_MULTIPLICITY, projectKey, atomKey, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, multiplicity) =>
        resolve(multiplicity)
      );
    });
  },

  getAcceptTypes: (projectKey, sourceAtomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(
      GET_ACCEPT_TYPES,
      projectKey,
      sourceAtomKey,
      returnChannel
    );
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, types) => resolve(types));
    });
  },

  getRelations: (projectKey, sourceAtomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_RELATIONS, projectKey, sourceAtomKey, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, relations) => resolve(relations));
    });
  },

  getConnections: (projectKey, testKey, atomKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(
      GET_CONNECTIONS,
      projectKey,
      testKey,
      atomKey,
      returnChannel
    );
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, connections) =>
        resolve(connections)
      );
    });
  },

  runTest: (projectKey, testKey) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(RUN_TEST, projectKey, testKey, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, testResponse) =>
        resolve(testResponse)
      );
    });
  },

  getProjectTabs: (projectKey) => {
    ipcRenderer.send(GET_PROJECT_TABS, projectKey);
    return new Promise((resolve) => {
      ipcRenderer.once("got-tabs", (event, tabs, activeTab) =>
        resolve([tabs, activeTab])
      );
    });
  },

  setProjectTabs: (projectKey, tabs, activeTab) => {
    ipcRenderer.send(SET_PROJECT_TABS, projectKey, tabs, activeTab);
  },

  setActiveTab: ({ projectID, testName }) => {
    ipcRenderer.send(SET_ACTIVE_TAB, { projectID, testName });
  },

  getActiveTab: (projectID) => {
    ipcRenderer.send(GET_ACTIVE_TAB, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_ACTIVE_TAB}-resp`, (event, activeTab) =>
        resolve(activeTab)
      );
    });
  },

  openTab: (projectKey, tab) => {
    ipcRenderer.send(OPEN_AND_SET_ACTIVE, projectKey, tab);
  },

  closeTab: ({ projectID, testID }) => {
    ipcRenderer.send(CLOSE_TAB, { projectID, testID });
  },

  deleteTest: (projectKey, testKey) => {
    ipcRenderer.send(DELETE_TEST, projectKey, testKey);
  },

  testAddAtom: ({ testID, sourceAtomID }) => {
    ipcRenderer.send(TEST_ADD_ATOM, { testID, sourceAtomID });
  },

  getPredicates: (projectKey) => {
    ipcRenderer.send(GET_PREDICATES, projectKey);
    return new Promise((resolve) => {
      ipcRenderer.once("got-predicates", (event, predicates) =>
        resolve(predicates)
      );
    });
  },

  setPredicate: (projectKey, predicateName, value) => {
    ipcRenderer.send(SET_PREDICATE_TEST, projectKey, predicateName, value);
  },

  getAtomShape: (projectKey, sourceAtomKey) => {
    ipcRenderer.send(GET_ATOM_SHAPE, projectKey, sourceAtomKey);
    return new Promise((resolve) => {
      ipcRenderer.once("got-atom-shape", (event, shape) => resolve(shape));
    });
  },

  setAtomShape: (projectKey, sourceAtomKey, shape) => {
    ipcRenderer.send(SET_ATOM_SHAPE, projectKey, sourceAtomKey, shape);
  },

  setAtomInstanceNickname: (projectKey, testKey, atomKey, nickname) => {
    ipcRenderer.send(
      SET_ATOM_INSTANCE_NICKNAME,
      projectKey,
      testKey,
      atomKey,
      nickname
    );
  },

  testCanAddAtom: ({ testID, sourceAtomID }) => {
    ipcRenderer.send(TEST_CAN_ADD_ATOM, { testID, sourceAtomID });

    return new Promise((resolve) => {
      ipcRenderer.once(`${TEST_CAN_ADD_ATOM}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },

  openTest: ({ testID, projectID }) => {
    ipcRenderer.send(OPEN_TEST, { testID, projectID });

    return new Promise((resolve) => {
      ipcRenderer.once(`${OPEN_TEST}-resp`, (event, resp) => resolve(resp));
    });
  },
});
