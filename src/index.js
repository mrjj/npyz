/* @flow */
// Used as initial reference with partial code reminders possible:

import fs from 'fs';
import path from 'path';
import NodeStreamZip from 'node-stream-zip';

import type { OptionsType } from './options';
import { DEFAULT_OPTIONS, getOptions } from './options';
import { isFunction, log, splitExt } from './utils';
import { read } from './stream';
import { EXT_NPY, EXT_NPZ } from './constants';


// Setup JSON support for BigInt

declare var BigInt: Object;

// eslint-disable-next-line no-undef
// noinspection JSUnusedGlobalSymbols
BigInt.prototype.toJSON = function bigIntToJSON() {
  return (this > Number.MAX_SAFE_INTEGER) ? `/BigInt(${this.toString()})/` : Number(this);
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
export const loadNpz = (
  npzPath: string,
  options: ?OptionsType,
): Promise<{ [string]: any }> => new Promise(
  async (resolve, reject) => {
    const o: OptionsType = getOptions(options);

    // const dataChunks = []
    const zipReader = new NodeStreamZip({
      file: npzPath,
      storeEntries: true,
    });
    const result = {};
    zipReader.on('error', reject);
    zipReader.on('ready', () => {
      log(`entries: ${zipReader.entriesCount}`, o);
      let openHandlers = 0;
      let entitiesListingFinished = false;

      const tryFinalize = () => {
        if ((openHandlers === 0) && (entitiesListingFinished === true)) {
          log('closing zip reader', o);
          zipReader.close();
          log(`result keys: ${Object.keys(result).join(', ')}`, o);
          resolve(result);
        }
      };
      const entries = zipReader.entries();
      // Reading internal numpy records
      Object.keys(entries).sort().forEach((key) => {
        const entry = entries[key];
        const resultKey = entry.name.split('.').slice(0, -1).join('.');
        log(`${entry.isDirectory ? 'directory' : `${entry.size} bytes`}`, o);

        if (entry.isDirectory) {
          reject(new Error(`${npzPath} - ERROR: directory found inside npz file archive`));
        }
        const nameExt = splitExt(entry.name);
        const ext = nameExt[1].toLowerCase();
        // const name = nameExt[0];
        if (ext !== 'npy') {
          reject(new Error(`${entry.name} - ERROR: Invalid extension inside .npz file: ${ext}`));
        }
        openHandlers += 1;
        log(`Loading ${entry.name}...`);
        zipReader.stream(entry.name, async (err, stm) => {
          if (err) {
            throw new Error(err);
          }
          stm.on('error', reject);
          stm.on('readable', async () => {
            if (!result[resultKey]) {
              result[resultKey] = [];
              log(`readable ${entry.name}`, o);
              result[resultKey] = await read(stm, o);
              let drained = false;
              while (!drained) {
                const d = stm.read();
                drained = d === null;
              }
            }
          });
          stm.on('end', () => {
            log(`stream end ${entry.name}`, o);
            openHandlers -= 1;
            tryFinalize();
          });
        });
        // Do not forget to close the file once you're done
      });
      entitiesListingFinished = true;
      tryFinalize();
    });
  },
);

/**
 * Read npy file
 * @param filePath
 * @param options
 * @return {Promise<any>}
 */
export const loadNpy = (
  filePath: string,
  options: OptionsType = DEFAULT_OPTIONS,
): Promise<any> => new Promise(
  (resolve, reject) => {
    const rs = fs.createReadStream(filePath);
    rs.on('readable', () => {
      read(rs, options).then(resolve);
    });
    rs.on('error', reject);
  },
);

/**
 * Read .npy or .npz file
 * @param filePath
 * @param optionsOrCb
 * @param maybeCb
 * @return {Promise<Promise<any>>}
 */
export const load = async (
  filePath: string,
  optionsOrCb: ?OptionsType,
  maybeCb: ?(err: ?Error, res: ?any)=> void,
) => {
  let cb;
  let o;
  if (isFunction(optionsOrCb)) {
    cb = optionsOrCb;
    o = getOptions();
  } else {
    cb = maybeCb;
    o = getOptions(optionsOrCb);
  }

  const ext = filePath.split('.').slice(-1)[0].toLowerCase();
  let result;
  if (ext === EXT_NPY) {
    result = await loadNpy(filePath, o);
  } else if (ext === EXT_NPZ) {
    result = await loadNpz(filePath, o);
  } else {
    throw new Error(`${path.basename(filePath)} - ERROR: Files with extension ${ext} are not supported`);
  }
  if (typeof cb === 'function') {
    cb(null, result);
  }
  return Promise.resolve(result);
};
