import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
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
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
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
