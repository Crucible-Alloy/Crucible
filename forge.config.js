"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maker_squirrel_1 = require("@electron-forge/maker-squirrel");
var maker_zip_1 = require("@electron-forge/maker-zip");
var maker_deb_1 = require("@electron-forge/maker-deb");
var maker_rpm_1 = require("@electron-forge/maker-rpm");
var plugin_webpack_1 = require("@electron-forge/plugin-webpack");
var webpack_main_config_1 = require("./webpack.main.config");
var webpack_renderer_config_1 = require("./webpack.renderer.config");
var config = {
    packagerConfig: {
        appBundleId: "asketch.foo",
        appCopyright: "Copyright © 2022 ASketch",
        extraResource: [
            "./node_modules/.prisma",
            "./prisma",
            "./src/JARs/aSketch-API.jar"
        ],
    },
    rebuildConfig: {},
    makers: [new maker_squirrel_1.MakerSquirrel({}), new maker_zip_1.MakerZIP({}, ['darwin']), new maker_rpm_1.MakerRpm({}), new maker_deb_1.MakerDeb({})],
    plugins: [
        new plugin_webpack_1.WebpackPlugin({
            mainConfig: webpack_main_config_1.mainConfig,
            renderer: {
                config: webpack_renderer_config_1.rendererConfig,
                nodeIntegration: false,
                entryPoints: [
                    {
                        html: './src/project.html',
                        js: './src/project.tsx',
                        name: 'project_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                    {
                        html: './src/index.html',
                        js: './src/index.tsx',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
    ],
};
exports.default = config;
