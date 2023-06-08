
/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

type Electron = {
    downloadApplication: (application: string, url: string) => Promise<boolean>;
    openApplication: (application: string) => boolean;
};

declare interface Window {
    electron: Electron;
}
