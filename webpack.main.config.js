"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainConfig = void 0;
var webpack_rules_1 = require("./webpack.rules");
var webpack_main_plugins_1 = require("./webpack.main.plugins");
exports.mainConfig = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.ts',
    // Put your normal webpack config below here
    module: {
        rules: webpack_rules_1.rules,
    },
    plugins: webpack_main_plugins_1.plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.jar'],
    },
};
