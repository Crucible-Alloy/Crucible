"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugins = void 0;
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');
exports.plugins = [
    new ForkTsCheckerWebpackPlugin(),
    // new CopyPlugin({patterns: [
    //     {from: './src/JARs/*', to: path.join(__dirname, 'dist'),}
    //   ]}),
    // new webpack.EnvironmentPlugin(new webpack.EnvironmentPlugin({
    //   DATABASE_URL: 'file:./dev.db',
    // })
    // ),
];
