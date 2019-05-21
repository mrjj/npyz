/* @flow */
// $FlowFixMe
import jpickle from 'jpickle';

/**
 *
 * @param args
 * @param rootArgs
 * @return {{args: *, rootArgs: *[]}}
 */
export function defaultMakeMockFunction([...args]: Array<any>, ...rootArgs: Array<any>) {
  return {
    args,
    rootArgs,
  };
}

/**
 * Update pickle emulated methods
 * @param emulated
 * @param forceReplace
 */
export const updateEmulated = (emulated: Object, forceReplace: boolean = false) => {
  // Assign jpickle emulated
  Object.keys(emulated).sort().forEach(((key) => {
    if (forceReplace || (typeof jpickle.emulated[key] === 'undefined')) {
      jpickle.emulated[key] = emulated[key];
    }
  }));
};

/**
 * Get methods list from pickle
 * @param pickle {string} python picle byte string
 */
export const getMethodsFromPickle = (pickle: string): Array<string> => {
  const GLOBAL = 'c';

  const emulated = {};
  // eslint-disable-next-line no-buffer-constructor
  // const buffer: Buffer = new Buffer(pickle, 'binary');
  const readLine = (i) => {
    const index = pickle.indexOf('\n', i);
    if (index === -1) {
      return '';
    }
    return pickle.substr(i, index - i);
  };

  for (let i = 0; i < pickle.length;) {
    const opcode = pickle[i];
    i += 1;
    if (opcode === GLOBAL) {
      const module = readLine(i);
      i += module.length + 1;
      const name = readLine(i);
      i += name.length + 1;
      emulated[`${module}.${name}`] = true;
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
export const loads = (objStr: string): any => {
  const emulated = {};
  getMethodsFromPickle(objStr).forEach((key) => {
    emulated[key] = defaultMakeMockFunction;
  });
  updateEmulated(emulated);
  return jpickle.loads(objStr);
};
