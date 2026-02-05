from flask import Flask
from routes.books import books_bp
import os

app = Flask(__name__)

app.register_blueprint(books_bp, url_prefix = '/api/books')

if __name__ == '__main__':
    app.run(debug=True)