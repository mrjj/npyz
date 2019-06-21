/* @flow */
import StringDecoder from 'string_decoder';

export type LogType = (str: string, options: Object) => void;

/**
 * Log
 * @param str
 * @param options
 */
export const log: LogType = (str: string, options = {}) => {
  if ((options.debug === true) || process.env.DEBUG) {
    // eslint-disable-next-line no-console
    (options.logFn || console.info)(str);
  }
};

/**
 * Test for function type
 * @param x {any}
 * @return {boolean}
 */
export const isFunction = (x: any): boolean => (x && ({}.toString.call(x) === '[object Function]'));

/**
 * Split [file path + file name] and [extension]
 * @param filePath {string}
 * @return {Array<string, string>}
 */
export const splitExt = (filePath: string): any => {
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
export const ndArray = (data: Array<any> = [], dimensions: Array<number>): Array<any> => {
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
    return data
      ? data.slice(sliceEnd - sliceStep, Math.min(sliceEnd, data.length))
      : new Array(sliceStep).map(() => null);
  };
  return _ndArray(dimensions);
};

/**
 * UTF-8 string deficer
 * TODO: make decoders for both endianness
 * @type {StringDecoder}
 */
export const UTF8_STRING_DECODER = new StringDecoder.StringDecoder('utf8');

/**
 * Pretty-print JSON
 * @param jsonStr
 * @return {*}
 */
export const pJSON = (jsonStr: any): string => {
  const j = (typeof jsonStr === 'string') ? jsonStr : JSON.stringify(jsonStr || {}, null, 2);
  return j.replace(/[\n ]*([0-9]+,?)[\n ]*/ig, '$1');
};
