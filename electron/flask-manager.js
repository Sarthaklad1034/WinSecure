// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const net = require("net");

// class FlaskManager {
//     constructor() {
//         this.flaskProcess = null;
//         this.isRunning = false;
//         this.port = 5000;
//         this.isDev = process.env.NODE_ENV === "development";
//     }

//     getResourcesPath() {
//         return this.isDev ?
//             path.join(__dirname, "../resources") :
//             process.resourcesPath; // ✅ FIXED: Removed redundant "resources"
//     }

//     getPythonPath() {
//         if (this.isDev) {
//             // Try resolving python from PATH, fallback to local embedded if missing
//             const localPython = path.join(
//                 this.getResourcesPath(),
//                 "python",
//                 "python.exe"
//             );
//             if (fs.existsSync("python") || fs.existsSync("python.exe")) {
//                 return "python";
//             } else if (fs.existsSync(localPython)) {
//                 return localPython;
//             } else {
//                 console.warn(
//                     "⚠️ Python not found in PATH or resources. Defaulting to 'python'"
//                 );
//                 return "python"; // fallback anyway, may still work
//             }
//         }
//         return path.join(this.getResourcesPath(), "python", "python.exe");
//     }

//     getServerPath() {
//         return this.isDev ?
//             path.join(__dirname, "../server") :
//             path.join(this.getResourcesPath(), "server");
//     }

//     isPortOpen(port) {
//         return new Promise((resolve) => {
//             const socket = new net.Socket();
//             socket.setTimeout(1000);
//             socket.on("connect", () => {
//                 socket.destroy();
//                 resolve(true);
//             });
//             socket.on("timeout", () => {
//                 socket.destroy();
//                 resolve(false);
//             });
//             socket.on("error", () => {
//                 resolve(false);
//             });
//             socket.connect(port, "127.0.0.1");
//         });
//     }

//     waitForFlaskReady(retries = 10, delay = 1000) {
//         return new Promise((resolve, reject) => {
//             const check = async() => {
//                 const isReady = await this.isPortOpen(this.port);
//                 if (isReady) return resolve();
//                 if (retries <= 0)
//                     return reject(new Error("Flask server failed to respond"));
//                 setTimeout(() => check(--retries), delay);
//             };
//             check(retries);
//         });
//     }

//     async start() {
//         return new Promise(async(resolve, reject) => {
//             if (this.isRunning) return resolve();

//             const pythonPath = this.getPythonPath();
//             const serverPath = this.getServerPath();
//             const appPath = path.join(serverPath, "app.py");

//             console.log("📁 Starting Flask server...");
//             console.log("🐍 Python path:", pythonPath);
//             console.log("📂 Server path:", serverPath);
//             console.log("📄 App path:", appPath);

//             // Check python.exe
//             if (!fs.existsSync(pythonPath)) {
//                 console.error("❌ Python executable not found:", pythonPath);
//                 return reject(new Error(`Python not found at ${pythonPath}`));
//             }

//             // Check app.py
//             if (!fs.existsSync(appPath)) {
//                 console.error("❌ Flask app.py not found:", appPath);
//                 return reject(new Error(`Flask app not found at ${appPath}`));
//             }

//             this.flaskProcess = spawn(pythonPath, [appPath], {
//                 cwd: serverPath,
//                 env: {
//                     ...process.env,
//                     FLASK_ENV: this.isDev ? "development" : "production",
//                     PYTHONPATH: serverPath,
//                 },
//             });

//             this.flaskProcess.stdout.on("data", (data) => {
//                 console.log(`🟢 Flask: ${data}`);
//             });

//             this.flaskProcess.stderr.on("data", (data) => {
//                 console.error(`🔴 Flask Error: ${data}`);
//             });

//             this.flaskProcess.on("error", (error) => {
//                 console.error("❌ Error starting Flask:", error);
//                 this.isRunning = false;
//                 reject(error);
//             });

//             this.flaskProcess.on("close", (code) => {
//                 console.log(`⚠️ Flask exited with code: ${code}`);
//                 this.isRunning = false;
//             });

//             // Wait for Flask to start properly (port check)
//             try {
//                 await this.waitForFlaskReady();
//                 this.isRunning = true;
//                 console.log("✅ Flask server is ready.");
//                 resolve();
//             } catch (err) {
//                 console.error("❌ Flask failed to start in time");
//                 reject(err);
//             }
//         });
//     }

//     async stop() {
//         if (this.flaskProcess && this.isRunning) {
//             console.log("🛑 Stopping Flask server...");
//             this.flaskProcess.kill();
//             this.isRunning = false;
//         }
//     }
// }

// module.exports = FlaskManager;

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const net = require("net");

class FlaskManager {
    constructor() {
        this.flaskProcess = null;
        this.isRunning = false;
        this.port = 5000;
        this.isDev = process.env.NODE_ENV === "development";
    }

    getResourcesPath() {
        if (this.isDev) {
            return path.join(__dirname, "../resources");
        }
        // In production, resources are in process.resourcesPath
        return process.resourcesPath;
    }

    getPythonPath() {
        const resourcesPath = this.getResourcesPath();

        if (this.isDev) {
            // In development, try system Python first
            const localPython = path.join(resourcesPath, "python", "python.exe");
            if (fs.existsSync(localPython)) {
                return localPython;
            }
            // Fallback to system Python
            return "python";
        }

        // In production, use bundled Python
        const bundledPython = path.join(resourcesPath, "python", "python.exe");
        if (fs.existsSync(bundledPython)) {
            return bundledPython;
        }

        // Fallback to system Python
        console.warn("⚠️ Bundled Python not found, trying system Python");
        return "python";
    }

    getServerPath() {
        const resourcesPath = this.getResourcesPath();
        return path.join(resourcesPath, "server");
    }

    getReactPath() {
        const resourcesPath = this.getResourcesPath();
        return path.join(resourcesPath, "react");
    }

    isPortOpen(port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(1000);
            socket.on("connect", () => {
                socket.destroy();
                resolve(true);
            });
            socket.on("timeout", () => {
                socket.destroy();
                resolve(false);
            });
            socket.on("error", () => {
                resolve(false);
            });
            socket.connect(port, "127.0.0.1");
        });
    }

    waitForFlaskReady(retries = 15, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = retries;

            const check = async() => {
                attempts++;
                console.log(`🔄 Checking Flask server... (${attempts}/${maxAttempts})`);

                const isReady = await this.isPortOpen(this.port);
                if (isReady) {
                    console.log("✅ Flask server is responding");
                    return resolve();
                }

                if (attempts >= maxAttempts) {
                    console.error(
                        "❌ Flask server failed to respond after maximum attempts"
                    );
                    return reject(new Error("Flask server failed to respond"));
                }

                setTimeout(check, delay);
            };

            check();
        });
    }

    async start() {
        return new Promise(async(resolve, reject) => {
            if (this.isRunning) {
                console.log("✅ Flask server is already running");
                return resolve();
            }

            const pythonPath = this.getPythonPath();
            const serverPath = this.getServerPath();
            const reactPath = this.getReactPath();
            const appPath = path.join(serverPath, "app.py");

            console.log("📁 Starting Flask server...");
            console.log("🐍 Python path:", pythonPath);
            console.log("📂 Server path:", serverPath);
            console.log("📂 React path:", reactPath);
            console.log("📄 App path:", appPath);

            // Verify all required paths exist
            const checks = [
                { path: serverPath, name: "Server directory" },
                { path: reactPath, name: "React build directory" },
                { path: appPath, name: "Flask app.py" },
                { path: path.join(reactPath, "index.html"), name: "React index.html" },
            ];

            for (const check of checks) {
                if (!fs.existsSync(check.path)) {
                    const error = `❌ ${check.name} not found: ${check.path}`;
                    console.error(error);
                    return reject(new Error(error));
                }
                console.log(`✅ ${check.name} found`);
            }

            // Check if Python executable exists (for bundled Python)
            if (!this.isDev && !fs.existsSync(pythonPath)) {
                console.warn("⚠️ Bundled Python not found, trying system Python");
            }

            // Set up environment variables
            const env = {
                ...process.env,
                FLASK_ENV: this.isDev ? "development" : "production",
                PYTHONPATH: serverPath,
                REACT_BUILD_PATH: reactPath, // Pass React path to Flask
            };

            console.log("🚀 Launching Flask process...");
            this.flaskProcess = spawn(pythonPath, [appPath], {
                cwd: serverPath,
                env: env,
                stdio: ["ignore", "pipe", "pipe"], // Capture stdout and stderr
            });

            this.flaskProcess.stdout.on("data", (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`🟢 Flask: ${output}`);
                }
            });

            this.flaskProcess.stderr.on("data", (data) => {
                const error = data.toString().trim();
                if (error) {
                    console.error(`🔴 Flask Error: ${error}`);
                }
            });

            this.flaskProcess.on("error", (error) => {
                console.error("❌ Error starting Flask:", error);
                this.isRunning = false;
                reject(error);
            });

            this.flaskProcess.on("close", (code) => {
                console.log(`⚠️ Flask process exited with code: ${code}`);
                this.isRunning = false;
                if (code !== 0) {
                    reject(new Error(`Flask process exited with code ${code}`));
                }
            });

            // Wait for Flask to start properly
            try {
                await this.waitForFlaskReady();
                this.isRunning = true;
                console.log("✅ Flask server is ready and responding");
                resolve();
            } catch (err) {
                console.error("❌ Flask failed to start:", err.message);
                if (this.flaskProcess) {
                    this.flaskProcess.kill();
                }
                reject(err);
            }
        });
    }

    async stop() {
        if (this.flaskProcess && this.isRunning) {
            console.log("🛑 Stopping Flask server...");
            this.flaskProcess.kill("SIGTERM");

            // Wait a bit for graceful shutdown
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (this.isRunning) {
                console.log("🔴 Force killing Flask process...");
                this.flaskProcess.kill("SIGKILL");
            }

            this.isRunning = false;
            console.log("✅ Flask server stopped");
        }
    }
}

module.exports = FlaskManager;