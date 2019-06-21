// .babekrc
module.exports = (api) => {
  // Don't cache at all. Not recommended because it will be very slow.
  api.cache(false);

  return {
    presets: [
      '@babel/preset-flow',
      [
        '@babel/preset-env', {
          // modules: false,
          targets: {
            node: 'current',
          },
        },
      ],
    ],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-transform-flow-comments',
      // Stage 2
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-throw-expressions',

      // Stage 3
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-json-strings',
    ],
  };
};
