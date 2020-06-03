/* eslint-disable import/no-extraneous-dependencies */
const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const common = require("./webpack.common.js");

module.exports = (env, argv) => {
  const commonConfig = common(env, argv);

  const result = merge(commonConfig, {
    mode: "production",
    devtool: common.enableSourceMap ? "source-map" : "none", // option controls how source maps are generated (affects on build speed dramatically): https://v4.webpack.js.org/configuration/devtool/
    output: {
      filename: "[name].js",
      chunkFilename: "[name].js"
    },
    performance: {
      assetFilter: function assetFilter(assetFilename) {
        return !/(\.map$)|(fonts)|(images)/.test(assetFilename); // ignore these files from perfomance-hints
      }
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          // default webpack plugin for js-optimization which should be configured: https://v4.webpack.js.org/configuration/optimization/#optimizationminimizer
          // speedest alternative of UglifyJS (it improves minifying js files)
          test: /\.m?js(\?.*)?$/i,
          chunkFilter: () => true, // set false if we don't need uglifying (for debug purpose)
          warningsFilter: () => true, // removing console.warn from files
          extractComments: false, // disable extracting comments to a different file
          sourceMap: common.enableSourceMap, // generating *.map.js files
          cache: (argv && argv.hot) || false, // enable caching only for hot-replacement-mode
          terserOptions: {
            toplevel: true, // https://github.com/terser/terser#minify-options
            output: {
              comments: false // remove comments from files
            },
            mangle: {
              safari10: true // for preventing Safari 10/11 bugs in loop scoping and await
            }
          }
        }),
        new OptimizeCSSAssetsPlugin({}) // it minifies css and optimize it with cssnano: https://cssnano.co/guides/optimisations
      ]
    }
  });

  return result;
};
