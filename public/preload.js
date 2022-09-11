const { ipcRenderer, contextBridge } = require('electron');
require('events').EventEmitter.defaultMaxListeners = 0
const { v4: uuidv4 } =require('uuid')

const {SAVE_CANVAS_STATE, LOAD_CANVAS_STATE, UPDATE_PROJECT_FILE, GET_PROJECT_FILE, GET_ATOMS, GET_PROJECTS, OPEN_PROJECT,
    GET_TESTS,
    SELECT_FILE,
    CREATE_NEW_PROJECT,
    GET_HOME_DIRECTORY,
    CREATE_NEW_TEST,
    SET_ATOM_COLOR,
    GET_ATOM_COLOR,
    GET_ATOM_LABEL,
    SET_ATOM_LABEL,
    MAKE_CONNECTION,
    DELETE_ATOM,
    DELETE_CONNECTION
} = require("../src/utils/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    saveCanvasState: (canvasItems, projectKey, testKey) => ipcRenderer.send(SAVE_CANVAS_STATE, canvasItems, projectKey, testKey),

    loadCanvasState: (projectKey, testKey) => {
        console.log("API received LOAD_CANVAS_STATE from tab ", testKey)
        ipcRenderer.send(LOAD_CANVAS_STATE, projectKey, testKey)

        return new Promise((resolve) => {
            ipcRenderer.once('loaded-canvas-state', (event, canvasState) => resolve(canvasState))
        })
    },

    getProjects: () => {
      ipcRenderer.send(GET_PROJECTS)

      return new Promise((resolve) => {
          ipcRenderer.once('get-projects-success', (event, projects) => resolve(projects))
      })
    },

    getProjectFile: (projectKey) => {
        ipcRenderer.send(GET_PROJECT_FILE, projectKey)

        return new Promise((resolve) => {
            ipcRenderer.once('got-project-file', (event, filePath) => resolve(filePath))
        })
    },

    updateProjectFile: (projectKey) => {
        ipcRenderer.send(UPDATE_PROJECT_FILE, projectKey)
        return new Promise( (resolve) => {
            ipcRenderer.once('project-file-set', (event, filePath) => resolve(filePath))
        })
    },

    getAtoms: (projectKey) => {
        ipcRenderer.send(GET_ATOMS, projectKey)

        return new Promise( (resolve) => {
            console.log("BRIDGE RECEIVED: GOT_ATOMS FROM MAIN");
            ipcRenderer.once('got-atoms', (event, atoms) => resolve(atoms))
        })
    },

    getTests: (projectKey) => {
        ipcRenderer.send(GET_TESTS, projectKey)

        return new Promise((resolve) => {
            ipcRenderer.once('got-tests', (event, tests) => resolve(tests))
        })
    },

    selectFile: () => {
        ipcRenderer.send(SELECT_FILE)

        return new Promise((resolve) => {
            ipcRenderer.once('file-selected', (event, filePath) => resolve(filePath))
        })
    },

    createNewProject: (alloyFile, projectName, projectDirectory) => { ipcRenderer.send(CREATE_NEW_PROJECT, alloyFile, projectName, projectDirectory) },

    openProject: (projectKey) => { ipcRenderer.send(OPEN_PROJECT, projectKey) },

    getHomeDirectory: () => {
        ipcRenderer.send(GET_HOME_DIRECTORY)
        return new Promise((resolve) => {
            ipcRenderer.once('got-home-directory', (event, homedir) => resolve(homedir))
        });
    },

    createNewTest: (projectKey, testName) => {
        ipcRenderer.send(CREATE_NEW_TEST, projectKey, testName)
        return new Promise((resolve) => {
            ipcRenderer.once('created-new-test', (event, test) => resolve(test))
        })
    },

    getAtomColor: (projectKey, atomSourceKey) => {
        let returnChannel = uuidv4();
        ipcRenderer.send(GET_ATOM_COLOR, projectKey, atomSourceKey, returnChannel)
        return new Promise((resolve) => {
            ipcRenderer.once(returnChannel, (event, atomColor) => resolve(atomColor))
        })
    },

    setAtomColor: (projectKey, atomKey, atomColor) => {
        ipcRenderer.send(SET_ATOM_COLOR, projectKey, atomKey, atomColor)
    },

    getAtomLabel: (projectKey, atomKey) => {
        let returnChannel = uuidv4();
        ipcRenderer.send(GET_ATOM_LABEL, projectKey, atomKey, returnChannel)
        return new Promise((resolve) => {
            ipcRenderer.once(returnChannel, (event, atomLabel) => resolve(atomLabel))
        })
    },

    setAtomLabel: (projectKey, atomKey, atomLabel) => {
        ipcRenderer.send(SET_ATOM_LABEL, projectKey, atomKey, atomLabel)
    },

    deleteAtom: (projectKey, testKey, atomID) => {
        ipcRenderer.send(DELETE_ATOM, projectKey, testKey, atomID)
        return new Promise((resolve) => {
             ipcRenderer.once('deleted-atom', (event, canvasState) => resolve(canvasState))
        })
    },

    deleteConnections: (projectKey, testKey, atomId) => {
        ipcRenderer.send(DELETE_CONNECTION, projectKey, testKey, atomId)
        return new Promise((resolve) => {
            ipcRenderer.once('deleted-connection',
                (event, canvasState) => resolve(canvasState)
            )
        })
    },

    makeConnection: (projectKey, testKey, fromAtom, toAtom) => {
        ipcRenderer.send(MAKE_CONNECTION, projectKey, testKey, fromAtom, toAtom)
        return new Promise((resolve) => {
            ipcRenderer.once('made-connection',
                (event, canvasState) => resolve(canvasState)
            )
        })
    }
})