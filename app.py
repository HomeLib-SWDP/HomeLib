from flask import Flask, render_template, redirect, request, url_for, session, jsonify
from routes import books_bp
import os
from datetime import datetime
import dotenv
from models.loans import createLoan, expireLoansBatch, editReturn, displayLoans
from models.profile import createProfile, editProfile, displayProfile

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

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/editProfile')
def editProfile():
    return render_template('editProfile.html')

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

@app.route('/removesession')
def remove_session():
    session.pop('user_id', None)

@app.route('/user_id_post', methods=['POST'])
def store_user_info():
    data = request.json
    userId = data.get('userId')

    session['user_id'] = userId
    #print (session['user_id'])

    return jsonify({"Message": "User info stored"}) 

# to retrieve user id
@app.route('/user_id_get', methods = ['GET'])
def retrive_user_info ():
    userId = session.get('user_id')

    #print (userId)
    
    return jsonify({"userId": userId})
   
@app.route('/shelves')
def shelves():
    return render_template('shelves.html')
    
@app.route('/manualentry')
def manualentry():
    return render_template('manualentry.html')

#retrieving user id
@app.route('/store_profile', methods = ['POST'])
def store_user_profile ():

    data = request.json

    #print(data)

    usernameValue =  data.get('usernameValue')
    emailValue =  data.get('emailValue')
    date =  data.get('accountDate')
    userId =  data.get('userId') 
    #print(userId)

    # converting date to yyyy-mm-dd format so it can be accepted and stored in sql (date conversion was not working in js)
    accountDate = datetime.strptime(date[:10], '%Y-%m-%d')
    #print(accountDate)
  
    userProfile = createProfile(emailValue, accountDate, usernameValue, userId) #getting sql table insertion result

    if userProfile is None:
        return jsonify({"Duplicate Profile": userProfile})
    if userProfile is False:
        return jsonify({"Message": "Error creating profile"})
    return jsonify({"Message": "Successfully stored profile information"})

# To display user profile information
@app.route('/display_profile' , methods = ['GET'])
def display_profile():
    userId = session.get('user_id')
    #print (userId)

    profileDisplay = displayProfile(userId) #getting sql table details

    
    if profileDisplay is None:
        return jsonify({"Message": "No profile yet"})
    else:
        return jsonify(profileDisplay)

# To display loans from the backend
@app.route('/display_Loan' , methods = ['GET'])
def display_loan():

    userId = session.get('user_id')
    #print (userId)
    loandisplay = displayLoans(userId) # getting sql table results
    #print(loandisplay)
    
    if loandisplay is None:
        return jsonify({"Message": "No loans exist"})
    else:
        return jsonify(loandisplay), 200

#sending info to loan backend
@app.route('/create_Loan' , methods = ['POST'])
def make_loan():
    data = request.json

    #might have to replace userId 
    bookId =  data.get('bookId')
    userId =  session.get('user_id')
    borrowedDate =  data.get('borrowedDate')
    returningDate =  data.get('returningDate')
    borrowerName =  data.get('borrowerName')
    returningDate =  data.get('returningDate')
    bookName =  data.get('bookName')

    loanMade = createLoan(bookId, userId, borrowedDate,returningDate,borrowerName, bookName)

    if loanMade is None:
        return jsonify({"Duplicate Loan": loanMade})
    if loanMade is False:
        return jsonify({"Message": "Error creating loan"})
    return jsonify({"Message": "Successfully created Loan"})

@app.route('/edit_return')
def edit_date():
    data = request.json

    returnDate = data.get('returnDate')
    userId =  session.get('user_id')

    returned = editReturn(userId, returnDate)

    if returned is False:
        return jsonify({"Message": "Error editing return date"})
    
@app.route('/edit_profile')
def edit_profile():
    data = request.json

    userId =  session.get('user_id')

    email = data.get('email')
    username = data.get('username')
    description = data.get('description')

    edited = editProfile(email, username, description, userId)

    if edited is False:
        return jsonify({"Message": "Error editing profile"})
    return jsonify({"Message": "Profile edited successfully "})
   
@app.route('/loan_number', methods = ['POST'] )
def store_loan_num():
    data = request.json

    loanNum =  data.get('loans')

    session['loanNum'] = loanNum

    return jsonify({"Message": "Stored loan number"})

@app.route('/loan_get', methods = ['GET'])
def send_loan_num():
    loanNum = session.get('loanNum')

    return jsonify({"loanNum": loanNum})

@app.route('/save-profile', methods=['POST'])
def save_profile():
    data = request.json

    user_id = session.get('user_id')

    result = editProfile(
        user_id,                        
        data.get('description'),        
        data.get('email'),              
        data.get('username')            
    )

    if result is False:
        return {"message": "Failed to update profile"}, 400

    return {"message": "Profile updated successfully"}, 200


if __name__ == '__main__':
    app.run(debug=True)
