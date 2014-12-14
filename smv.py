#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# @author  Rodrigo Parra 

from flask import Flask, send_file, request
from flask.ext.mail import Mail
from flask.ext.mail import Message
from recaptcha.client import captcha 
import json

app = Flask(__name__)
app.config.from_object(__name__)
mail = Mail(app)

MAIL_DEBUG = True
app.config['RECAPTCHA_PRIVATE_KEY'] = '6LfhQP8SAAAAAAh973y4pQUfzCMRkjwZ34R9BWl6'

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

    recaptcha_challenge_field = request.form.get('recaptcha_challenge_field')
    recaptcha_response_field = request.form.get('recaptcha_response_field')
    remote_ip = request.environ.get('REMOTE_ADDR')

    recaptcha_response = captcha.submit(recaptcha_challenge_field,
        recaptcha_response_field, app.config['RECAPTCHA_PRIVATE_KEY'], remote_ip)
    if recaptcha_response.is_valid:
        mail.send(msg)
        return u'Mensaje enviado con éxito'
    else:
        error_code = recaptcha_response.error_code
        return error_code, 400



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