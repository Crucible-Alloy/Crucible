
const path = require('path');
const {app, BrowserWindow, ipcMain, dialog, net} = require('electron');
const axios = require('axios');

// Global window variable
let mainWindow, projectSelectWindow;

// State persistence constants.
const { FETCH_DATA_FROM_STORAGE, HANDLE_FETCH_DATA,
        SAVE_CANVAS_STATE, LOAD_CANVAS_STATE, SET_PROJECT_FILE, GET_PROJECT_FILE, GET_ATOMS, GET_PROJECTS, OPEN_PROJECT,
    GET_TESTS
} = require("../src/utils/constants")

let itemsToTrack;

const Store = require('electron-store');

let store = new Store();

const isDev = true;
let springAPI;

// if (require("electron-is-dev")) {
//     app.quit();
// }

function createProjectSelectWindow() {

    projectSelectWindow = new BrowserWindow({
        width: 960,
        height: 640,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    projectSelectWindow.loadURL(
        isDev ?
            "http://localhost:3000/projects" :
            `${path.join(__dirname, '../build/index.html/projects')}`
    );

    if (isDev) {
        projectSelectWindow.webContents.openDevTools({mode: "detach"});
    }
}


function createMainWindow(projectKey) {

    mainWindow = new BrowserWindow({
        // Set browser window parameters
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    //Load index.html
    mainWindow.loadURL(
        isDev ?
            `http://localhost:3000/main/${projectKey}` :
            `${path.join(__dirname, `../build/index.html/main/${projectKey}`)}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools({mode: "detach"});
    }

}
    // Open dev tools on launch in dev mode

    // After initialization, create new browser window.
    // Some APIs only available after this call.
app.whenReady().then(() => {

    //createMainWindow("test-project");
    createProjectSelectWindow();

    const jarPath = `${path.join(__dirname, '../src/JARs/aSketch-API.jar')}`;
    springAPI = require('child_process').spawn('java', ['-jar', jarPath, '']);

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        //if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
        if (BrowserWindow.getAllWindows().length === 0) createProjectSelectWindow()
    });
});

// Close app on exit for linux/windows.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();

        // Shutdown spring-boot api
        const kill = require('tree-kill');
        kill(springAPI.pid);
    }
});


ipcMain.on(FETCH_DATA_FROM_STORAGE, (event, message) => {
    console.log("Main Received: FETCH_DATA_FROM_STORAGE with: ", message);
    mainWindow.send(HANDLE_FETCH_DATA, {
        success: true,
        message: message
    })

    store.get(message, (error, data) => {
        itemsToTrack = JSON.stringify(data) === '{}' ? [] : data;
        if (error) {
            mainWindow.send(HANDLE_FETCH_DATA, {
                success: false,
                message: "itemsToTrack not returned"
            });
        }
        else {
            mainWindow.send(HANDLE_FETCH_DATA, {
                success: true,
                message: itemsToTrack
            })
        }
    })
});

ipcMain.on(SAVE_CANVAS_STATE, (event, canvasItems, tabKey) => {

    console.log("Main Received: SAVE_CANVAS_STATE with: ", canvasItems);
    store.set(`${tabKey}.canvas`, canvasItems);

})

ipcMain.on(LOAD_CANVAS_STATE, (event, tabKey) => {
    console.log("Main Received: LOAD_CANVAS_STATE with: ", tabKey)

    // Send canvas state back to ipcRenderer via api.
    let canvasState = store.get(`${tabKey}.canvas`)
    event.sender.send('loaded-canvas-state', canvasState ? canvasState : {})
})

ipcMain.on(GET_PROJECT_FILE, (event, projectKey) => {
    console.log("MAIN: GET_PROJECT_FILE");

    let projectFile = store.get(`projects.${projectKey}.path`);
    event.sender.send('got-project-file', projectFile ? projectFile : null)
});

ipcMain.on(SET_PROJECT_FILE, (event, projectKey) => {
    console.log("Main Received: SET_MAIN_PROJECT_FILE")

    dialog.showOpenDialog({
        title: "Select Project File",
        filters: [
            {name: "Alloy Files", extensions: ["als"]},
            {name: "Any File", extensions: ["*"]}
        ],
        properties: ['openFile']
    }).then(function (response) {
        if (!response.canceled) {
            console.log(response.filePaths[0])

            store.set(`projects.${projectKey}.path`, response.filePaths[0])

            let atomLabels = [];
            try {
                const apiRequest = axios.post("http://localhost:8080/files",null, {params: {"filePath": response.filePaths[0]}})
                apiRequest.then(data => {
                    if (data.data) {
                        for (const atom in data.data["atoms"]) {
                            let atomLabel = data.data["atoms"][atom]["label"];
                            atomLabel = atomLabel.toString().split('/')[1];
                            console.log(atomLabel)
                            atomLabels.push(atomLabel);
                        };
                    }
                }).then( () => {
                    store.set(`projects.${projectKey}.atoms`, atomLabels);
                });
            } catch (err) {
                console.log(err);
            }

            event.sender.send('project-file-set', response.filePaths[0])

        } else {
            event.sender.send('project-file-set', null)
        }
    })
})

ipcMain.on(GET_ATOMS, (event, projectKey) => {
    console.log("MAIN RECEIVED GET_ATOMS FROM RENDERER")
    console.log(projectKey);
    let atoms = store.get(`projects.${projectKey}.atoms`);
    console.log(atoms);
    event.sender.send('got-atoms', atoms ? atoms : null)
})

ipcMain.on(GET_PROJECTS, (event) => {
    console.log("RECEIVED 'GET-PROJECTS' FROM RENDERER");
    let projects = store.get('projects');
    event.sender.send('get-projects-success', projects ? projects : null)
})

ipcMain.on(OPEN_PROJECT, (event, projectKey) => {
    projectSelectWindow.close();
    createMainWindow(projectKey);
})

ipcMain.on(GET_TESTS, (event, projectKey) => {
    let tests = store.get(`projects.${projectKey}.tests`);
    event.sender.send('got-tests', tests ? tests : null)
})