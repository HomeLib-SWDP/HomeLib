from flask import Flask, render_template, redirect, request, url_for, session, jsonify
#from routes import books_bp
import os
import dotenv

dotenv.load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")
#app.register_blueprint(books_bp, url_prefix = '/api/books')

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('index.html') 

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/explore')
def explore():
    return render_template('explore.html')


@app.route('/library')
def library():
    return render_template('library.html')

@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/loan')
def loan():
    return render_template('loan.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/user_id_post', methods=['POST'])
def sent_user_id():
    data = request.get_json()
    user_id = data.get('user_id')
    session['user_id'] = user_id #storing user id in flask session
    return jsonify({"message" : "User id stored in session"}) , 200
    

@app.route('/user_id_get', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')
    return jsonify({"user_id": user_id}), 200

@app.route('/removesession')
def remove_session():
    session.pop('user_id', None)

@app.route('/user_info_post', methods=['POST'])
def store_user_info():
    data = request.json
    userName = data.get('userName')
    email = data.get('email')
    password = data.get('password')
    accountCreationDate = data.get('accountCreationDate')

    session ['email'] = email
    session ['userName'] = userName
    session ['password'] = password
    session ['accountCreationDate'] = accountCreationDate

    #print ("Email:" , session['email'])
    #print ("Username:" , session['userName'])
    
    #print("password:" , session['password'])
    #print ("Account Creation Date:" , session['accountCreationDate'])
    return jsonify({"Message": "User info stored"}) 

@app.route('/user_info_get', methods = ['GET'])
def retrive_user_info ():
    accountCreationDate = session.get('accountCreationDate')
    email = session.get('email')
    password = session.get('password')
    userName = session.get('userName')
    #print ("EMail:" , email)
    #print ("Account creation date :", accountCreationDate)
    #print ("Password:" , password)
    #print ("Username:" , userName)
    
    return jsonify({"accountCreationDate": accountCreationDate, "email": email, "password": password, "userName": userName})
   

    
@app.route('/manualentry')
def manualentry():
    return render_template('manualentry.html')

if __name__ == '__main__':
    app.run(debug=True)