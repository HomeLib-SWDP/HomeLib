from flask import Flask
from flask_cors import CORS
from backend.routes import books_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(books_bp, url_prefix = '/api/books')

if __name__ == '__main__':
    app.run(debug=True)