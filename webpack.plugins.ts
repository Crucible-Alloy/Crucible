import * as path from "path";

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
import * as webpack from "webpack";

export const plugins = [
  new ForkTsCheckerWebpackPlugin(),
  // new CopyPlugin({patterns: [
  //     {from: './src/JARs/*', to: path.join(__dirname, 'dist'),}
  //   ]}),
  // new webpack.EnvironmentPlugin(new webpack.EnvironmentPlugin({
  //   DATABASE_URL: 'file:./dev.db',
  // })
  // ),

];