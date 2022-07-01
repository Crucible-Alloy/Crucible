const path = require('path');

const {app, BrowserWindow} = require('electron');
const isDev = true;

// if (require("electron-is-dev")) {
//     app.quit();
// }

function createWindow() {

    const win = new BrowserWindow({
        // Set browser window parameters
        width: 1600,
        height: 900,
        webPreferences: {
            //preload: path.join(__dirname, 'preload.js'),
        },
    });

    //Load index.html
    win.loadURL(
        isDev ?
            "http://localhost:3000" :
            `${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
        win.webContents.openDevTools({mode: "detach"});
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
    })
})

// Close app on exit for linux/windows.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});