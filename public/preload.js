const { ipcRenderer, contextBridge } = require('electron');
const {SAVE_CANVAS_STATE, LOAD_CANVAS_STATE} = require("../src/utils/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    saveCanvasState: (canvasItems, tabKey) => ipcRenderer.send(SAVE_CANVAS_STATE, canvasItems, tabKey),
    loadCanvasState: (tabKey) => {
        console.log("API received LOAD_CANVAS_STATE from tab ", tabKey)
        ipcRenderer.send(LOAD_CANVAS_STATE, tabKey)

        return new Promise((resolve) => {
            ipcRenderer.once('loaded-canvas-state', (event, canvasState) => resolve(canvasState))
        })
    },
})