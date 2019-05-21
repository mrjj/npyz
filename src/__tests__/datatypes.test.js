/* @flow */
const fs = require('fs');
const path = require('path');
const npy = require('../index');

const loadFile = async (filename: string) => ({
  data: JSON.parse(JSON.stringify(await npy.load(path.join(__dirname, 'data', 'npy', filename)))),
  ref: JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'json', `${filename}.json`)).toString(),
  ),
});

test('float32', (done) => {
  loadFile('float32.npy').then(
    ({ data, ref }) => {
      expect(ref).toEqual(data);
      done();
    },
  );
});
test('float64', (done) => {
  loadFile('float64.npy').then(
    ({ data, ref }) => {
      expect(ref).toEqual(data);
      done();
    },
  );
});

test('int8', (done) => {
  loadFile('int8.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});
test('int16', (done) => {
  loadFile('int16.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('int32', (done) => {
  loadFile('int32.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('int32 big', (done) => {
  loadFile('int32_big.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});


test('int64', (done) => {
  loadFile('int64.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('python3 npy', (done) => {
  loadFile('python3.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('win64python2 npy', (done) => {
  loadFile('win64python2.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});


test('test npz', (done) => {
  loadFile('test.npz').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('test compressed npz', (done) => {
  loadFile('test_compressed.npz').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});


test('uint8', (done) => {
  loadFile('uint8.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test.skip('uint8 fortran', (done) => {
  loadFile('uint8_fortran.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('uint16', (done) => {
  loadFile('uint16.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('uint32', (done) => {
  loadFile('uint32.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('uint64', (done) => {
  loadFile('uint64.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test('py2 win64', (done) => {
  loadFile('win64python2.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});
