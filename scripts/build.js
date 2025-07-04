const { build } = require("electron-builder");
const fs = require("fs-extra");
const path = require("path");

async function buildApp() {
    console.log("Building React app...");

    // Build React app
    const { spawn } = require("child_process");

    await new Promise((resolve, reject) => {
        const buildProcess = spawn("npm", ["run", "build"], {
            cwd: path.join(__dirname, "../client"),
            stdio: "inherit",
        });

        buildProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Build failed with code ${code}`));
            }
        });
    });

    console.log("Copying server files...");
    await fs.copy(
        path.join(__dirname, "../server"),
        path.join(__dirname, "../resources/server")
    );

    console.log("Building Electron app...");
    await build({
        config: require("../electron-builder.json"),
    });

    console.log("Build complete!");
}

buildApp().catch(console.error);