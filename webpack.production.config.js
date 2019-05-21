const path = require('path');
const [server, client] = require('./webpack.config');

const common = {
  mode: 'production',
  devtool: 'source-map',
  optimization: { minimize: true },
};

const newServer = {
  ...common,
  ...client,

  path: path.resolve(__dirname, 'dist'),
  filename: 'npyz.node.js',
  library: 'npyz',
  libraryTarget: 'var',
  globalObject: 'this',
};

module.exports = [server, client];

const newClient = {
  ...common,
  ...client,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'npyz.js',
    library: 'npyz',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
};

module.exports = [
  newServer,
  // newClient,
];
