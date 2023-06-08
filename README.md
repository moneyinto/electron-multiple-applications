## electron 实现多应用动态加载

### 一、子应用
#### 1、正常的网页开发打包dist
#### 2、对打包的文件进行asar压缩
安装命令

```shell
npm i -g asar
```
压缩
```shell
asar pack application app.asar
```
***【注】：改asar格式为zip格式，由于asar下载没法写入文件，这里改成zip格式，下载后重新改名为asar格式。***

### 二、主应用
#### 1、应用列表配置
```ts
import { message } from "ant-design-vue";
import { ref } from "vue";

const applicationList = ref([
    {
        name: "画板",
        icon: new URL("@/assets/images/write.png", import.meta.url).href,
        application: "whiteboard",
        url: "http://**/applications/whiteboard/app.zip"
    },
    {
        name: "MPPTX",
        icon: new URL("@/assets/images/mpptx.png", import.meta.url).href,
        application: "mpptx",
        url: "http://**/applications/mpptx/app.zip"
    }
]);

const openApplication = async (application: string, url: string) => {
    const isExist = window.electron.openApplication(application);
    if (!isExist) {
        const isOk = await window.electron.downloadApplication(application, url);
        if (isOk) {
            window.electron.openApplication(application);
        } else {
            message.error("应用加载失败");
        }
    }
};
```

#### 2、openApplication方法
```ts
// preload
window.electron = {
    openApplication: (application: string) => {
        const applicationPath = join(
            __dirname,
            "../" + application,
            "app.asar"
        );
        const isExist = existsSync(applicationPath);
        if (isExist) {
            ipcRenderer.send("open-application", applicationPath);
        }
        return isExist;
    }
};
```

```ts
// background
ipcMain.on("open-application", (e, applicationPath) => {
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
```

#### 3、downloadApplication方法
```ts
window.electron = {
    downloadApplication: (application: string, url: string) => {
        return new Promise((resolve) => {
            const applicationPath = join(__dirname, "../" + application);
            if (!existsSync(applicationPath)) mkdirSync(applicationPath);
            Axios({
                url,
                method: "GET",
                responseType: "arraybuffer"
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
    }
};
```