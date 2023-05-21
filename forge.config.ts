import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import * as path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    appBundleId: "com.crucible.app",
    appCopyright: "Copyright © 2023 Crucible",
    icon: path.join(__dirname, 'src/full_logo/', 'icon.icns'),
    extraResource: [
      "./node_modules/.prisma",
      "./prisma",
      "./src/JARs/aSketch-API.jar",
      "./src/full_logo"
    ],
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({
    authors: "Adam Emerson",
    name: "Crucible",
  }), new MakerDMG({name: "Crucible"}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
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

export default config;
