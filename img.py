#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# @author  Rodrigo Parra 
# @copyright 2014 Governance and Democracy Program USAID-CEAMSO
# @license   http://www.gnu.org/licenses/gpl-2.0.html
# 
# USAID-CEAMSO
# Copyright (C) 2014 Governance and Democracy Program
# http://ceamso.org.py/es/proyectos/20-programa-de-democracia-y-gobernabilidad
# 
#----------------------------------------------------------------------------
# This file is part of the Governance and Democracy Program USAID-CEAMSO,
# is distributed as free software in the hope that it will be useful, but WITHOUT 
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
# FOR A PARTICULAR PURPOSE. You can redistribute it and/or modify it under the 
# terms of the GNU Lesser General Public License version 2 as published by the 
# Free Software Foundation, accessible from <http://www.gnu.org/licenses/> or write 
# to Free Software Foundation (FSF) Inc., 51 Franklin St, Fifth Floor, Boston, 
# MA 02111-1301, USA.
# ---------------------------------------------------------------------------
# Este archivo es parte del Programa de Democracia y Gobernabilidad USAID-CEAMSO,
# es distribuido como software libre con la esperanza que sea de utilidad,
# pero sin NINGUNA GARANTÍA; sin garantía alguna implícita de ADECUACION a cualquier
# MERCADO o APLICACION EN PARTICULAR. Usted puede redistribuirlo y/o modificarlo 
# bajo los términos de la GNU Lesser General Public Licence versión 2 de la Free 
# Software Foundation, accesible en <http://www.gnu.org/licenses/> o escriba a la 
# Free Software Foundation (FSF) Inc., 51 Franklin St, Fifth Floor, Boston, 
# MA 02111-1301, USA.

import os
import json
import imghdr
import unicodedata

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
                    result[int(dname)].append(value)


    print (u'var SMV.ROW_TO_IMGS = ' + json.dumps(result, sort_keys = True, indent = 4, ensure_ascii=False) + u';') \
            .encode('utf-8')

if __name__ == "__main__":
    generate_image_index()