'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOptions = exports.DEFAULT_OPTIONS = exports.defaultLogFn = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @flow */
var _require = require('./utils'),
    ndArray = _require.ndArray;

var pickle = require('./pickle');

/*:: export type OptionsType = {
  debug: boolean,
  concurrency: number,
  wrapResult: boolean,
  logFn: (str: string) => void,
  emulated: { [string]: (args: Array<any>) => any }
};*/
var defaultLogFn = exports.defaultLogFn = function defaultLogFn(x /*: string*/) /*: void*/ {
  // eslint-disable-next-line no-console
  console.info(x + '\n');
};

// noinspection JSUnusedLocalSymbols
var DEFAULT_OPTIONS /*: OptionsType*/ = exports.DEFAULT_OPTIONS = {
  debug: false,
  concurrency: 1,
  // eslint-disable-next-line no-console
  logFn: defaultLogFn,
  emulated: {
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.core.multiarray._reconstruct': function numpyCoreMultiarray_reconstruct(_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 3),
          subtype = _ref2[0],
          shape = _ref2[1],
          dtype = _ref2[2];

      return ndArray([], shape);
    },
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.ndarray': function numpyNdarray(_ref3) {
      var _ref4 = (0, _slicedToArray3.default)(_ref3, 3),
          subtype = _ref4[0],
          shape = _ref4[1],
          dtype = _ref4[2];

      return ndArray([], shape);
    },
    // eslint-disable-next-line func-names,no-unused-vars
    '__builtin__.xrange': function __builtin__Xrange() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args;
    },
    // eslint-disable-next-line func-names,no-unused-vars
    'numpy.dtype': function numpyDtype(_ref5) {
      var _ref6 = (0, _slicedToArray3.default)(_ref5, 3),
          obj = _ref6[0],
          align = _ref6[1],
          copy = _ref6[2];

      return parseInt(obj.replace(/[^[0-9]]/ig, ''), 10);
    }
  },
  wrapResult: false
};

var getOptions = exports.getOptions = function getOptions(userOptions /*: ?{ [string]: any }*/) /*: OptionsType*/ {
  var o = (typeof userOptions === 'undefined' ? 'undefined' : (0, _typeof3.default)(userOptions)) === 'object' ? Object.keys(DEFAULT_OPTIONS).reduce(function (acc /*: { [string]: any }*/, optionName /*: string*/) {
    var oDict = !userOptions || typeof userOptions[optionName] === 'undefined' ? DEFAULT_OPTIONS : userOptions;
    acc[optionName] = oDict[optionName];
    return acc;
  }, {}) : Object.assign({}, DEFAULT_OPTIONS);

  pickle.updateEmulated(o.emulated);

  return o;
};