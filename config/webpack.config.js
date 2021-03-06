'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) => merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
    progressAndLog: PATHS.src + '/progressAndLog.js',
    options: PATHS.src + '/options.js',
  },
  devtool: 'cheap-module-source-map'
});

module.exports = config;
