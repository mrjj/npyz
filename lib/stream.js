'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _float = require('@petamoriken/float16');

var _utils = require('./utils');

var _pickle = require('./pickle');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*:: import type { OptionsType } from './options';*/ /* @flow */
/* eslint-disable quote-props */
// $FlowFixMe

/*:: declare var DataView: Object;*/


/**
 * CACHE var
 * @type {{}}
 */
/*:: declare var Buffer: Object;*/
var CACHE /*: { [string]: any }*/ = {};

// noinspection JSUnusedGlobalSymbols
/**
 * Kind
 * A character code (one of ‘biufcmMOSUV’) identifying the general kind of data.
 *
 * numpy manual https://docs.scipy.org/doc/numpy/reference/arrays.dtypes.html
 * The first character specifies the kind of data and the remaining characters specify the number
 * of bytes per item, except for Unicode, where it is interpreted as the number of characters.
 * The item size must correspond to an existing type, or an error will be raised.
 * The supported kinds are:
 *   - `?`  boolean
 *   - `b`  (signed) byte
 *   - `B`  unsigned byte
 *   - `i`  (signed) integer
 *   - `u`  unsigned integer
 *   - `f`  floating-point
 *   - `c`  complex-floating point
 *   - `m`  timedelta
 *   - `M`  datetime
 *   - `O`  (Python) objects
 *   - `S`  zero-terminated bytes (not recommended)
 *   - `a`  zero-terminated bytes (not recommended)
 *   - `U`  Unicode string
 *   - `V`  raw data (void)
 * Array-protocol type strings (see The Array Interface)
 * https://docs.scipy.org/doc/numpy/reference/arrays.interface.html#arrays-interface
 *
 * Arrays dtype
 * https://github.com/numpy/numpy/blob/master/doc/source/reference/arrays.dtypes.rst#id123
 *
 *
 * from numpy manual: https://docs.scipy.org/doc/numpy/reference/generated/numpy.dtype.html
 *   - b  boolean
 *   - i  signed integer
 *   - u  unsigned integer
 *   - f  floating-point
 *   - c  complex floating-point
 *   - m  timedelta
 *   - M  datetime
 *   - O  object
 *   - S  (byte-)string
 *   - U  Unicode
 *   - V  void
 */
var TYPE_GETTERS_MAPPING = {
  b: DataView.prototype.getUint8,
  u: {
    '1': DataView.prototype.getUint8,
    '2': DataView.prototype.getUint16,
    '4': DataView.prototype.getUint32,
    '8': DataView.prototype.getBigUint64
  },

  i: {
    '1': DataView.prototype.getInt8,
    '2': DataView.prototype.getInt16,
    '4': DataView.prototype.getInt32,
    '8': DataView.prototype.getBigInt64
  },

  f: {
    '2': _float.getFloat16,
    '4': DataView.prototype.getFloat32,
    '8': DataView.prototype.getFloat64
  },
  // * Complex double
  //   typestr == '>c8'
  // descr == [('real','>f4'), ('imag','>f4')]
  c: function getComplexDouble64(byteOffset, littleEndian) {
    return [this.getFloat32(byteOffset + 0, littleEndian), this.getFloat32(byteOffset + 4, littleEndian)];
  },
  // `m`  timedelta
  m: DataView.prototype.getBigInt64,
  // `M`  datetime
  M: function getTimeDelta(byteOffset, littleEndian) {
    return new Date(this.getBigInt64(byteOffset, littleEndian));
  },
  // `O`  (Python) objects
  O: function getPythonObject(byteOffset, endianness, objectId) {
    // throw new Error('Invalid dtype: "O", Python pickled objects are not supported currently');
    if (CACHE.parsedBufferReference !== this.buffer) {
      var objStr = Buffer.from(this.buffer).toString('binary');
      CACHE.parsedBufferResult = (0, _pickle.loads)(objStr);
      CACHE.parsedBufferReference = this.buffer;
    }
    if (typeof objectId === 'number') {
      return CACHE.parsedBufferResult[objectId];
    }
    return CACHE.parsedBufferResult;
  },
  // `S`  zero-terminated bytes (not recommended)
  S: DataView.prototype.getUint8,
  // `a`  zero-terminated bytes (not recommended)
  a: DataView.prototype.getUint8,
  // `U`  Unicode string
  U: function getUnicodeString(byteOffset, _, objectSize) {
    return _utils.UTF8_STRING_DECODER.write(
    // $FlowFixMe
    Uint8Array.from(new DataView(this.buffer, byteOffset, objectSize)));
  },
  // `V`  raw data (void)
  V: DataView.prototype.getUint8
};

/**
 * Byte order
 * from numpy manual: https://docs.scipy.org/doc/numpy/reference/generated/numpy.dtype.html
 * A character indicating the byte-order of this data-type object.
 *
 * One of:
 *
 * ‘=’  native
 * ‘<’  little-endian
 * ‘>’  big-endian
 * ‘|’  not applicable
 */

var BYTE_ORDER_TO_LE = {
  '<': true,
  '>': false,
  '|': undefined,
  '=': undefined
};

var readDType = function readDType(buf, dtype, shape) {
  var elementsToRead = shape.reduce(function (obj, x) {
    return obj * x;
  }, 1);

  var byteOrderOrKindSymbol = dtype.substr(0, 1);
  var isLe = void 0;
  var kindSymbol = void 0;
  // eslint-disable-next-line no-prototype-builtins
  if (BYTE_ORDER_TO_LE.hasOwnProperty(byteOrderOrKindSymbol)) {
    isLe = BYTE_ORDER_TO_LE[byteOrderOrKindSymbol];
    kindSymbol = dtype.substr(1, 1);
  } else {
    kindSymbol = byteOrderOrKindSymbol;
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!TYPE_GETTERS_MAPPING.hasOwnProperty(kindSymbol)) {
    throw new Error(['Invalid kind symbol: ' + kindSymbol + ' in dtype: ' + dtype, 'valid ones are: ' + Object.keys(TYPE_GETTERS_MAPPING).sort().join('')].join('\n'));
  }

  var objectSizeBytes = parseInt(dtype.substr(2), 10) || 1;
  var kindGettersOrGetter = TYPE_GETTERS_MAPPING[kindSymbol];
  var getterFn = void 0;
  if ((0, _utils.isFunction)(kindGettersOrGetter)) {
    getterFn = kindGettersOrGetter;
  } else if (typeof kindGettersOrGetter[objectSizeBytes] !== 'undefined') {
    getterFn = kindGettersOrGetter[objectSizeBytes];
  } else {
    throw new Error('Unknown dtype: ' + dtype);
  }
  var elSize = Math.floor(buf.byteLength / elementsToRead);
  var res = [];
  for (var i = 0; i < elementsToRead; i += 1) {
    res.push(getterFn.apply(new DataView(Uint8Array.from(buf).buffer), [i * elSize, isLe, i, elSize]));
  }
  return (0, _utils.ndArray)(res, shape);
};

/**
 * Parse header JSON-like string.
 *
 * @param headerStr
 * @return {{
 *    fortran_order: boolean,
 *    descr: string,
 *    shape: Array<number>
 * }}
 */
var parseHeaderStr = function parseHeaderStr(headerStr) {
  // FIXME: Make normal py2/py3 compliant parser
  var jsonHeader = headerStr
  // Python tuple to JS array:
  //    (10,) -> [10,]
  .replace('(', '[').replace(/ *,? *\),/ig, ']')

  // Python scalars to JSON scalars:
  //    False -> false
  //    True -> true
  //    None -> null
  .replace('False', 'false').replace('True', 'true').replace('None', 'null')

  // single quotes to double quotes:
  //    ' -> "
  .replace(/'/g, '"')

  // (L)arge numbers to JSON ordinary number:
  //    137L -> 137
  .replace(/([0-9]+)[L]/g, '$1');
  return Object.create(JSON.parse(jsonHeader));
};

var read = exports.read = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(rs /*: stream$Readable*/, options /*: OptionsType*/) /*: Promise<any>*/ {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve) {
              if (!rs || !(0, _utils.isFunction)(rs.read)) {
                throw new Error('Argument must be a ReadableStream.');
              }
              // Header comments are taken from
              // https://docs.scipy.org/doc/numpy-1.14.1/neps/npy-format.html#format-specification-version-1-0
              // The first 6 bytes are a magic string: exactly "x93NUMPY"
              var magicByteRaw = rs.read(1);
              if (magicByteRaw === null) {
                resolve(null);
              }
              // $FlowFixMe
              var magicByte = magicByteRaw.readUInt8();
              // offset += 1;
              // $FlowFixMe
              var magicWord = rs.read(5).toString('ascii');
              // offset += 5;
              if (magicByte !== 0x93 || magicWord !== 'NUMPY') {
                throw new Error('Unknown file type:\n  magic byte: ' + magicByte + '\n  magic word: "' + magicWord + '"');
              }
              // The next 1 byte is an unsigned byte: the major version number of the file format, e.g. x01.
              // $FlowFixMe
              var versionMajor = rs.read(1).readUInt8();
              // offset += 1;
              // The next 1 byte is an unsigned byte: the minor version number of the file format, e.g. x00.
              // $FlowFixMe
              var versionMinor = rs.read(1).readUInt8();
              // offset += 1;
              // Parse header length. This depends on the major file format version as follows:
              (0, _utils.log)('version: ' + versionMajor + '.' + versionMinor, options);
              var headerLength = void 0;
              if (versionMajor <= 1) {
                // The next 2 bytes form a little-endian unsigned short int:
                // the length of the header data HEADER_LEN.
                // $FlowFixMe
                headerLength = rs.read(2).readUInt16LE();
                // offset += 2;
              } else {
                // The next 4 bytes form a little-endian unsigned int:
                // the length of the header data HEADER_LEN.
                // $FlowFixMe
                headerLength = rs.read(4).readUInt32LE();
                // offset += 4;
              }
              (0, _utils.log)('header length: ' + headerLength, options);
              // The next HEADER_LEN bytes form the header data describing the array’s format.
              // It is an ASCII string which contains a Python literal expression of a dictionary.
              // It is terminated by a newline (‘n’) and padded with spaces (‘x20’) to make the total
              // length of the magic string + 4 + HEADER_LEN be evenly divisible by 16.

              var preludeLength = 6 + 4 + headerLength;
              if (preludeLength % 16 !== 0) {
                process.stderr.write('NPY file header is incorrectly padded. (' + preludeLength + ' is not evenly divisible by 16.)');
              }
              // $FlowFixMe
              var headerStr = rs.read(headerLength).toString('ascii');
              (0, _utils.log)(('header raw: "' + headerStr + '"').replace('\n', '\\n').replace('\t', '\\t').replace('\r', '\\r').replace('"', '\\"'), options);
              // offset += headerLength;
              var h = parseHeaderStr(headerStr);
              var dtype = h.descr;

              Object.keys(h).sort().forEach(function (k) {
                return (0, _utils.log)(k + ': ' + h[k], options);
              });
              if (h.fortran_order) {
                throw new Error('NPY file is written in Fortran byte order, support for this byte order is not yet implemented.');
              }
              // Intepret the bytes according to the specified dtype
              var shape = Array.isArray(h.shape) && h.shape.length > 0 ? h.shape : [];
              var dataChunks = [];
              // eslint-disable-next-line no-self-compare,no-constant-condition
              while (true) {
                var newChunk = rs.read();
                if (newChunk === null) {
                  break;
                } else {
                  dataChunks.push(newChunk);
                }
              }
              // $FlowFixMe
              var dataBuffer = Buffer.concat(dataChunks);
              var data = readDType(dataBuffer, h.descr, shape);
              resolve(options.wrapResult ? {
                fortran_order: h.fortran_order,
                dtype: dtype,
                data: data,
                shape: shape
              } : data);
              // $FlowFixMe
              rs.end();
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function read(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();