#!/usr/bin/env python
# -*- coding: utf-8 -*-

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
    msg = Message("Reporte de visualización de mapas",
                  body= __get_message_body(request),
                  sender=request.form['email'],
                  recipients=["rodpar07@gmail.com"])

    for k in request.files:
        f = request.files[k]
        if f.filename:
            msg.attach(f.filename, f.headers['Content-Type'], f.read())

    #mail.send(msg)
    return str(request.form['mensaje'])

def __get_message_body(request):
    print 'Get message'

    msg = u'''
                Nombre Completo: %s\n
                Correo Electrónico:  %s\n
                Teléfono: %s\n
                \n
                %s
                \n
                Datos del Proyecto\n
           ''' % (request.form['nombre'], request.form['email'], request.form['telefono'], request.form['mensaje'])

    if request.form['proyecto']:
        print 'Entraaaa'
        msg += __get_feature_text(json.loads(request.form['proyecto']))
    return msg

def __get_feature_text(feature):
  msg = ''
  for k in feature['properties'].keys():
    val = feature['properties'][k]
    msg += '%s:%s\n' % (k, val)




if __name__ == "__main__":
    app.run(debug = True, port = 5000)