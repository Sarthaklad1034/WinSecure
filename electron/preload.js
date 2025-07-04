const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    versions: process.versions,

    // App controls
    quit: () => ipcRenderer.invoke("app:quit"),
    minimize: () => ipcRenderer.invoke("app:minimize"),
    maximize: () => ipcRenderer.invoke("app:maximize"),

    // File operations
    selectFile: (options) => ipcRenderer.invoke("dialog:openFile", options),
    saveFile: (options) => ipcRenderer.invoke("dialog:saveFile", options),

    // Notifications
    showNotification: (title, body) =>
        ipcRenderer.invoke("notification:show", title, body),
});