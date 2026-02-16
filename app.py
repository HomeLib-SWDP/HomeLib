from flask import Flask, render_template, redirect, url_for
from routes import books_bp
import os

app = Flask(__name__)

app.register_blueprint(books_bp, url_prefix = '/api/books')

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('index.html') 

@app.route('/explore')
def explore():
    return render_template('explore.html')

@app.route('/library')
def library():
    return render_template('library.html')

@app.route('/lists')
def lists():
    return render_template('lists.html')

@app.route('/loan')
def loan():
    return render_template('loan.html')

@app.route('/register')
def register():
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True)