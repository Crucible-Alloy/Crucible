
const path = require('path');
const {app, BrowserWindow, ipcMain, dialog, net} = require('electron');
const {v4: uuidv4} = require("uuid");
const axios = require('axios');
const homedir = require('os').homedir();
const fs = require('fs');

// Global window variable
let mainWindow, projectSelectWindow;

// State persistence constants.
const { FETCH_DATA_FROM_STORAGE, HANDLE_FETCH_DATA,
        SAVE_CANVAS_STATE, LOAD_CANVAS_STATE, UPDATE_PROJECT_FILE, GET_PROJECT_FILE, GET_ATOMS, GET_PROJECTS, OPEN_PROJECT,
    GET_TESTS,
    SELECT_FILE,
    CREATE_NEW_PROJECT,
    GET_HOME_DIRECTORY,
    CREATE_NEW_TEST
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

function openProject(projectKey) {
    projectSelectWindow.close();
    createMainWindow(projectKey);
}

function createNewFolder(folder) {
    try {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, {recursive: true})
        }
    } catch (err) {
        console.log("Error creating directory:", err)
    }
}

function storeAtomData(filePath, projectKey) {
    console.log("Getting atom data from springBoot api")
    // Mantine colors at value '4'
    let colors = ["#FFA94D", "#FFD43B", "#A9E34B", "#69DB7C", "#38D9A9", "#3BC9DB", "#4DABF7", "#748FFC", "#9775FA", "#DA77F2", "#F783AC", "#FF8787"]
    let atomData = [];
    try {
        const apiRequest = axios.post("http://localhost:8080/files",null, {params: {"filePath": filePath}})
        apiRequest.then(data => {
            if (data.data) {
                for (const atom in data.data["atoms"]) {
                    let selectedColor = colors.splice(Math.floor(Math.random() * colors.length), 1);
                    console.log(selectedColor)
                    data.data["atoms"][atom]["color"] = selectedColor
                    atomData.push(data.data["atoms"][atom]);
                }
            }
        }).then( () => {
            store.set(`projects.${projectKey}.atoms`, atomData);
        });
    } catch (err) {
        console.log(err)
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

ipcMain.on(SAVE_CANVAS_STATE, (event, canvasItems, projectKey, testKey) => {

    console.log("Main Received: SAVE_CANVAS_STATE with: ", canvasItems, projectKey, testKey);
    store.set(`${projectKey}.tests.${testKey}.canvas`, canvasItems);

})

ipcMain.on(LOAD_CANVAS_STATE, (event, projectKey, testKey) => {
    console.log("Main Received: LOAD_CANVAS_STATE with: ", projectKey, testKey)

    // Send canvas state back to ipcRenderer via api.
    let canvasState = store.get(`${projectKey}.tests.${testKey}.canvas`)
    event.sender.send('loaded-canvas-state', canvasState ? canvasState : {})
})

ipcMain.on(GET_PROJECT_FILE, (event, projectKey) => {
    console.log("MAIN: GET_PROJECT_FILE");

    let projectFile = store.get(`projects.${projectKey}.path`);
    event.sender.send('got-project-file', projectFile ? projectFile : null)
});

ipcMain.on(UPDATE_PROJECT_FILE, (event, projectKey) => {
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
            storeAtomData(response.filePaths[0], projectKey);

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
    //console.log(atoms);
    event.sender.send('got-atoms', atoms ? atoms : {})
})

ipcMain.on(GET_PROJECTS, (event) => {
    console.log("RECEIVED 'GET-PROJECTS' FROM RENDERER");
    let projects = store.get('projects');
    event.sender.send('get-projects-success', projects ? projects : {})
})

ipcMain.on(OPEN_PROJECT, (event, projectKey) => {
    openProject(projectKey);
})

ipcMain.on(GET_TESTS, (event, projectKey) => {
    console.log("RECEIVED 'GET-TESTS' FROM RENDERER")
    let tests = store.get(`projects.${projectKey}.tests`);
    console.log(tests)
    event.sender.send('got-tests', tests ? tests : {})
})

ipcMain.on(SELECT_FILE, (event) => {
    console.log("Main Received: SELECT_FILE")

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
            event.sender.send('file-selected', response.filePaths[0])

        } else {
            event.sender.send('file-selected', null)
        }
    });
})

ipcMain.on(CREATE_NEW_PROJECT, (event, alloyFile, projectName, projectDirectory) => {
    console.log("Main Received: CREATE_NEW_PROJECT");

    // Create project directories
    const projectFolder = projectDirectory + projectName;
    const testsFolder = path.join(projectFolder, "tests");
    const projectFilesFolder = path.join(projectFolder, "projectFiles");

    createNewFolder(projectFolder);
    createNewFolder(testsFolder);
    createNewFolder(projectFilesFolder);

    // Move alloy file into /projectFiles
    let alloyFileNoPath = alloyFile.split('/').pop();
    let newAlloyFilePath = projectFilesFolder + '/' + alloyFileNoPath;

    fs.rename(alloyFile, newAlloyFilePath, (err) =>{
        if (err) {
            console.log(err);
        }
    });

    // Save filepath and project name to store
    let projectKey = uuidv4();
    store.set(`projects.${projectKey}.path`, projectFolder)
    store.set(`projects.${projectKey}.name`, projectName)
    store.set(`projects.${projectKey}.tests`, {})

    // Get atom data from springBoot API and write to store
    storeAtomData(newAlloyFilePath, projectKey)


    // Open new project
    openProject(projectKey);
})

ipcMain.on(GET_HOME_DIRECTORY, (event) => {
    const homedir = require('os').homedir();
    console.log(homedir)
    event.sender.send('got-home-directory', homedir)
});

ipcMain.on(CREATE_NEW_TEST, (event, projectKey, testName) => {
    // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
    let parentProject = store.get(`projects.${projectKey}`);
    let testFilePath = path.join(parentProject["path"], `tests/${testName}.txt`)

    fs.writeFile(testFilePath, "Placeholder file...", function(err) {
        if (err) throw err;
    });

    let newTest = {"name": testName,
                   "testFile": testFilePath,
                   "canvas": {}}

    let testID = uuidv4()
    store.set(`projects.${projectKey}.tests.${testID}`, newTest);

    event.sender.send('created-new-test', newTest)
})