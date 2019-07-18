const webpack = require('webpack');
const path = require('path');
const highlight = require('rehype-highlight');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const prettyConfig = require('../prettier/vanillajs.config.js');
const PrettierPlugin = require("../prettier/plugin.js");

const nodeModulesPath = path.resolve(__dirname, '../../../../node_modules');

module.exports = {
  mode: "development",
  output: {
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  nodeModulesPath+'/@babel/preset-env',
                ],
                plugins:[
                  require(nodeModulesPath+'/babel-plugin-syntax-dynamic-import')
                ]
              }
            },
            {
                loader: 'eslint-loader',
                options: {
                  configFile: path.resolve(__dirname,'../eslint/vanillajs.lint.json')
                }
            }
          ]
        },
        { test: /\.md$/, use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  nodeModulesPath+'/babel-preset-env',
                ]
              }
            },
            {
              loader: '@hugmanrique/react-markdown-loader',
              options: {
                rehypePlugins: [
                  highlight
                ]
              }
            }
          ]
        },
        {
          test: /\.(css|scss)$/, use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
              loader: "css-loader" // translates CSS into CommonJS
          }, {
              loader: "postcss-loader", //for the window error
              options: {
                plugins: () => [require(nodeModulesPath+'/autoprefixer')]
              }
          }, {
              loader: "sass-loader" // compiles Sass to CSS
          }]
        }, //css only files
        {
          test: /\.(png|svg|jpg|jpeg|gif|html)$/, use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        }, //for images
        { test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/, use: ['file-loader'] } //for fonts
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    modules: [nodeModulesPath]
  },
  resolveLoader: {
    modules: [nodeModulesPath]
  },
  devtool: "source-map",
  devServer: {
    contentBase:  './dist',
    quiet: false,
    disableHostCheck: true,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'styles.css',
      chunkFilename: 'styles.css',
    }),
    new PrettierPlugin(prettyConfig)
  ]
};