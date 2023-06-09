import { ipcRenderer } from "electron";
import { existsSync, mkdirSync, writeFileSync, renameSync } from "fs";
import Axios from "axios";
import { join } from "path";
import ElectronLog from "electron-log";

window.electron = {
    downloadApplication: (application: string, url: string, onDownloadProgress: (progress: number) => void) => {
        return new Promise((resolve) => {
            const applicationPath = join(__dirname, "../../" + application);
            if (!existsSync(applicationPath)) mkdirSync(applicationPath);
            Axios({
                url,
                method: "GET",
                responseType: "arraybuffer",
                onDownloadProgress: (progressEvent) => {
                    onDownloadProgress(progressEvent.progress || 0);
                }
            })
                .then((response) => {
                    const zipFilePath = join(applicationPath, "app.zip");
                    const buffer = Buffer.from(response.data);
                    writeFileSync(zipFilePath, buffer);
                    renameSync(zipFilePath, join(applicationPath, "app.asar"));
                    resolve(true);
                })
                .catch((err) => {
                    ElectronLog.error(err);
                    resolve(false);
                });
        });
    },

    openApplication: (application: string) => {
        const applicationPath = join(
            __dirname,
            "../../" + application,
            "app.asar"
        );
        const isExist = existsSync(applicationPath);
        if (isExist) {
            ipcRenderer.send("open-application", applicationPath);
        }
        return isExist;
    }
};
