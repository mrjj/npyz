const cloneDeep = require('lodash.clonedeep');
const fs = require('fs');
const get = require('lodash.get');
const path = require('path');
const set = require('lodash.set');
const Webpack = require('webpack');
const WebpackNodeExternals = require('webpack-node-externals');


// $FlowFixMe
const getRevision = (projectDir) => {
  const gitDir = path.join(path.resolve(projectDir || '.'), '.git');
  const headFile = path.join(gitDir, 'HEAD');
  if (fs.existsSync(headFile)) {
    const rev = fs.readFileSync(headFile).toString().split('\n')[0];
    if (rev && (rev.indexOf(':') === -1)) {
      return rev;
    }
    const revFile = path.join(gitDir, rev.substring(5));
    if (fs.existsSync(revFile)) {
      return fs.readFileSync(revFile).toString() || null;
    }
  }
  return null;
};

const makeMin = (config) => {
  const resConfig = cloneDeep(config);
  set(resConfig, 'optimization.minimize', true);
  const fnParts = get(resConfig, 'output.filename', 'index.js').split('.');
  set(
    resConfig,
    'output.filename',
    [...(fnParts.slice(0, -1)), 'min', fnParts[fnParts.length - 1]].join('.'),
  );
  return resConfig;
};

const ubiqConf = {
  plugins: [
    // For flexible nodejs/browser switch
    new Webpack.DefinePlugin({
      'process.env.NPYZ_VERSION': fs.readFileSync('./package.json').version,
      'process.env.NPYZ_GIT_REVISION': getRevision('.'),
    }),
  ],
  target: 'node',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx'],
    modules: [
      __dirname,
      'node_modules',
    ],
  },
  entry: {
    index: ['./src/index.js'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        use: ['remove-flow-types-loader'],
        include: path.join(__dirname, 'src'),
      },
    ],
  },
  devtool: 'source-map',
  mode: 'production',
};

/*
  const nodeConfig = {
    ...ubiqConf,
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'anymetrica-utils.js',
    },
  };
*/

const webConfig = {
  ...ubiqConf,
  target: 'web',
  entry: './src/stream.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'npyz',
    libraryTarget: 'umd',
    globalObject: 'this',
    filename: 'npyz.js',
  },
  optimization: {
    minimize: false,
  },
};

module.exports = [
  webConfig, makeMin(webConfig),
];
