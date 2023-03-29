let constants = {
  // API CHANNELS

  // ATOMS
  GET_ATOM_SOURCES: "get-atom-sources",
  GET_ATOM_SOURCE: "get-atom-source",
  GET_ATOM: "get-atom",
  GET_ATOMS: "get-atoms",
  GET_ATOM_INSTANCE: "get-atom-instance",
  GET_CONNECTIONS: "get-connection",
  GET_ATOM_COLOR: "get-atom-color",
  GET_ATOM_LABEL: "get-atom-label",
  GET_ATOM_SHAPE: "get-atom-shape",
  GET_ATOM_MULTIPLICITY: "get-atom-multiplicity",
  GET_PREDICATES: "get-predicates",
  UPDATE_PRED_STATE: "update-predicate-state",
  UPDATE_PRED_PARAM: "update-predicate-param",
  GET_ACCEPT_TYPES: "get-accept-types",
  GET_PARENTS: "get-atom-parents",
  GET_CHILDREN: "get-atom-children",
  GET_RELATIONS: "get-relations",
  GET_TO_RELATIONS: "get-to-relations",

  SET_ATOM_COLOR: "set-atom-color",
  SET_ATOM_LABEL: "set-atom-label",
  SET_ATOM_SHAPE: "set-atom-shape",
  SET_ATOM_INSTANCE_NICKNAME: "set-atom-instance-nickname",

  CREATE_ATOM: "create-atom",
  CREATE_CONNECTION: "make-connection",

  UPDATE_ATOM: "update-atom",

  DELETE_ATOM: "delete-atom",
  DELETE_CONNECTION: "delete-connection",

  // PROJECT
  GET_PROJECT: "get-project",
  GET_PROJECTS: "get-projects",
  GET_PROJECT_FILE: "get-project-file",
  GET_HOME_DIRECTORY: "get-home-directory",
  GET_PROJECT_TABS: "get-project-tabs",
  VALIDATE_NEW_PROJECT_FORM: "validate-project-name",
  DELETE_PROJECT: "delete-project",

  SET_PROJECT_TABS: "set-project-tabs",

  OPEN_AND_SET_ACTIVE: "open-and-set-active",
  SELECT_FILE: "select-file",
  CREATE_NEW_PROJECT: "create-new-project",
  UPDATE_PROJECT_FILE: "set-project-file",
  OPEN_PROJECT: "open-project",

  // TESTS
  FETCH_DATA_FROM_STORAGE: "fetch-data-from-storage",
  HANDLE_FETCH_DATA: "handle-fetch-data",
  SAVE_DATA_TO_STORAGE: "save-data-to-storage",
  HANDLE_SAVE_DATA: "handle-save-data",
  GET_TESTS: "get-tests",
  RUN_TEST: "convert-to-command-string",
  CREATE_NEW_TEST: "create-new-test",
  READ_TEST: "read-test",
  TEST_CAN_ADD_ATOM: "test-can-add-atom", // is atom at multiplicity constraint? true / false
  TEST_ADD_ATOM: "test-add-atom",
  OPEN_TEST: "open-test",
  SET_ACTIVE_TEST: "set-active-tab",
  GET_ACTIVE_TEST: "get-active-tab",
  CLOSE_TEST: "close-test",
  DELETE_TEST: "delete-test",

  // CANVAS
  SAVE_CANVAS_STATE: "save-canvas-state",

  // UI VARIABLES
  SIDEBAR_WIDTH: 350,
  SIDEBAR_HEIGHT: 700,

  // ITEM TYPES
  ATOM: "Atom",
  ATOM_SOURCE: "AtomSource",
  CONNECTION: "Connection",
};

export = constants;
