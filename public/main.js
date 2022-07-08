const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

// Global window variable
let mainWindow;

const { FETCH_DATA_FROM_STORAGE, HANDLE_FETCH_DATA,
        SAVE_DATA_TO_STORAGE, HANDLE_SAVE_DATA} = require("./utils/constants")

const Store = require('electron-store');
const store = new Store();



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
            contextIsolation: true,
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
});

ipcMain.on(SAVE_DATA_TO_STORAGE, (event, message) => {
    console.log("Main Received: SAVE_DATA_TO_STORAGE with: ", message);
    mainWindow.send(HANDLE_SAVE_DATA, {
        success: true,
        message: message
    })
})
