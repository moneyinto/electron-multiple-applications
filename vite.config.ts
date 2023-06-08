import { defineConfig, Plugin, UserConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import * as path from "path";
import { rmSync } from "node:fs";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import pkg from "./package.json";

export default defineConfig(({ mode, command }) => {
    rmSync("dist-electron", { recursive: true, force: true });
    const name = "electron多应用示例";
    const port: number = parseInt(process.env.APP_PORT || "8000");

    const isServe = command === "serve";
    const isBuild = command === "build";

    const plugins: (Plugin | Plugin[])[] = [
        vue(),
        splitVendorChunkPlugin(),
        eslintPlugin({
            include: ["src"]
        }),
        electron([
            {
                entry: "electron/background.ts",
                onstart(options) {
                    if (process.env.VSCODE_DEBUG) {
                        console.log(
                            /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
                        );
                    } else {
                        options.startup();
                    }
                },
                vite: {
                    build: {
                        sourcemap: false,
                        minify: isBuild,
                        outDir: "dist-electron",
                        rollupOptions: {
                            external: Object.keys(
                                "dependencies" in pkg ? pkg.dependencies : {}
                            )
                        }
                    }
                }
            },
            {
                entry: "electron/preload.ts",
                onstart(options) {
                    options.reload();
                },
                vite: {
                    build: {
                        sourcemap: false,
                        minify: isBuild,
                        outDir: "dist-electron",
                        rollupOptions: {
                            external: Object.keys(
                                "dependencies" in pkg ? pkg.dependencies : {}
                            )
                        }
                    }
                }
            }
        ]),
        renderer()
    ];

    const version = require("./package.json").version;

    const defaultOptions: UserConfig = {
        define: {
            __APP_MPPTX__: {
                name,
                version
            }
        },
        base: "./",
        plugins,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        server: {
            host: true,
            port
        },
        build: {
            outDir: "dist",
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules/")) {
                            return id
                                .toString()
                                .split("node_modules/")[1]
                                .split("/")[0]
                                .toString();
                        }
                    },
                    chunkFileNames: "assets/js/[name]-[hash].js",
                    entryFileNames: "assets/js/[name]-[hash].js",
                    assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
                }
            },
            minify: mode === "production" ? "terser" : false
        }
    };

    return {
        ...defaultOptions
    };
});
