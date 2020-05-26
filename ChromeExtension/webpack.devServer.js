/* eslint-disable import/no-extraneous-dependencies */
const merge = require("webpack-merge");
const CleanPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackMockServer = require("webpack-mock-server");
const dev = require("./webpack.dev");
const assets = require("./webpack.common").assetsPath;

module.exports = (env, argv) => {
  const devConfig = dev(env, argv);

  function remove(searchFunction) {
    devConfig.plugins.splice(devConfig.plugins.findIndex(searchFunction), 1);
  }
  // remove plugins because these aren't required for devServer
  remove(a => a instanceof CleanPlugin.CleanWebpackPlugin);
  remove(a => a instanceof CopyWebpackPlugin);
  remove(a => a instanceof MiniCssExtractPlugin);

  const result = merge(devConfig, {
    devServer: {
      openPage: "?ltype=affiliate&trafficChannel=af&d=y&CatId=0&SearchText=hc-12&ltype=affiliate&SortType=default",
      historyApiFallback: {
        // provide index.html instead of 404:not found error (for SPA app)
        rewrites: [
          { from: /favicon.ico/, to: "public/favicon.ico" } // provide favicon
        ]
      }, // it enables HTML5 mode: https://developer.mozilla.org/en-US/docs/Web/API/History
      stats: {
        children: false // disable console.info for node_modules/*
      },
      before: app =>
        webpackMockServer.use(app, {
          entry: ["mock/webpack.mock.js"],
          tsConfigFileName: "tsconfig.json",
          before: (req, res, next) => {
            console.log(`Got request: ${req.method} ${req.url}`);
            next();
          }
        }),
      contentBase: assets, // folder with static content
      watchContentBase: true // enable hot-reload by changes in contentBase folder
    }
  });

  return result;
};
