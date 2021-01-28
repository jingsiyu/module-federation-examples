const path = require("path");
const {merge} = require("webpack-merge");
const fs = require("fs");
const webpack = require("webpack");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;
const common = require("./common.base");
const { server: serverLoaders } = require("./loaders");
const plugins = require("./plugins");
const config = require("../config");
const deps = require('../../package.json').dependencies
const { serverPath } = config[process.env.NODE_ENV || "development"];
const SuspenseModulesPlugin = require('../SuspenseModulesPlugin.js');
module.exports = merge(common, {
  name: "server",
  target: "async-node",
  entry: {main:["@babel/polyfill", path.resolve(__dirname, "../../server/index.js")],'website2':'/routes-virtual-entry.js'},
  output: {
    path: serverPath,
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  externals: ["enhanced-resolve"],
  module: {
    rules: serverLoaders,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
   new SuspenseModulesPlugin(),
    ...plugins.server,
    new webpack.HotModuleReplacementPlugin(),
    new ModuleFederationPlugin({
      name: "website2",
      library: { type: "commonjs2" },
      filename: "container.js",
      exposes: {
        "./SomeComponent": "./src/components/SomeComponent",
      },
                  shared: [{"react":deps.react, "react-dom":deps["react-dom"]}],
    }),
  ],
  stats: {
    colors: true,
  },
});
