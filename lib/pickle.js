'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loads = exports.getMethodsFromPickle = exports.updateEmulated = undefined;

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

exports.defaultMakeMockFunction = defaultMakeMockFunction;

var _jpickle = require('jpickle');

var _jpickle2 = _interopRequireDefault(_jpickle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param args
 * @param rootArgs
 * @return {{args: *, rootArgs: *[]}}
 */
function defaultMakeMockFunction(_ref) {
  for (var _len = arguments.length, rootArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rootArgs[_key - 1] = arguments[_key];
  }

  var _ref2 = (0, _toArray3.default)(_ref),
      args = _ref2.slice(0);

  return {
    args: args,
    rootArgs: rootArgs
  };
}

/**
 * Update pickle emulated methods
 * @param emulated
 * @param forceReplace
 */
/* @flow */
// $FlowFixMe
var updateEmulated = exports.updateEmulated = function updateEmulated(emulated /*: Object*/) {
  var forceReplace /*: boolean*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  // Assign jpickle emulated
  Object.keys(emulated).sort().forEach(function (key) {
    if (forceReplace || typeof _jpickle2.default.emulated[key] === 'undefined') {
      _jpickle2.default.emulated[key] = emulated[key];
    }
  });
};

/**
 * Get methods list from pickle
 * @param pickle {string} python picle byte string
 */
var getMethodsFromPickle = exports.getMethodsFromPickle = function getMethodsFromPickle(pickle /*: string*/) /*: Array<string>*/ {
  var GLOBAL = 'c';

  var emulated = {};
  // eslint-disable-next-line no-buffer-constructor
  // const buffer: Buffer = new Buffer(pickle, 'binary');
  var readLine = function readLine(i) {
    var index = pickle.indexOf('\n', i);
    if (index === -1) {
      return '';
    }
    return pickle.substr(i, index - i);
  };

  for (var i = 0; i < pickle.length;) {
    var opcode = pickle[i];
    i += 1;
    if (opcode === GLOBAL) {
      var module = readLine(i);
      i += module.length + 1;
      var name = readLine(i);
      i += name.length + 1;
      emulated[module + '.' + name] = true;
    } else {
      readLine(i);
    }
  }
  return Object.keys(emulated).sort();
};

/**
 * Load python pickle from byte string
 * @param objStr
 * @return {*}
 */
var loads = exports.loads = function loads(objStr /*: string*/) /*: any*/ {
  var emulated = {};
  getMethodsFromPickle(objStr).forEach(function (key) {
    emulated[key] = defaultMakeMockFunction;
  });
  updateEmulated(emulated);
  return _jpickle2.default.loads(objStr);
};