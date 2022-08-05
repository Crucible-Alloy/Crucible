const { ipcRenderer, contextBridge } = require('electron');
const {SAVE_CANVAS_STATE, LOAD_CANVAS_STATE, UPDATE_PROJECT_FILE, GET_PROJECT_FILE, GET_ATOMS, GET_PROJECTS, OPEN_PROJECT,
    GET_TESTS,
    SELECT_FILE,
    CREATE_NEW_PROJECT,
    GET_HOME_DIRECTORY
} = require("../src/utils/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    saveCanvasState: (canvasItems, tabKey) => ipcRenderer.send(SAVE_CANVAS_STATE, canvasItems, tabKey),
    loadCanvasState: (tabKey) => {
        console.log("API received LOAD_CANVAS_STATE from tab ", tabKey)
        ipcRenderer.send(LOAD_CANVAS_STATE, tabKey)

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
    }
})