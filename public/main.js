const path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');

// Global window variable
let mainWindow;

// State persistence constants.
const { FETCH_DATA_FROM_STORAGE, HANDLE_FETCH_DATA,
        SAVE_DATA_TO_STORAGE, HANDLE_SAVE_DATA, SAVE_CANVAS_STATE, LOAD_CANVAS_STATE
} = require("../src/utils/constants")

let itemsToTrack;

const Store = require('electron-store');
let store = new Store();

const isDev = true;

// if (require("electron-is-dev")) {
//     app.quit();
// }

function createWindow() {

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
            "http://localhost:3000" :
            `${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools({mode: "detach"});
    }

}
    // Open dev tools on launch in dev mode

    // After initialization, create new browser window.
    // Some APIs only available after this call.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

// Close app on exit for linux/windows.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
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

ipcMain.on(SAVE_DATA_TO_STORAGE, (event, message) => {

    console.log("Main Received: SAVE_DATA_TO_STORAGE with: ", message);
    const list = store.get('list');
    if (list) {
        store.set('list', list.concat(message));
    }
    else {
        store.set('list', [message]);
    }
})

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
