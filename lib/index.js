'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports.loadNpy = exports.loadNpz = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeStreamZip = require('node-stream-zip');

var _nodeStreamZip2 = _interopRequireDefault(_nodeStreamZip);

var _options = require('./options');

var _utils = require('./utils');

var _stream = require('./stream');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*:: import type { OptionsType } from './options';*/ /* @flow */
// Used as initial reference with partial code reminders possible:

// Setup JSON support for BigInt

// eslint-disable-next-line no-undef
// noinspection JSUnusedGlobalSymbols
/*:: declare var BigInt: Object;*/
BigInt.prototype.toJSON = function bigIntToJSON() {
  return this > Number.MAX_SAFE_INTEGER ? '/BigInt(' + this.toString() + ')/' : Number(this);
};

/**
 * Read .npz file
 *
 * [numpy doc](https://www.numpy.org/devdocs/reference/generated/numpy.savez_compressed.html#numpy.savez_compressed)
 * The .npz file format is a zipped archive of files named after the variables they contain.
 * The archive is compressed with zipfile.ZIP_DEFLATED and each file in the archive contains one
 * variable in .npy format. For a description of the .npy format, see numpy.lib.format.
 *
 * @param npzPath {string}
 * @param options {Object}
 * @return {Promise<any>}
 */
var loadNpz = exports.loadNpz = function loadNpz(npzPath /*: string*/, options /*: ?OptionsType*/) /*: Promise<{ [string]: any }>*/ {
  return new Promise(function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(resolve, reject) {
      var o, zipReader, result;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              o = (0, _options.getOptions)(options);

              // const dataChunks = []

              zipReader = new _nodeStreamZip2.default({
                file: npzPath,
                storeEntries: true
              });
              result = {};

              zipReader.on('error', reject);
              zipReader.on('ready', function () {
                (0, _utils.log)('entries: ' + zipReader.entriesCount, o);
                var openHandlers = 0;
                var entitiesListingFinished = false;

                var tryFinalize = function tryFinalize() {
                  if (openHandlers === 0 && entitiesListingFinished === true) {
                    (0, _utils.log)('closing zip reader', o);
                    zipReader.close();
                    (0, _utils.log)('result keys: ' + Object.keys(result).join(', '), o);
                    resolve(result);
                  }
                };
                var entries = zipReader.entries();
                // Reading internal numpy records
                Object.keys(entries).sort().forEach(function (key) {
                  var entry = entries[key];
                  var resultKey = entry.name.split('.').slice(0, -1).join('.');
                  (0, _utils.log)('' + (entry.isDirectory ? 'directory' : entry.size + ' bytes'), o);

                  if (entry.isDirectory) {
                    reject(new Error(npzPath + ' - ERROR: directory found inside npz file archive'));
                  }
                  var nameExt = (0, _utils.splitExt)(entry.name);
                  var ext = nameExt[1].toLowerCase();
                  // const name = nameExt[0];
                  if (ext !== 'npy') {
                    reject(new Error(entry.name + ' - ERROR: Invalid extension inside .npz file: ' + ext));
                  }
                  openHandlers += 1;
                  (0, _utils.log)('Loading ' + entry.name + '...');
                  zipReader.stream(entry.name, function () {
                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(err, stm) {
                      return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (!err) {
                                _context2.next = 2;
                                break;
                              }

                              throw new Error(err);

                            case 2:
                              stm.on('error', reject);
                              stm.on('readable', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                var drained, d;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                  while (1) {
                                    switch (_context.prev = _context.next) {
                                      case 0:
                                        if (result[resultKey]) {
                                          _context.next = 8;
                                          break;
                                        }

                                        result[resultKey] = [];
                                        (0, _utils.log)('readable ' + entry.name, o);
                                        _context.next = 5;
                                        return (0, _stream.read)(stm, o);

                                      case 5:
                                        result[resultKey] = _context.sent;
                                        drained = false;

                                        while (!drained) {
                                          d = stm.read();

                                          drained = d === null;
                                        }

                                      case 8:
                                      case 'end':
                                        return _context.stop();
                                    }
                                  }
                                }, _callee, undefined);
                              })));
                              stm.on('end', function () {
                                (0, _utils.log)('stream end ' + entry.name, o);
                                openHandlers -= 1;
                                tryFinalize();
                              });

                            case 5:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, undefined);
                    }));

                    return function (_x3, _x4) {
                      return _ref2.apply(this, arguments);
                    };
                  }());
                  // Do not forget to close the file once you're done
                });
                entitiesListingFinished = true;
                tryFinalize();
              });

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * Read npy file
 * @param filePath
 * @param options
 * @return {Promise<any>}
 */
var loadNpy = exports.loadNpy = function loadNpy(filePath /*: string*/) /*: Promise<any>*/ {
  var options /*: OptionsType*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _options.DEFAULT_OPTIONS;
  return new Promise(function (resolve, reject) {
    var rs = _fs2.default.createReadStream(filePath);
    rs.on('readable', function () {
      (0, _stream.read)(rs, options).then(resolve);
    });
    rs.on('error', reject);
  });
};

/**
 * Read .npy or .npz file
 * @param filePath
 * @param optionsOrCb
 * @param maybeCb
 * @return {Promise<Promise<any>>}
 */
var load = exports.load = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(filePath /*: string*/, optionsOrCb /*: ?OptionsType*/, maybeCb /*: ?(err: ?Error, res: ?any)=> void*/) {
    var cb, o, ext, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            cb = void 0;
            o = void 0;

            if ((0, _utils.isFunction)(optionsOrCb)) {
              cb = optionsOrCb;
              o = (0, _options.getOptions)();
            } else {
              cb = maybeCb;
              o = (0, _options.getOptions)(optionsOrCb);
            }

            ext = filePath.split('.').slice(-1)[0].toLowerCase();
            result = void 0;

            if (!(ext === _constants.EXT_NPY)) {
              _context4.next = 11;
              break;
            }

            _context4.next = 8;
            return loadNpy(filePath, o);

          case 8:
            result = _context4.sent;
            _context4.next = 18;
            break;

          case 11:
            if (!(ext === _constants.EXT_NPZ)) {
              _context4.next = 17;
              break;
            }

            _context4.next = 14;
            return loadNpz(filePath, o);

          case 14:
            result = _context4.sent;
            _context4.next = 18;
            break;

          case 17:
            throw new Error(_path2.default.basename(filePath) + ' - ERROR: Files with extension ' + ext + ' are not supported');

          case 18:
            if (typeof cb === 'function') {
              cb(null, result);
            }
            return _context4.abrupt('return', Promise.resolve(result));

          case 20:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function load(_x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();