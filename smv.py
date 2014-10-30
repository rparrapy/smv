from flask import Flask, send_file, request
from flask.ext.mail import Mail
from flask.ext.mail import Message

app = Flask(__name__)
app.config.from_object(__name__)
mail = Mail(app)

MAIL_DEBUG = True

@app.route("/")
def index():
    return send_file('static/index.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    msg = Message("Desde la visualizacion de mapas!",
                  body= __get_message_body(request),
                  sender="juan@perez.com",
                  recipients=["rodpar07@gmail.com"])

    for k in request.files:
        f = request.files[k]
        if f.filename:
            msg.attach(f.filename, f.headers['Content-Type'], f.read())

    mail.send(msg)
    return str(request.files['archivo'])

def __get_message_body(request):
    return '''
                Mensaje recibido de %s
           ''' % request.form['nombre']

if __name__ == "__main__":
    app.run(debug = True, port = 5000)