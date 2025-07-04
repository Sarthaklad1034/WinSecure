// const { app, BrowserWindow, dialog, shell } = require("electron");
// const path = require("path");
// const { spawn } = require("child_process");
// const fs = require("fs");
// const FlaskManager = require("./flask-manager");

// class WinSecureApp {
//     constructor() {
//         this.mainWindow = null;
//         this.flaskManager = new FlaskManager();
//         this.isQuitting = false;
//     }

//     async createWindow() {
//         this.mainWindow = new BrowserWindow({
//             width: 1400,
//             height: 900,
//             minWidth: 1200,
//             minHeight: 800,
//             icon: path.join(__dirname, "../resources/icon.png"),
//             webPreferences: {
//                 nodeIntegration: false,
//                 contextIsolation: true,
//                 enableRemoteModule: false,
//                 preload: path.join(__dirname, "preload.js"),
//             },
//             show: false,
//             titleBarStyle: "default",
//             autoHideMenuBar: true,
//         });

//         // 💥 CSP Fix: Prevent Electron CSP warning
//         this.mainWindow.webContents.session.webRequest.onHeadersReceived(
//             (details, callback) => {
//                 callback({
//                     responseHeaders: {
//                         ...details.responseHeaders,
//                         "Content-Security-Policy": [
//                             "default-src 'self' http://localhost:5000; script-src 'self' 'unsafe-inline' http://localhost:5000; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
//                         ],
//                     },
//                 });
//             }
//         );

//         // Load splash screen first
//         // Load splash screen first
//         this.mainWindow.loadFile(
//             path.join(__dirname, "../resources/react/splash.html")
//         );

//         // Start Flask server
//         try {
//             await this.flaskManager.start();
//             console.log("Flask server started successfully");

//             // Load main application
//             this.mainWindow.loadURL("http://localhost:5000");
//         } catch (error) {
//             console.error("Failed to start Flask server:", error);
//             dialog.showErrorBox(
//                 "Server Error",
//                 "Failed to start the application server. Please try again."
//             );
//             app.quit();
//         }

//         this.mainWindow.once("ready-to-show", () => {
//             this.mainWindow.show();
//         });

//         this.mainWindow.on("closed", () => {
//             this.mainWindow = null;
//         });

//         // Handle external links
//         this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
//             shell.openExternal(url);
//             return { action: "deny" };
//         });

//         // Development tools
//         if (process.env.NODE_ENV === "development") {
//             this.mainWindow.webContents.openDevTools();
//         }
//     }

//     async initialize() {
//         await app.whenReady();
//         await this.createWindow();

//         app.on("activate", async() => {
//             if (BrowserWindow.getAllWindows().length === 0) {
//                 await this.createWindow();
//             }
//         });

//         app.on("before-quit", () => {
//             this.isQuitting = true;
//         });

//         app.on("window-all-closed", () => {
//             if (process.platform !== "darwin") {
//                 this.shutdown();
//             }
//         });
//     }

//     async shutdown() {
//         console.log("Shutting down application...");
//         await this.flaskManager.stop();
//         app.quit();
//     }
// }

// // Initialize the application
// const winSecureApp = new WinSecureApp();
// winSecureApp.initialize().catch(console.error);

const { app, BrowserWindow, dialog, shell } = require("electron");

// ✅ FIX: Disable GPU to prevent GPU crash errors
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const FlaskManager = require("./flask-manager");

class WinSecureApp {
  constructor() {
    this.mainWindow = null;
    this.flaskManager = new FlaskManager();
    this.isQuitting = false;
  }

  async createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      icon: path.join(__dirname, "../resources/react/favicon.ico"),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
      show: false,
      titleBarStyle: "default",
      autoHideMenuBar: true,
    });

    // ✅ CSP Fix: Prevent Electron CSP warning
    this.mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self' http://localhost:5000; script-src 'self' 'unsafe-inline' http://localhost:5000; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
            ],
          },
        });
      }
    );

    // 🔷 Load splash screen first
    this.mainWindow.loadFile(
      path.join(__dirname, "../resources/react/splash.html")
    );

    // 🔷 Start Flask server
    try {
      await this.flaskManager.start();
      console.log("Flask server started successfully");

      // Load main application
      this.mainWindow.loadURL("http://localhost:5000");
    } catch (error) {
      console.error("❌ Failed to start Flask server:", error);
      dialog.showErrorBox(
        "Server Error",
        "Failed to start the application server. Please try again."
      );
      app.quit();
    }

    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    // 🔗 External links open in default browser
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    // 🛠 Dev tools (if needed)
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.webContents.openDevTools();
    }
  }

  async initialize() {
    await app.whenReady();

    // ✅ Debug info (optional but useful)
    console.log("Electron version:", process.versions.electron);
    console.log("Chrome version:", process.versions.chrome);
    console.log("Node version:", process.versions.node);
    console.log("Platform:", process.platform);

    await this.createWindow();

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createWindow();
      }
    });

    app.on("before-quit", () => {
      this.isQuitting = true;
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        this.shutdown();
      }
    });
  }

  async shutdown() {
    console.log("Shutting down application...");
    await this.flaskManager.stop();
    app.quit();
  }
}

// ✅ Start the app
const winSecureApp = new WinSecureApp();
winSecureApp.initialize().catch(console.error);
