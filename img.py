#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# @author  Rodrigo Parra 
# @license   http://www.gnu.org/licenses/gpl-2.0.html
# 

import os
import json
import imghdr
import unicodedata
from unidecode import unidecode
from PIL import Image

def generate_image_index():
    basepath = './static/img/numerados'
    result = {}
    for dname in os.listdir(basepath):
        path = os.path.join(basepath, dname)
        if os.path.isdir(path):
            result[int(dname)] = []
            for fname in os.listdir(path):
                fpath = os.path.join(path, fname)
                if os.path.isfile(fpath) and imghdr.what(fpath):
                    value = unicodedata.normalize('NFC', unicode(fpath, 'utf-8'))
                    resized = resize_image(value)
                    result[int(dname)].append(resized)



    print (u'SMV.ROW_TO_IMGS = ' + json.dumps(result, sort_keys = True, indent = 4, ensure_ascii=False) + u';') \
            .encode('utf-8')


def resize_image(file):
    im = Image.open(file)
    ext = file.split('.')[-1]
    name = '.' + ''.join(file.split('.')[:-1])
    w, h = im.size

    rw = float(800)
    scale = rw/w
    rh = int(h * scale)
    im.thumbnail((rw, rh))
    result = unidecode(name + '.' + ext)
    im.save(result, im.format)

    rw = float(373)
    scale = rw/w
    rh = int(h * scale)
    im.thumbnail((rw, rh))
    im.save(unidecode(name + '.thumbnail.' + ext), im.format)
    
    if not file == result:
        os.remove(file)

    return result

if __name__ == "__main__":
    generate_image_index()