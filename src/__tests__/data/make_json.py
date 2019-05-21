import codecs
import json
import os
import sys

import numpy as np
import jsonpickle
import jsonpickle.ext.numpy as jsonpickle_numpy
jsonpickle_numpy.register_handlers()

NPY_DIR = './npy'
JSON_DIR = './json'

if not os.path.exists(JSON_DIR):
  os.path.mkdir(JSON_DIR)
for r, d, f in os.walk(NPY_DIR):
    for file in f:
        ext = file.split('.')[-1]
        if ext in ('npy', 'npz',):
            input_path = os.path.join(r, file)
            output_path = os.path.join(JSON_DIR, '%s.json' % file)
            sys.stdout.write('%s  ->  %s\n' % (input_path, output_path))
            data = np.load(input_path, encoding='bytes', allow_pickle=True)
            if ext == 'npz':
                data = dict(data)
                res = {}
                for k,v in data.items():
                    res[k] = v.tolist()
            else:
                res = data.tolist()
            with open(output_path, 'w+') as f:
                print(data)
                print(jsonpickle.encode(res))
                f.write(jsonpickle.encode(res))
