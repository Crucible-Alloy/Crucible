import { ipcRenderer, contextBridge } from "electron";
import {
  SAVE_CANVAS_STATE,
  UPDATE_PROJECT_FILE,
  GET_PROJECT_FILE,
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
  GET_CONNECTIONS,
  RUN_TEST,
  GET_PROJECT_TABS,
  SET_PROJECT_TABS,
  OPEN_AND_SET_ACTIVE,
  SET_ACTIVE_TAB,
  CLOSE_TAB,
  DELETE_TEST,
  GET_ATOM,
  GET_ATOMS,
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
  READ_TEST,
  TEST_CAN_ADD_ATOM,
  TEST_ADD_ATOM,
  OPEN_TEST,
  GET_ACTIVE_TAB,
  GET_ATOM_SOURCE,
} from "../src/utils/constants";
import { Project, Relation, Test } from "@prisma/client";
import { NewProject } from "./validation/formValidation";
import { AtomWithSource, TestWithCanvas } from "./main";

export interface ElectronAPI {
  getHomeDirectory: () => Promise<string>;
  validateProjectName: (projectName: string) => Promise<boolean>;
  getAllProjects: typeof api.getAllProjects;
  openProject: (projectId: number) => any;
  deleteProject: (project: Project) => any;
  selectFile: () => string;
  getAtomRelationsFrom: (
    projectID: number,
    sourceAtomLabel: string
  ) => Promise<Relation[]>;
  setAtomColor: (data: SetColor) => any;
  getTests: (projectID: number) => Promise<Test[]>;
  createNewProject: (data: NewProject) => { success: boolean; error: any };
  createNewTest: (data: { projectID: number; testName: string }) => {
    success: boolean;
    error: any;
  };
  readTest: typeof api.readTest;
  readProject: typeof api.readProject;
  testCanAddAtom: (data: {
    testID: number;
    sourceAtomID: number;
  }) => Promise<{ success: boolean; error?: any }>;
  closeTab: (data: { projectID: number; testID: number }) => any;
  makeConnection: typeof api.makeConnection;
}

const { v4: uuidv4 } = require("uuid");
require("events").EventEmitter.defaultMaxListeners = 0;
//const projectSelect = require("../src/components/ProjectSelection/ProjectSelect");

const api = {
  /* Given the id of a test object, returns said Test object. */
  readTest: (testID: number): Promise<TestWithCanvas> => {
    let returnKey = uuidv4();
    ipcRenderer.send(READ_TEST, { testID, returnKey });
    return new Promise((resolve) => {
      ipcRenderer.once(returnKey, (event, canvasState: TestWithCanvas) =>
        resolve(canvasState)
      );
    });
  },

  /* Given the id of a project object, returns said project object. */
  readProject: (projectID: number): Promise<Project> => {
    ipcRenderer.send(GET_PROJECT, projectID);
    return new Promise((resolve) => {
      ipcRenderer.once("get-project-resp", (event, project: Project) =>
        resolve(project)
      );
    });
  },

  /* Returns an array of all projects in the database. */
  getAllProjects: (): Promise<Project[]> => {
    ipcRenderer.send(GET_PROJECTS);
    return new Promise((resolve) => {
      ipcRenderer.once("get-projects-success", (event, projects: Project[]) =>
        resolve(projects)
      );
    });
  },

  /* Given a project id, returns the file path of the alloy file associated. */
  getProjectFile: (projectID: number): Promise<string> => {
    ipcRenderer.send(GET_PROJECT_FILE, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once("got-project-file", (event, filePath: string) =>
        resolve(filePath)
      );
    });
  },

  // TODO: Below this, finish out proper function signatures and finish interface.

  /* Given a projectID and file path, update the Projects associated alloy file */
  /* TODO: Check implementation on main.ts, can we just write one updateProject()? */
  updateProjectFile: (projectID: number, filePath: string): Promise<string> => {
    ipcRenderer.send(UPDATE_PROJECT_FILE, { projectID, filePath });
    return new Promise((resolve) => {
      ipcRenderer.once("project-file-set", (event, filePath: string) =>
        resolve(filePath)
      );
    });
  },

  /* TODO: Is this needed? */
  validateProjectName: (projectName: string) => {
    ipcRenderer.send(VALIDATE_NEW_PROJECT_FORM, projectName);
    return new Promise((resolve) => {
      ipcRenderer.once("project-name-validation", (event, valid) =>
        resolve(valid)
      );
    });
  },

  /* Given a projectID, delete the project from the database. */
  /* TODO: Check implementation on main */
  deleteProject: (projectID: string) => {
    ipcRenderer.send(DELETE_PROJECT, projectID);
    return new Promise((resolve) => {
      ipcRenderer.once("delete-project-resp", (event, resp) => resolve(resp));
    });
  },

  getAtomSources: (projectID: number) => {
    ipcRenderer.send(GET_ATOM_SOURCES, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once("get-atom-sources-resp", (event, atoms) =>
        resolve(atoms)
      );
    });
  },

  getAtomSource: (srcAtomID: number) => {
    ipcRenderer.send(GET_ATOM_SOURCE, { srcAtomID });

    return new Promise((resolve) => {
      ipcRenderer.once("get-atom-sources-resp", (event, atoms) =>
        resolve(atoms)
      );
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

  getAtom: ({ projectID, atomID }: { projectID: number; atomID: number }) => {
    ipcRenderer.send(GET_ATOM, projectID, atomID);

    return new Promise((resolve) => {
      ipcRenderer.once("got-atom", (event, atom) => resolve(atom));
    });
  },

  getAtomInstance: ({
    projectID,
    testID,
    atomID,
  }: {
    projectID: number;
    testID: number;
    atomID: number;
  }) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(
      GET_ATOM_INSTANCE,
      projectID,
      testID,
      atomID,
      returnChannel
    );

    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, atom) => resolve(atom));
    });
  },

  getTests: (projectID: number) => {
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

  createNewProject: (data: any) => {
    ipcRenderer.send(CREATE_NEW_PROJECT, data);
    return new Promise((resolve) => {
      ipcRenderer.once("new-project-resp", (event, resp) => resolve(resp));
    });
  },

  openProject: (projectID: number) => {
    ipcRenderer.send(OPEN_PROJECT, projectID);
  },

  getHomeDirectory: () => {
    ipcRenderer.send(GET_HOME_DIRECTORY);
    return new Promise((resolve) => {
      ipcRenderer.once("got-home-directory", (event, homedir) =>
        resolve(homedir)
      );
    });
  },

  createNewTest: ({
    projectID,
    testName,
  }: {
    projectID: number;
    testName: string;
  }) => {
    ipcRenderer.send(CREATE_NEW_TEST, projectID, testName);
    console.log("IPC RENDERER");
    return new Promise((resolve) => {
      ipcRenderer.once("created-new-test", (event, test) => resolve(test));
    });
  },

  getAtomColor: ({
    projectID,
    atomSourceID,
  }: {
    projectID: number;
    atomSourceID: number;
  }) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_ATOM_COLOR, projectID, atomSourceID, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, atomColor) => resolve(atomColor));
    });
  },

  setAtomColor: ({
    sourceAtomID,
    color,
  }: {
    sourceAtomID: number;
    color: string;
  }) => {
    ipcRenderer.send(SET_ATOM_COLOR, { sourceAtomID, color });
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
  makeConnection: ({
    fromAtom,
    toAtom,
  }: {
    fromAtom: AtomWithSource;
    toAtom: AtomWithSource;
  }) => {
    ipcRenderer.send(CREATE_CONNECTION, { fromAtom, toAtom });
  },

  listenForCanvasChange: (callback: any) => {
    ipcRenderer.on("canvas-update", callback);
  },

  listenForMetaDataChange: (callback: any) => {
    ipcRenderer.on("meta-data-update", callback);
  },

  listenForColorChange: (callback: any) => {
    ipcRenderer.on("color-update", callback);
  },

  listenForTabsChange: (callback: any) => {
    ipcRenderer.on("tabs-update", callback);
  },

  listenForPredicatesChange: (callback: any) => {
    ipcRenderer.on("predicates-update", callback);
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

  getRelations: ({
    projectID,
    sourceAtomID,
  }: {
    projectID: number;
    sourceAtomID: number;
  }) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(GET_RELATIONS, projectID, sourceAtomID, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, relations) => resolve(relations));
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

  runTest: ({ projectID, testID }: { projectID: number; testID: number }) => {
    let returnChannel = uuidv4();
    ipcRenderer.send(RUN_TEST, projectID, testID, returnChannel);
    return new Promise((resolve) => {
      ipcRenderer.once(returnChannel, (event, testResponse) =>
        resolve(testResponse)
      );
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

  setActiveTab: ({
    projectID,
    testName,
  }: {
    projectID: number;
    testName: string;
  }) => {
    ipcRenderer.send(SET_ACTIVE_TAB, { projectID, testName });
  },

  getActiveTab: (projectID: number) => {
    ipcRenderer.send(GET_ACTIVE_TAB, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_ACTIVE_TAB}-resp`, (event, activeTab) =>
        resolve(activeTab)
      );
    });
  },

  // openTab: (projectKey, tab) => {
  //   ipcRenderer.send(OPEN_AND_SET_ACTIVE, projectKey, tab);
  // },
  //
  // closeTab: ({ projectID, testID }) => {
  //   ipcRenderer.send(CLOSE_TAB, { projectID, testID });
  // },

  deleteTest: ({
    projectID,
    testID,
  }: {
    projectID: number;
    testID: number;
  }) => {
    ipcRenderer.send(DELETE_TEST, projectID, testID);
  },

  testAddAtom: ({
    testID,
    sourceAtomID,
    top,
    left,
  }: {
    testID: number;
    sourceAtomID: number;
    top: number;
    left: number;
  }) => {
    ipcRenderer.send(TEST_ADD_ATOM, { testID, sourceAtomID, top, left });
  },

  getPredicates: (projectID: number) => {
    ipcRenderer.send(GET_PREDICATES, projectID);
    return new Promise((resolve) => {
      ipcRenderer.once("got-predicates", (event, predicates) =>
        resolve(predicates)
      );
    });
  },

  setPredicate: ({
    projectID,
    predicateName,
    value,
  }: {
    projectID: number;
    predicateName: string;
    value: boolean | null;
  }) => {
    ipcRenderer.send(SET_PREDICATE_TEST, projectID, predicateName, value);
  },

  // getAtomShape: (projectKey, sourceAtomKey) => {
  //   ipcRenderer.send(GET_ATOM_SHAPE, projectKey, sourceAtomKey);
  //   return new Promise((resolve) => {
  //     ipcRenderer.once("got-atom-shape", (event, shape) => resolve(shape));
  //   });
  // },

  setAtomShape: (args: {
    projectID: number;
    sourceAtomID: number;
    shape: string;
  }) => {
    ipcRenderer.send(SET_ATOM_SHAPE, args);
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

  testCanAddAtom: ({
    testID,
    sourceAtomID,
  }: {
    testID: number;
    sourceAtomID: number;
  }) => {
    ipcRenderer.send(TEST_CAN_ADD_ATOM, { testID, sourceAtomID });

    return new Promise((resolve) => {
      ipcRenderer.once(`${TEST_CAN_ADD_ATOM}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },

  openTest: ({ testID, projectID }: { testID: number; projectID: number }) => {
    ipcRenderer.send(OPEN_TEST, { testID, projectID });

    return new Promise((resolve) => {
      ipcRenderer.once(`${OPEN_TEST}-resp`, (event, resp) => resolve(resp));
    });
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
