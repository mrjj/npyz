const npyz = require('../lib');

const inputPath = process.argv[2];

npyz.read(inputPath).then(
  res => console.info(npyz.pJSON(res)),
);
