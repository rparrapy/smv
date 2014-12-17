#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# @author  Rodrigo Parra 

from flask import Flask, send_file, request
from flask.ext.mail import Mail
from flask.ext.mail import Message
import json
import requests

app = Flask(__name__)
app.config.from_object('default_config')
app.config.from_envvar('SMV_CONF')
mail = Mail(app)

@app.route("/")
def index():
    return send_file('static/index.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    sender = request.form['email'] if request.form.get('email') else 'transparencia@senavitat.gov.py'
    msg = Message("Reporte de visualización de mapas",
                  body= __get_message_body(request),
                  sender=sender,
                  recipients=["transparencia@senavitat.gov.py", "rodpar07@gmail.com"])

    for k in request.files:
        f = request.files[k]
        if f.filename:
            msg.attach(f.filename, f.headers['Content-Type'], f.read())

    recaptcha_field = request.form.get('g-recaptcha-response')
    remote_ip = request.environ.get('REMOTE_ADDR')

    qparams = {'secret': app.config['RECAPTCHA_PRIVATE_KEY'], 'response': recaptcha_field, 'remoteip': remote_ip}
    response = requests.get('https://www.google.com/recaptcha/api/siteverify', params = qparams)

    resolved = response.json()['success']
    if resolved:
        mail.send(msg)
        return u'Mensaje enviado con éxito'
    else:
        return u'Error al resolver el captcha', 400



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
    app.run(debug = False, port = 5000)