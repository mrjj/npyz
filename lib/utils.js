'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pJSON = exports.UTF8_STRING_DECODER = exports.ndArray = exports.splitExt = exports.isFunction = exports.log = undefined;

var _string_decoder = require('string_decoder');

var _string_decoder2 = _interopRequireDefault(_string_decoder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Log
 * @param str
 * @param options
 */
/*:: export type LogType = (str: string, options: Object) => void;*/ /* @flow */

var log /*: LogType*/ = exports.log = function log(str /*: string*/) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (options.debug === true || process.env.DEBUG) {
    (options.logFn || console.info)(str);
  }
};

/**
 * Test for function type
 * @param x {any}
 * @return {boolean}
 */
var isFunction = exports.isFunction = function isFunction(x /*: any*/) /*: boolean*/ {
  return x && {}.toString.call(x) === '[object Function]';
};

/**
 * Split [file path + file name] and [extension]
 * @param filePath {string}
 * @return {Array<string, string>}
 */
var splitExt = exports.splitExt = function splitExt(filePath /*: string*/) /*: any*/ {
  var chunks = filePath.split('.');
  if (chunks.length === 1) {
    return [filePath, ''];
  }
  var ext = chunks.pop();
  return [chunks.join('.'), ext];
};

/**
 * Make ndArray
 * @param data {?Array<any>}
 * @param dimensions {Array<number>}
 * @return {Array<any|Array<any>>}
 */
var ndArray = exports.ndArray = function ndArray() /*: Array<any>*/ {
  var data /*: Array<any>*/ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var dimensions /*: Array<number>*/ = arguments[1];

  var position = new Array(dimensions.length).map(function () {
    return 0;
  });
  var sliceStep = dimensions[dimensions.length - 1];
  var sliceEnd = 0;
  var _ndArray = function _ndArray(dims) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (dims.length > 1) {
      var width = dims[0];
      var rest = dims.slice(1);
      var newArray = [];
      position[depth] = 0;
      for (var i = 0; i < width; i += 1) {
        newArray[i] = _ndArray(rest, depth + 1);
        position[depth] += 1;
      }
      return newArray;
    }
    sliceEnd += sliceStep;
    return data ? data.slice(sliceEnd - sliceStep, Math.min(sliceEnd, data.length)) : new Array(sliceStep).map(function () {
      return null;
    });
  };
  return _ndArray(dimensions);
};

/**
 * UTF-8 string deficer
 * TODO: make decoders for both endianness
 * @type {StringDecoder}
 */
var UTF8_STRING_DECODER = exports.UTF8_STRING_DECODER = new _string_decoder2.default.StringDecoder('utf8');

/**
 * Pretty-print JSON
 * @param jsonStr
 * @return {*}
 */
var pJSON = exports.pJSON = function pJSON(jsonStr /*: any*/) /*: string*/ {
  var j = typeof jsonStr === 'string' ? jsonStr : JSON.stringify(jsonStr || {}, null, 2);
  return j.replace(/[\n ]*([0-9]+,?)[\n ]*/ig, '$1');
};