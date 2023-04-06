import * as path from "path";

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
import * as webpack from "webpack";

export const plugins = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({patterns: [
      {from: './src/JARs/*'},
      {from: './prisma/schema.prisma'}, // Comment out for local development, leave in for packaging.
    ]}),
];
