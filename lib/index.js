"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports.loadNpy = exports.loadNpz = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _nodeStreamZip = _interopRequireDefault(require("node-stream-zip"));

var _options = require("./options");

var _utils = require("./utils");

var _stream = require("./stream");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Used as initial reference with partial code reminders possible:
// eslint-disable-next-line no-undef
// noinspection JSUnusedGlobalSymbols
BigInt.prototype.toJSON = function bigIntToJSON() {
  return this > Number.MAX_SAFE_INTEGER ? `/BigInt(${this.toString()})/` : Number(this);
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


const loadNpz = (npzPath
/*: string*/
, options
/*: ?OptionsType*/
) =>
/*: Promise<{ [string]: any }>*/
new Promise(async (resolve, reject) => {
  const o
  /*: OptionsType*/
  = (0, _options.getOptions)(options); // const dataChunks = []

  const zipReader = new _nodeStreamZip.default({
    file: npzPath,
    storeEntries: true
  });
  const result = {};
  zipReader.on('error', reject);
  zipReader.on('ready', () => {
    (0, _utils.log)(`entries: ${zipReader.entriesCount}`, o);
    let openHandlers = 0;
    let entitiesListingFinished = false;

    const tryFinalize = () => {
      if (openHandlers === 0 && entitiesListingFinished === true) {
        (0, _utils.log)('closing zip reader', o);
        zipReader.close();
        (0, _utils.log)(`result keys: ${Object.keys(result).join(', ')}`, o);
        resolve(result);
      }
    };

    const entries = zipReader.entries(); // Reading internal numpy records

    Object.keys(entries).sort().forEach(key => {
      const entry = entries[key];
      const resultKey = entry.name.split('.').slice(0, -1).join('.');
      (0, _utils.log)(`${entry.isDirectory ? 'directory' : `${entry.size} bytes`}`, o);

      if (entry.isDirectory) {
        reject(new Error(`${npzPath} - ERROR: directory found inside npz file archive`));
      }

      const nameExt = (0, _utils.splitExt)(entry.name);
      const ext = nameExt[1].toLowerCase(); // const name = nameExt[0];

      if (ext !== 'npy') {
        reject(new Error(`${entry.name} - ERROR: Invalid extension inside .npz file: ${ext}`));
      }

      openHandlers += 1;
      (0, _utils.log)(`Loading ${entry.name}...`);
      zipReader.stream(entry.name, async (err, stm) => {
        if (err) {
          throw new Error(err);
        }

        stm.on('error', reject);
        stm.on('readable', async () => {
          if (!result[resultKey]) {
            result[resultKey] = [];
            (0, _utils.log)(`readable ${entry.name}`, o);
            result[resultKey] = await (0, _stream.read)(stm, o);
            let drained = false;

            while (!drained) {
              const d = stm.read();
              drained = d === null;
            }
          }
        });
        stm.on('end', () => {
          (0, _utils.log)(`stream end ${entry.name}`, o);
          openHandlers -= 1;
          tryFinalize();
        });
      }); // Do not forget to close the file once you're done
    });
    entitiesListingFinished = true;
    tryFinalize();
  });
});
/**
 * Read npy file
 * @param filePath
 * @param options
 * @return {Promise<any>}
 */


exports.loadNpz = loadNpz;

const loadNpy = (filePath
/*: string*/
, options
/*: OptionsType*/
= _options.DEFAULT_OPTIONS) =>
/*: Promise<any>*/
new Promise((resolve, reject) => {
  const rs = _fs.default.createReadStream(filePath);

  rs.on('readable', () => {
    (0, _stream.read)(rs, options).then(resolve);
  });
  rs.on('error', reject);
});
/**
 * Read .npy or .npz file
 * @param filePath
 * @param optionsOrCb
 * @param maybeCb
 * @return {Promise<Promise<any>>}
 */


exports.loadNpy = loadNpy;

const load = async (filePath
/*: string*/
, optionsOrCb
/*: ?OptionsType*/
, maybeCb
/*: ?(err: ?Error, res: ?any)=> void*/
) => {
  let cb;
  let o;

  if ((0, _utils.isFunction)(optionsOrCb)) {
    cb = optionsOrCb;
    o = (0, _options.getOptions)();
  } else {
    cb = maybeCb;
    o = (0, _options.getOptions)(optionsOrCb);
  }

  const ext = filePath.split('.').slice(-1)[0].toLowerCase();
  let result;

  if (ext === _constants.EXT_NPY) {
    result = await loadNpy(filePath, o);
  } else if (ext === _constants.EXT_NPZ) {
    result = await loadNpz(filePath, o);
  } else {
    throw new Error(`${_path.default.basename(filePath)} - ERROR: Files with extension ${ext} are not supported`);
  }

  if (typeof cb === 'function') {
    cb(null, result);
  }

  return Promise.resolve(result);
};

exports.load = load;