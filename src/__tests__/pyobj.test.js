const fs = require('fs');
const path = require('path');
const npy = require('../index');

const loadFile = async filename => ({
  data: JSON.parse(JSON.stringify(await npy.load(path.join(__dirname, 'data', 'npy', filename)))),
  ref: JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'json', `${filename}.json`)
    .toString())),
});

test.skip('py2-objarr', (done) => {
  loadFile('py2-objarr.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});


test.skip('py2-objarr npz', (done) => {
  loadFile('py2-objarr.npz').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test.skip('py3-objarr npy', (done) => {
  loadFile('py3-objarr.npy').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});

test.skip('py3-objarr npz', (done) => {
  loadFile('py3-objarr.npz').then(
    ({ data, ref }) => {
      expect(data).toEqual(ref);
      done();
    },
  );
});
