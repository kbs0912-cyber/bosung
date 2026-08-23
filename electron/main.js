// Electron main process for the "AI 딸깍 블로그" Windows desktop app.
//
// In development, `npm run electron:dev` starts `next dev` on
// http://localhost:3000 first (see package.json), and this file just opens
// a window pointing at it.
//
// In a packaged build, the Next.js app is bundled as a standalone server
// (next.config.ts sets output:"standalone" when ELECTRON_BUILD=1). This file
// spawns that server as a child process on a local port and loads it in the
// window. API keys entered via the in-app 설정 screen are written to a JSON
// file under the OS user-data folder (see lib/config.ts), so they survive
// app updates/reinstalls without touching any .env file.

const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const PORT = process.env.AI_DDALKKAK_PORT || "4173";
const DEV_URL = "http://localhost:3000";
const PROD_URL = `http://127.0.0.1:${PORT}`;

let serverProcess = null;
let mainWindow = null;

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("서버 시작 시간이 초과되었습니다."));
          return;
        }
        setTimeout(poll, 300);
      });
    })();
  });
}

function startStandaloneServer() {
  const standaloneDir = path.join(process.resourcesPath, "standalone");
  const serverEntry = path.join(standaloneDir, "server.js");

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      PORT,
      HOSTNAME: "127.0.0.1",
      APP_CONFIG_DIR: app.getPath("userData"),
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    if (code !== 0 && mainWindow) {
      mainWindow.webContents.executeJavaScript(
        `document.body.innerText = "앱 서버가 예기치 않게 종료되었습니다 (code ${code}). 앱을 다시 시작해주세요."`,
      );
    }
  });

  return waitForServer(PROD_URL);
}

async function createWindow() {
  const targetUrl = app.isPackaged ? PROD_URL : DEV_URL;

  if (app.isPackaged) {
    await startStandaloneServer();
  }

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    minWidth: 420,
    minHeight: 600,
    autoHideMenuBar: true,
    title: "AI 딸깍 블로그",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(targetUrl);
}

app.whenReady().then(() => {
  createWindow().catch((err) => {
    console.error(err);
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function killServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
}

app.on("window-all-closed", () => {
  killServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", killServer);
