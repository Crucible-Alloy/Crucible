const { ipcRenderer } = require("electron");
const { FETCH_DATA_FROM_STORAGE, SAVE_DATA_TO_STORAGE } = require("./utils/constants");


export function loadSavedData() {
    ipcRenderer.send(FETCH_DATA_FROM_STORAGE, "items")
}

export function saveDataInStorage(item) {
    console.log("Renderer sending SAVE_DATA_TO_STORAGE")
    ipcRenderer.send(SAVE_DATA_TO_STORAGE, item)
}