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

from flask import Flask, send_file, request
from flask.ext.mail import Mail
from flask.ext.mail import Message
import json

app = Flask(__name__)
app.config.from_object(__name__)
mail = Mail(app)

MAIL_DEBUG = True

@app.route("/")
def index():
    return send_file('static/index.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    sender = request.form['email'] if request.form.get('email') else 'transparencia@senavitat.gov.py'
    msg = Message("Reporte de visualización de mapas",
                  body= __get_message_body(request),
                  sender=sender,
                  recipients=["rodpar07@gmail.com"])

    for k in request.files:
        f = request.files[k]
        if f.filename:
            msg.attach(f.filename, f.headers['Content-Type'], f.read())

    mail.send(msg)
    return u'Mensaje enviado con éxito'

def __get_message_body(request):
    msg = u''
    if request.form.get('nombre'): msg += u'Nombre Completo: %s\n' % request.form['nombre']
    if request.form.get('email'): msg += u'Correo Electrónico: %s\n' % request.form['email']
    if request.form.get('telefono'): msg += u'Teléfono: %s\n' % request.form['telefono']
    if request.form.get('mensaje'): msg += '\n%s\n\n' % request.form['mensaje']
    if request.form.get('proyecto'):
        msg += u'\n\n'
        proyecto = json.loads(request.form['proyecto'])
        msg += __get_feature_text(proyecto)

    return msg

def __get_feature_text(feature):
    msg = u''
    for k in feature['properties'].keys():
        val = feature['properties'][k]
        msg += '%s:%s\n' % (k, val)
    return msg




if __name__ == "__main__":
    app.run(debug = True, port = 5000)