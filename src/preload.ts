import { ipcRenderer, contextBridge } from "electron";
import unhandled from "electron-unhandled";
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
  GET_RELATIONS,
  GET_CONNECTIONS,
  RUN_TEST,
  SET_ACTIVE_TEST,
  DELETE_TEST,
  GET_ATOM,
  GET_ATOMS,
  GET_PREDICATES,
  GET_ATOM_SHAPE,
  SET_ATOM_SHAPE,
  GET_ATOM_INSTANCE,
  VALIDATE_NEW_PROJECT_FORM,
  GET_PROJECT,
  DELETE_PROJECT,
  GET_ATOM_SOURCES,
  READ_TEST,
  TEST_CAN_ADD_ATOM,
  TEST_ADD_ATOM,
  OPEN_TEST,
  GET_ACTIVE_TEST,
  GET_ATOM_SOURCE,
  CLOSE_TEST,
  UPDATE_ATOM,
  UPDATE_PRED_STATE,
  UPDATE_PRED_PARAM,
  GET_PARENTS,
  GET_CHILDREN,
  GET_TO_RELATIONS,
  UPDATE_ATOM_NICK,
  CREATE_DEPENDENT_CONNECTION,
} from "./utils/constants";
import { Project, Relation, Test } from "@prisma/client";
import { NewProject } from "./validation/formValidation";
import { AtomWithSource, PredInstanceWithParams, TestWithCanvas } from "./main";

unhandled();
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
  closeTest: ({
    projectID,
    testID,
  }: {
    projectID: number;
    testID: number;
  }) => Promise<unknown>;
}

import { v4 as uuidv4 } from "uuid";
// import * as events from "events";
// events.EventEmitter.defaultMaxListeners = 0;
// const projectSelect = require("../src/components/ProjectSelection/ProjectSelect");

const api = {
  /* Given the id of a test object, returns said Test object. */
  readTest: (testID: number): Promise<TestWithCanvas> => {
    const returnKey = uuidv4();
    console.log("TEST ID: ", testID);
    console.log("Preload loading tests.");
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

  getTests: (projectID: number) => {
    ipcRenderer.send(GET_TESTS, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_TESTS}-resp`, (event, tests) => resolve(tests));
    });
  },

  selectFile: () => {
    ipcRenderer.send(SELECT_FILE);

    return new Promise((resolve) => {
      ipcRenderer.once("file-selected", (event, filePath) => resolve(filePath));
    });
  },

  createNewProject: (data: NewProject) => {
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
    const returnChannel = uuidv4();
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

  /* Given a From and To atom, create a connection between them */
  createConnection: ({
    projectID,
    testID,
    fromAtom,
    toAtom,
    relation,
  }: {
    projectID: number;
    testID: number;
    fromAtom: AtomWithSource;
    toAtom: AtomWithSource;
    relation: Relation;
  }) => {
    ipcRenderer.send(CREATE_CONNECTION, {
      projectID,
      testID,
      fromAtom,
      toAtom,
      relation,
    });

    return new Promise((resolve) => {
      ipcRenderer.once(`${CREATE_CONNECTION}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },

  createDependentConnection: ({
                       projectID,
                       testID,
                       fromAtom,
                       toAtom,
                       relation,
                       dependency
                     }: {
    projectID: number;
    testID: number;
    fromAtom: AtomWithSource;
    toAtom: AtomWithSource;
    relation: Relation;
    dependency: number;
  }) => {
    ipcRenderer.send(CREATE_DEPENDENT_CONNECTION, {
      projectID,
      testID,
      fromAtom,
      toAtom,
      relation,
      dependency
    });

    return new Promise((resolve) => {
      ipcRenderer.once(`${CREATE_DEPENDENT_CONNECTION}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },

  deleteConnection: (atomID: number) => {
    ipcRenderer.send(DELETE_CONNECTION, atomID);
    return new Promise((resolve) => {
      ipcRenderer.once(`${DELETE_CONNECTION}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
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
  listenForProjectsChange: (callback: any) => {
    ipcRenderer.on("projects-update", callback);
  },

  listenForOpenProject: (callback: any) => {
    ipcRenderer.on("open-project", callback);
  },

  runTest: ({ projectID, testID }: { projectID: number; testID: number }) => {
    ipcRenderer.send(RUN_TEST, { projectID, testID });
    return new Promise((resolve) => {
      ipcRenderer.once(`${RUN_TEST}-${testID}-resp`, (event, testResponse) =>
        resolve(testResponse)
      );
    });
  },

  setActiveTest: ({
    projectID,
    testName,
  }: {
    projectID: number;
    testName: string;
  }) => {
    ipcRenderer.send(SET_ACTIVE_TEST, { projectID, testName });
  },

  getActiveTest: (projectID: number) => {
    ipcRenderer.send(GET_ACTIVE_TEST, projectID);

    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_ACTIVE_TEST}-resp`, (event, activeTab) =>
        resolve(activeTab)
      );
    });
  },

  closeTest: ({ projectID, testID }: { projectID: number; testID: number }) => {
    ipcRenderer.send(CLOSE_TEST, { projectID, testID });

    return new Promise((resolve) => {
      ipcRenderer.once(`${CLOSE_TEST}-resp`, (event, resp) => resolve(resp));
    });
  },

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

  deleteAtom: (atomID: number) => {
    ipcRenderer.send(DELETE_ATOM, atomID);
    return new Promise((resolve) => {
      ipcRenderer.once(`${DELETE_ATOM}-resp`,
        (event, resp) => resolve(resp))
    })
  },

  getPredicates: (testID: number) => {
    ipcRenderer.send(GET_PREDICATES, testID);
    return new Promise((resolve) => {
      ipcRenderer.once(
        `${GET_PREDICATES}-resp`,
        (event, predicates: PredInstanceWithParams[]) => resolve(predicates)
      );
    });
  },

  updatePredicateState: ({
    predicateID,
    state,
  }: {
    predicateID: number;
    state: boolean | null;
  }) => {
    ipcRenderer.send(UPDATE_PRED_STATE, { predicateID, state });
  },

  updatePredParam: ({
    predParamID,
    atomID,
  }: {
    predParamID: number;
    atomID: number | null;
  }) => {
    ipcRenderer.send(UPDATE_PRED_PARAM, { predParamID, atomID });
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

  testCanAddAtom: ({
    testID,
    sourceAtomID,
  }: {
    testID: number;
    sourceAtomID: number;
  }) => {
    console.log("preload: Test Can Add");
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

  updateAtom: ({
    atomID,
    left,
    top,
  }: {
    atomID: number;
    left: number;
    top: number;
  }) => {
    ipcRenderer.send(UPDATE_ATOM, { atomID, left, top });
  },

  updateAtomNickname: ({atomID, nickName, testID}: {atomID: string, nickName: string, testID: string}) => {
    console.log("Preload says hi.")
    console.log(atomID, nickName, testID)
    ipcRenderer.send(UPDATE_ATOM_NICK, atomID, nickName, testID);
    return new Promise((resolve) => {
      ipcRenderer.once(`${UPDATE_ATOM_NICK}-resp`, (event, resp) => {
        resolve(resp)
      })
    })
  },

  getAtomParents: (srcAtomID: number): Promise<string[]> => {
    ipcRenderer.send(GET_PARENTS, srcAtomID);
    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_PARENTS}-${srcAtomID}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },
  getAtomChildren: ({
    label,
    projectID,
  }: {
    label: string;
    projectID: number;
  }): Promise<string[]> => {
    ipcRenderer.send(GET_CHILDREN, { label, projectID });
    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_CHILDREN}-${label}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },
  getRelationsToAtom({
    projectID,
    label,
  }: {
    projectID: number;
    label: string;
  }): Promise<Relation[]> {
    ipcRenderer.send(GET_TO_RELATIONS, { label, projectID });
    return new Promise((resolve) => {
      ipcRenderer.once(`${GET_TO_RELATIONS}-${label}-resp`, (event, resp) =>
        resolve(resp)
      );
    });
  },

  getOpenProject() {
    ipcRenderer.send('get-active-project');
    return new Promise((resolve) => {
      ipcRenderer.once('get-active-project-resp', (event, resp) => resolve(resp))
    })
  },

  connectionNodeEnabled({relationDependsOn, atomID}: {relationDependsOn: string, atomID: number}): Promise<boolean> {
    ipcRenderer.send('is-connection-enabled', {relationDependsOn, atomID});

    return new Promise((resolve) => {
      ipcRenderer.once(`is-connection-${atomID + relationDependsOn}-enabled-resp`, (event, resp) => resolve(resp))
    })
  }
};

contextBridge.exposeInMainWorld("electronAPI", api);
