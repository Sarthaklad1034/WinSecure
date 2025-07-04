// const fs = require("fs-extra");
// const path = require("path");

// async function setupPython() {
//     const projectRoot = path.resolve(__dirname, "..");
//     const resourcesDir = path.join(projectRoot, "resources");
//     const pythonDir = path.join(resourcesDir, "python");
//     const serverSrcDir = path.join(projectRoot, "server");
//     const serverDestDir = path.join(resourcesDir, "server");
//     const reactBuildDir = path.join(projectRoot, "client", "build");
//     const reactTargetDir = path.join(resourcesDir, "react");

//     console.log("📁 Setting up Python, Flask server, and React frontend...");

//     try {
//         // 1. Ensure directories
//         await fs.ensureDir(resourcesDir);
//         await fs.ensureDir(pythonDir);

//         // 2. Clean existing folders
//         if (await fs.pathExists(serverDestDir)) {
//             console.log("🧹 Removing old Flask server files...");
//             await fs.remove(serverDestDir);
//         }

//         if (await fs.pathExists(reactTargetDir)) {
//             console.log("🧹 Removing old React build...");
//             await fs.remove(reactTargetDir);
//         }

//         // 3. Copy server
//         await fs.copy(serverSrcDir, serverDestDir);
//         console.log("✅ Flask server copied to resources/server");

//         // 4. Copy React build if it exists
//         if (await fs.pathExists(reactBuildDir)) {
//             await fs.copy(reactBuildDir, reactTargetDir);
//             console.log("✅ React build copied to resources/react");
//         } else {
//             console.warn("⚠️  React build directory not found at:", reactBuildDir);
//             console.warn(
//                 "👉 Please run 'npm run build' inside /client before setup."
//             );
//         }

//         // 5. Reminder about Python
//         console.log("⚠️  Python runtime not bundled automatically.");
//         console.log(
//             "👉 Place standalone Python inside 'resources/python' if not using system Python."
//         );
//         console.log("✅ Setup complete.");
//     } catch (err) {
//         console.error("❌ Setup failed:", err);
//         process.exit(1);
//     }
// }

// setupPython();

const fs = require("fs-extra");
const path = require("path");

async function setupPython() {
  const projectRoot = path.resolve(__dirname, "..");
  const resourcesDir = path.join(projectRoot, "resources");
  const pythonDir = path.join(resourcesDir, "python");
  const serverSrcDir = path.join(projectRoot, "server");
  const serverDestDir = path.join(resourcesDir, "server");
  const reactBuildDir = path.join(projectRoot, "client", "build");
  const reactTargetDir = path.join(resourcesDir, "react");

  console.log("📁 Setting up Python, Flask server, and React frontend...");

  try {
    // 1. Ensure directories
    await fs.ensureDir(resourcesDir);
    await fs.ensureDir(pythonDir);
    await fs.ensureDir(reactTargetDir);

    // 2. Clean existing folders
    if (await fs.pathExists(serverDestDir)) {
      console.log("🧹 Removing old Flask server files...");
      await fs.remove(serverDestDir);
    }

    if (await fs.pathExists(reactTargetDir)) {
      console.log("🧹 Removing old React build...");
      await fs.remove(reactTargetDir);
    }

    // 3. Copy server
    if (await fs.pathExists(serverSrcDir)) {
      await fs.copy(serverSrcDir, serverDestDir);
      console.log("✅ Flask server copied to resources/server");
    } else {
      console.error("❌ Server directory not found:", serverSrcDir);
      process.exit(1);
    }

    // 4. Copy React build if it exists
    if (await fs.pathExists(reactBuildDir)) {
      await fs.copy(reactBuildDir, reactTargetDir);
      console.log("✅ React build copied to resources/react");

      // Verify critical files exist
      const indexPath = path.join(reactTargetDir, "index.html");
      if (await fs.pathExists(indexPath)) {
        console.log("✅ index.html found in React build");
      } else {
        console.error("❌ index.html not found in React build");
      }
    } else {
      console.error("❌ React build directory not found at:", reactBuildDir);
      console.error(
        "👉 Please run 'npm run build' inside /client before setup."
      );
      process.exit(1);
    }

    // 5. Create splash screen if it doesn't exist
    const splashPath = path.join(reactTargetDir, "splash.html");
    if (!(await fs.pathExists(splashPath))) {
      console.log("🎨 Creating splash screen...");
      const splashContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WinSecure - Windows Security Scanner</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            overflow: hidden;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .background-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
            animation: patternMove 20s linear infinite;
        }
        
        @keyframes patternMove {
            0% { transform: translateX(0px) translateY(0px); }
            50% { transform: translateX(-50px) translateY(-30px); }
            100% { transform: translateX(0px) translateY(0px); }
        }
        
        .splash-container {
            text-align: center;
            animation: fadeInUp 1.2s ease-out;
            position: relative;
            z-index: 10;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem 2.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
        }
        
        .logo-container {
            margin-bottom: 2rem;
        }
        
        .logo-icon {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
            display: inline-block;
            animation: pulse 2s ease-in-out infinite;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .logo-text {
            font-size: 2.5rem;
            font-weight: 300;
            letter-spacing: 3px;
            margin-bottom: 0.5rem;
            background: linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .logo-subtitle {
            font-size: 0.9rem;
            color: #cbd5e1;
            letter-spacing: 1px;
            font-weight: 300;
        }
        
        .loading-section {
            margin: 2.5rem 0;
        }
        
        .loading-text {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            color: #e2e8f0;
            font-weight: 300;
        }
        
        .spinner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top: 3px solid #60a5fa;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .progress-bar {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin: 0 auto;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            border-radius: 2px;
            animation: progressFill 3s ease-in-out infinite;
        }
        
        .status-text {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-top: 1.5rem;
            font-weight: 300;
        }
        
        .version-info {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 300;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
            from { 
                opacity: 0; 
                transform: translateY(30px) scale(0.95);
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes progressFill {
            0% { width: 0%; }
            50% { width: 75%; }
            100% { width: 100%; }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .splash-container {
                padding: 2rem 1.5rem;
                margin: 1rem;
            }
            
            .logo-text {
                font-size: 2rem;
            }
            
            .logo-icon {
                width: 60px;
                height: 60px;
            }
        }
    </style>
</head>
<body>
    <div class="background-pattern"></div>
    
    <div class="splash-container">
        <div class="logo-container">
            <img src="favicon.ico" alt="WinSecure Logo" class="logo-icon">
            <div class="logo-text">WINSECURE</div>
            <div class="logo-subtitle">PROFESSIONAL SECURITY SUITE</div>
        </div>
        
        <div class="loading-section">
            <div class="loading-text">Initializing Windows Security Scanner...</div>
            
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            
            <div class="status-text">Loading security modules and threat definitions</div>
        </div>
    </div>
    
    <div class="version-info">
        WinSecure v2.1.0 | © 2025 Security Solutions
    </div>
</body>
</html>`;
      await fs.writeFile(splashPath, splashContent);
      console.log("✅ Splash screen created");
    }

    // 6. Reminder about Python
    console.log("⚠️  Python runtime not bundled automatically.");
    console.log(
      "👉 Place standalone Python inside 'resources/python' if not using system Python."
    );
    console.log("✅ Setup complete.");

    // 7. Display final verification
    console.log("\n📋 Final verification:");
    console.log(
      "Server path:",
      serverDestDir,
      "exists:",
      await fs.pathExists(serverDestDir)
    );
    console.log(
      "React path:",
      reactTargetDir,
      "exists:",
      await fs.pathExists(reactTargetDir)
    );
    console.log(
      "Index.html:",
      path.join(reactTargetDir, "index.html"),
      "exists:",
      await fs.pathExists(path.join(reactTargetDir, "index.html"))
    );
    console.log(
      "Splash.html:",
      splashPath,
      "exists:",
      await fs.pathExists(splashPath)
    );
  } catch (err) {
    console.error("❌ Setup failed:", err);
    process.exit(1);
  }
}

setupPython();
