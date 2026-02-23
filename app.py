from flask import Flask, render_template, redirect, request, url_for, session, jsonify
from routes import books_bp
import os
import dotenv

dotenv.load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")  
app.register_blueprint(books_bp, url_prefix = '/api/books')

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('index.html') 

@app.route('/explore')
def explore():
    return render_template('explore.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

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

@app.route('/user_id_post', methods=['POST'])
def sent_user_id():
    data = request.json
    user_id = data.get('user_id')
    session['user_id'] = user_id #storing user id in flask session
    return jsonify({"message" : "User id stored in session"}) , 200
    

@app.route('/user_id_get', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')
   
@app.route('/removesession')
def remove_session():
    session.pop('user_id', None)
    
@app.route('/manualentry')
def manualentry():
    return render_template('manualentry.html')

if __name__ == '__main__':
    app.run(debug=True)