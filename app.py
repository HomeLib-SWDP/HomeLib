from flask import Flask, render_template
from routes import books_bp
import os

app = Flask(__name__)

app.register_blueprint(books_bp, url_prefix = '/api/books')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/')
def explore():
    return render_template('explore.html')

@app.route('/')
def library():
    return render_template('library.html')

@app.route('/')
def lists():
    return render_template('lists.html')

@app.route('/')
def loan():
    return render_template('loan.html')

@app.route('/')
def register():
    return render_template('register.html')


if __name__ == '__main__':
    app.run(debug=True)