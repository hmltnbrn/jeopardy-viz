const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const config = require('./webpack.config.js')
const options = {
  contentBase: './src',
  hot: true,
  host: 'localhost',
  inline: true,
  watchContentBase: true,
  historyApiFallback: {
    rewrites: [
      { from: /^\/about/, to: '/about.html' },
      { from: /^\/methods/, to: '/methods.html' }
    ],
  }
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(3000, 'localhost', () => {
  console.log('dev server listening on port 3000')
});
