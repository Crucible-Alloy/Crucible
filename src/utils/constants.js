module.exports = {
  // API CHANNELS

  // ATOMS
  GET_ATOM_SOURCES: "get-Atom",
  GET_ATOM: "get-atom",
  GET_ATOM_INSTANCE: "get-atom-instance",
  GET_CONNECTIONS: "get-connection",
  GET_ATOM_COLOR: "get-atom-color",
  GET_ATOM_LABEL: "get-atom-label",
  GET_ATOM_SHAPE: "get-atom-shape",
  GET_ATOM_MULTIPLICITY: "get-atom-multiplicity",
  GET_PREDICATES: "get-predicates",
  GET_ACCEPT_TYPES: "get-accept-types",
  GET_RELATIONS: "get-relations",

  SET_ATOM_COLOR: "set-atom-color",
  SET_ATOM_LABEL: "set-atom-label",
  SET_ATOM_SHAPE: "set-atom-shape",
  SET_ATOM_INSTANCE_NICKNAME: "set-atom-instance-nickname",

  CREATE_ATOM: "create-atom",
  CREATE_CONNECTION: "make-connection",

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
  SET_ACTIVE_TAB: "set-active-tab",

  OPEN_AND_SET_ACTIVE: "open-and-set-active",
  SELECT_FILE: "select-file",
  CREATE_NEW_PROJECT: "create-new-project",
  UPDATE_PROJECT_FILE: "set-project-file",
  OPEN_PROJECT: "open-project",

  // TESTS
  FETCH_DATA_FROM_STORAGE: "fetch-data-from-storage",
  HANDLE_FETCH_DATA: "handle-fetch-data",
  SAVE_CANVAS_STATE: "save-canvas-state",
  LOAD_CANVAS_STATE: "load-canvas-state",
  SAVE_DATA_TO_STORAGE: "save-data-to-storage",
  HANDLE_SAVE_DATA: "handle-save-data",
  GET_TESTS: "get-tests",
  RUN_TEST: "convert-to-command-string",
  CREATE_NEW_TEST: "create-new-test",
  SET_PREDICATE_TEST: "set-predicate-test",

  CLOSE_TAB: "close-tab",
  DELETE_TEST: "delete-test",

  // UI VARIABLES
  SIDEBAR_WIDTH: 350,
  SIDEBAR_HEIGHT: 700,

  // ITEM TYPES
  ATOM: "Atom",
  ATOM_SOURCE: "AtomSource",
  CONNECTION: "Connection",
};
