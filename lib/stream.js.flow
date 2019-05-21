/* @flow */
/* eslint-disable quote-props */
// $FlowFixMe
import { getFloat16 } from '@petamoriken/float16';

import type { OptionsType } from './options';
import { isFunction, log, ndArray, UTF8_STRING_DECODER } from './utils';
import { loads } from './pickle';

declare var DataView: Object;
declare var Buffer: Object;

/**
 * CACHE var
 * @type {{}}
 */
const CACHE: { [string]: any } = {};

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
const TYPE_GETTERS_MAPPING = {
  b: DataView.prototype.getUint8,
  u: {
    '1': DataView.prototype.getUint8,
    '2': DataView.prototype.getUint16,
    '4': DataView.prototype.getUint32,
    '8': DataView.prototype.getBigUint64,
  },

  i: {
    '1': DataView.prototype.getInt8,
    '2': DataView.prototype.getInt16,
    '4': DataView.prototype.getInt32,
    '8': DataView.prototype.getBigInt64,
  },

  f: {
    '2': getFloat16,
    '4': DataView.prototype.getFloat32,
    '8': DataView.prototype.getFloat64,
  },
  // * Complex double
  //   typestr == '>c8'
  // descr == [('real','>f4'), ('imag','>f4')]
  c: function getComplexDouble64(byteOffset, littleEndian) {
    return [
      this.getFloat32(byteOffset + 0, littleEndian),
      this.getFloat32(byteOffset + 4, littleEndian),
    ];
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
      const objStr = Buffer.from(this.buffer).toString('binary');
      CACHE.parsedBufferResult = loads(objStr);
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
    return UTF8_STRING_DECODER.write(
      // $FlowFixMe
      Uint8Array.from(
        new DataView(this.buffer, byteOffset, objectSize),
      ),
    );
  },
  // `V`  raw data (void)
  V: DataView.prototype.getUint8,
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

const BYTE_ORDER_TO_LE = {
  '<': true,
  '>': false,
  '|': undefined,
  '=': undefined,
};

const readDType = (buf, dtype, shape) => {
  const elementsToRead = shape.reduce((obj, x) => obj * x, 1);

  const byteOrderOrKindSymbol = dtype.substr(0, 1);
  let isLe;
  let kindSymbol;
  // eslint-disable-next-line no-prototype-builtins
  if (BYTE_ORDER_TO_LE.hasOwnProperty(byteOrderOrKindSymbol)) {
    isLe = BYTE_ORDER_TO_LE[byteOrderOrKindSymbol];
    kindSymbol = dtype.substr(1, 1);
  } else {
    kindSymbol = byteOrderOrKindSymbol;
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!TYPE_GETTERS_MAPPING.hasOwnProperty(kindSymbol)) {
    throw new Error([
      `Invalid kind symbol: ${kindSymbol} in dtype: ${dtype}`,
      `valid ones are: ${Object.keys(TYPE_GETTERS_MAPPING).sort().join('')}`,
    ].join('\n'));
  }

  const objectSizeBytes = parseInt(dtype.substr(2), 10) || 1;
  const kindGettersOrGetter = TYPE_GETTERS_MAPPING[kindSymbol];
  let getterFn;
  if (isFunction(kindGettersOrGetter)) {
    getterFn = kindGettersOrGetter;
  } else if (typeof kindGettersOrGetter[objectSizeBytes] !== 'undefined') {
    getterFn = kindGettersOrGetter[objectSizeBytes];
  } else {
    throw new Error(`Unknown dtype: ${dtype}`);
  }
  const elSize = Math.floor(buf.byteLength / elementsToRead);
  const res = [];
  for (let i = 0; i < elementsToRead; i += 1) {
    res.push(getterFn.apply(new DataView(Uint8Array.from(buf).buffer), [
      i * elSize,
      isLe,
      i,
      elSize,
    ]));
  }
  return ndArray(res, shape);
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
const parseHeaderStr = (headerStr) => {
  // FIXME: Make normal py2/py3 compliant parser
  const jsonHeader = headerStr
  // Python tuple to JS array:
  //    (10,) -> [10,]
    .replace('(', '[').replace(/ *,? *\),/ig, ']')

    // Python scalars to JSON scalars:
    //    False -> false
    //    True -> true
    //    None -> null
    .replace('False', 'false')
    .replace('True', 'true')
    .replace('None', 'null')

    // single quotes to double quotes:
    //    ' -> "
    .replace(/'/g, '"')

    // (L)arge numbers to JSON ordinary number:
    //    137L -> 137
    .replace(/([0-9]+)[L]/g, '$1');
  return Object.create(JSON.parse(jsonHeader));
};

export const read = async (
  rs: stream$Readable,
  options: OptionsType,
): Promise<any> => new Promise((resolve) => {
  if ((!rs) || (!isFunction(rs.read))) {
    throw new Error('Argument must be a ReadableStream.');
  }
  // Header comments are taken from
  // https://docs.scipy.org/doc/numpy-1.14.1/neps/npy-format.html#format-specification-version-1-0
  // The first 6 bytes are a magic string: exactly "x93NUMPY"
  const magicByteRaw = rs.read(1);
  if (magicByteRaw === null) {
    resolve(null);
  }
  // $FlowFixMe
  const magicByte = magicByteRaw.readUInt8();
  // offset += 1;
  // $FlowFixMe
  const magicWord = rs.read(5).toString('ascii');
  // offset += 5;
  if (magicByte !== 0x93 || magicWord !== 'NUMPY') {
    throw new Error(`Unknown file type:\n  magic byte: ${magicByte}\n  magic word: "${magicWord}"`);
  }
  // The next 1 byte is an unsigned byte: the major version number of the file format, e.g. x01.
  // $FlowFixMe
  const versionMajor = rs.read(1).readUInt8();
  // offset += 1;
  // The next 1 byte is an unsigned byte: the minor version number of the file format, e.g. x00.
  // $FlowFixMe
  const versionMinor = rs.read(1).readUInt8();
  // offset += 1;
  // Parse header length. This depends on the major file format version as follows:
  log(`version: ${versionMajor}.${versionMinor}`, options);
  let headerLength;
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
  log(`header length: ${headerLength}`, options);
  // The next HEADER_LEN bytes form the header data describing the array’s format.
  // It is an ASCII string which contains a Python literal expression of a dictionary.
  // It is terminated by a newline (‘n’) and padded with spaces (‘x20’) to make the total
  // length of the magic string + 4 + HEADER_LEN be evenly divisible by 16.

  const preludeLength = 6 + 4 + headerLength;
  if (preludeLength % 16 !== 0) {
    process.stderr.write(
      `NPY file header is incorrectly padded. (${preludeLength} is not evenly divisible by 16.)`,
    );
  }
  // $FlowFixMe
  const headerStr = rs.read(headerLength).toString('ascii');
  log(
    (`header raw: "${headerStr}"`)
      .replace('\n', '\\n')
      .replace('\t', '\\t')
      .replace('\r', '\\r')
      .replace('"', '\\"'),
    options,
  );
  // offset += headerLength;
  const h = parseHeaderStr(headerStr);
  const dtype = h.descr;

  Object.keys(h).sort().forEach(k => log(`${k}: ${h[k]}`, options));
  if (h.fortran_order) {
    throw new Error('NPY file is written in Fortran byte order, support for this byte order is not yet implemented.');
  }
  // Intepret the bytes according to the specified dtype
  const shape = (Array.isArray(h.shape) && h.shape.length > 0) ? h.shape : [];
  const dataChunks = [];
  // eslint-disable-next-line no-self-compare,no-constant-condition
  while (true) {
    const newChunk = rs.read();
    if (newChunk === null) {
      break;
    } else {
      dataChunks.push(newChunk);
    }
  }
  // $FlowFixMe
  const dataBuffer = Buffer.concat(dataChunks);
  const data = readDType(dataBuffer, h.descr, shape);
  resolve(options.wrapResult ? {
    fortran_order: h.fortran_order,
    dtype,
    data,
    shape,
  } : data);
  // $FlowFixMe
  rs.end();
});
