# NPyz

![NPyz](https://raw.githubusercontent.com/mrjj/npyz/HEAD/doc/npyz_logo.png)

`.npy` and `.npz` [NumPy](https://numpy.org) files reader for Node.JS

Version: `0.4.2`

`master` status: [![CircleCI](https://circleci.com/gh/mrjj/npyz/tree/master.svg?style=svg)](https://circleci.com/gh/mrjj/npyz/tree/master)

## Usage

### Node.js
see `./examples/example.js`

```javascript
const npyz = require('npyz');

const inputPath = process.argv[2];

npyz.read(inputPath).then(
  res => console.info(npyz.pJSON(res)),
);
```

Run it:

```bash
$ node ./examples/example.js ./src/__tests__/data/npy/test.npz 
```

See result:
```json
{
  "color": [
    [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [9,10,11],
      [12,13,14]
    ],
    [
      [15,16,17],
      [18,19,20],
      [21,22,23],
      [24,25,26],
      [27,28,29]
    ],
    [
      [30,31,32],
      [33,34,35],
      [36,37,38],
      [39,40,41],
      [42,43,44]
    ],
    [
      [45,46,47],
      [48,49,50],
      [51,52,53],
      [54,55,56],
      [57,58,59]
    ],
    [
      [60,61,62],
      [63,64,65],
      [66,67,68],
      [69,70,71],
      [72,73,74]
    ]
  ],
  "depth": [
    [0,1,2,3,4],
    [5,6,7,8,9],
    [10,11,12,13,14],
    [15,16,17,18,19],
    [20,21,22,23,24]
  ]
}
```

### Browser

Browser support is planned to be added

## Dependencies and third parties

* [half precision floating point for JavaScript](https://github.com/petamoriken/float16) is used for float16 support.
* Test files from following libraries are used [NumPy](https://github.com/numpy/numpy/blob/master/numpy/core/tests/test_dtype.py) [libnpy](https://github.com/matajoh/libnpy/tree/master/assets/test).
* [node-jpickle](https://github.com/jlaine/node-jpickle) used for (currently partial) pyhton2/python3 pickled objects support.

## Owl

```
   ◯  .       .        .           .     *     .
 .  .     .      ___---===(OvO)===---___  .      °     *
                  .              
,~^~,   .      .     ◯         .            .      ,~^~^^                
    ~^\$~^~~^#*~-^\_  __ _ _ _ _ ____/*-~^~~^^~^##~^~^
                  = * - _-  =_- . - 
```

[10]: https://wiki.openstack.org/wiki/Fuel
[20]: https://www.urbandictionary.com/define.php?term=docker 
