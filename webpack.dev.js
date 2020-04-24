const merge = require('webpack-merge');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  devtool: "eval-source-map",
  mode: 'development'
});
