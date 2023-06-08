import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from "electron";
import { release } from "node:os";
import { join } from "node:path";

if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "./preload.js");
let url = process.env.VITE_DEV_SERVER_URL || "dist/index.html";

async function createWindow() {
    win = new BrowserWindow({
        title: "electron多应用示例",
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 默认最大化
    win.maximize();

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(url);
        win.webContents.openDevTools();
    } else {
        const menu = Menu.buildFromTemplate(
            process.platform === "darwin"
                ? [
                      {
                          label: "electron多应用示例",
                          submenu: [
                              {
                                  label: "退出",
                                  accelerator: "CmdOrCtrl+Q",
                                  click: () => {
                                      app.quit();
                                  }
                              }
                          ]
                      }
                  ]
                : []
        );
        Menu.setApplicationMenu(menu);

        win.loadFile(url);
    }

    win.webContents.on("did-finish-load", () => {});

    ipcMain.on("open-application", (e, applicationPath) => {
        console.log("open-application", applicationPath);
        const applicationWin = new BrowserWindow({
            title: "electron多应用示例",
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        applicationWin.maximize();

        applicationWin.loadFile(join(applicationPath, "dist/index.html"));
    });

    globalShortcut.register("esc", () => {
        win?.webContents.send("esc");
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on("will-finish-launching", () => {});

app.on("window-all-closed", () => {
    win = null;
    app.quit();
});

app.on("second-instance", (e, argv) => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});
