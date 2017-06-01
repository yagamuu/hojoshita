const path = require('path')
const webpack = require('webpack')

const DEBUG = !process.argv.includes('--env.production');

module.exports = {
  entry: {
    "main"  : "./src/main/index.js",
    "option": "./src/option/index.js",
  },
  output: {
    filename: "[name].js",
    path    : __dirname + '/dist/js'
  },
  module: {
    loaders: [
      {
        test   : /\.js$/,
        exclude: /node_modules/,
        loader : "babel-loader"
      }
    ]
  },
  devtool: DEBUG ? 'inline-source-map' : false
}