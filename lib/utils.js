"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pJSON = exports.UTF8_STRING_DECODER = exports.ndArray = exports.splitExt = exports.isFunction = exports.log = void 0;

var _string_decoder = _interopRequireDefault(require("string_decoder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Log
 * @param str
 * @param options
 */
const log
/*: LogType*/
= (str
/*: string*/
, options = {}) => {
  if (options.debug === true || process.env.DEBUG) {
    // eslint-disable-next-line no-console
    (options.logFn || console.info)(str);
  }
};
/**
 * Test for function type
 * @param x {any}
 * @return {boolean}
 */


exports.log = log;

const isFunction = (x
/*: any*/
) =>
/*: boolean*/
x && {}.toString.call(x) === '[object Function]';
/**
 * Split [file path + file name] and [extension]
 * @param filePath {string}
 * @return {Array<string, string>}
 */


exports.isFunction = isFunction;

const splitExt = (filePath
/*: string*/
) =>
/*: any*/
{
  const chunks = filePath.split('.');

  if (chunks.length === 1) {
    return [filePath, ''];
  }

  const ext = chunks.pop();
  return [chunks.join('.'), ext];
};
/**
 * Make ndArray
 * @param data {?Array<any>}
 * @param dimensions {Array<number>}
 * @return {Array<any|Array<any>>}
 */


exports.splitExt = splitExt;

const ndArray = (data
/*: Array<any>*/
= [], dimensions
/*: Array<number>*/
) =>
/*: Array<any>*/
{
  const position = new Array(dimensions.length).map(() => 0);
  const sliceStep = dimensions[dimensions.length - 1];
  let sliceEnd = 0;

  const _ndArray = (dims, depth = 0) => {
    if (dims.length > 1) {
      const width = dims[0];
      const rest = dims.slice(1);
      const newArray = [];
      position[depth] = 0;

      for (let i = 0; i < width; i += 1) {
        newArray[i] = _ndArray(rest, depth + 1);
        position[depth] += 1;
      }

      return newArray;
    }

    sliceEnd += sliceStep;
    return data ? data.slice(sliceEnd - sliceStep, Math.min(sliceEnd, data.length)) : new Array(sliceStep).map(() => null);
  };

  return _ndArray(dimensions);
};
/**
 * UTF-8 string deficer
 * TODO: make decoders for both endianness
 * @type {StringDecoder}
 */


exports.ndArray = ndArray;
const UTF8_STRING_DECODER = new _string_decoder.default.StringDecoder('utf8');
/**
 * Pretty-print JSON
 * @param jsonStr
 * @return {*}
 */

exports.UTF8_STRING_DECODER = UTF8_STRING_DECODER;

const pJSON = (jsonStr
/*: any*/
) =>
/*: string*/
{
  const j = typeof jsonStr === 'string' ? jsonStr : JSON.stringify(jsonStr || {}, null, 2);
  return j.replace(/[\n ]*([0-9]+,?)[\n ]*/ig, '$1');
};

exports.pJSON = pJSON;