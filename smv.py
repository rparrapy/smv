from flask import Flask, send_file
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
def logout():
    msg = Message("Desde la visualizacion de mapas!",
                  body="Manda un email de contacto",
                  sender="juan@perez.com",
                  recipients=["rodpar07@gmail.com"])
    mail.send(msg)
    return 'Mail sent!'

if __name__ == "__main__":
    app.run(debug = True, port = 5000)