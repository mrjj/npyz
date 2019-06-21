"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOptions = exports.DEFAULT_OPTIONS = exports.defaultLogFn = void 0;

const {
  ndArray
} = require('./utils');

const pickle = require('./pickle');

const defaultLogFn = (x
/*: string*/
) =>
/*: void*/
{
  // eslint-disable-next-line no-console
  console.info(`${x}\n`);
}; // noinspection JSUnusedLocalSymbols


exports.defaultLogFn = defaultLogFn;
const DEFAULT_OPTIONS
/*: OptionsType*/
= {
  debug: false,
  concurrency: 1,
  // eslint-disable-next-line no-console
  logFn: defaultLogFn,
  emulated: {
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.core.multiarray._reconstruct': function ([subtype, shape, dtype]) {
      return ndArray([], shape);
    },
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.ndarray': function ([subtype, shape, dtype]) {
      return ndArray([], shape);
    },
    // eslint-disable-next-line func-names,no-unused-vars
    '__builtin__.xrange': function (...args) {
      return args;
    },
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.dtype': function ([obj, align, copy]) {
      return parseInt(obj.replace(/[^[0-9]]/ig, ''), 10);
    }
  },
  wrapResult: false
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

const getOptions = (userOptions
/*: ?{ [string]: any }*/
) =>
/*: OptionsType*/
{
  const o = typeof userOptions === 'object' ? Object.keys(DEFAULT_OPTIONS).reduce((acc
  /*: { [string]: any }*/
  , optionName
  /*: string*/
  ) => {
    const oDict = !userOptions || typeof userOptions[optionName] === 'undefined' ? DEFAULT_OPTIONS : userOptions;
    acc[optionName] = oDict[optionName];
    return acc;
  }, {}) : Object.assign({}, DEFAULT_OPTIONS);
  pickle.updateEmulated(o.emulated);
  return o;
};

exports.getOptions = getOptions;