from flask import Flask, render_template, redirect, request, url_for, session, jsonify
from routes import books_bp
import os
import dotenv
from models.loans import createLoan, expireLoansBatch, editReturn, displayLoans

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
  
    #print (session['user_id])

    return jsonify({"Message": "User info stored"}) 

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
    
@app.route('/display_Loan' , methods = ['GET'])
def display_loan():
    userId = session.get('user_id')
    #print (userId)
    loandisplay = displayLoans(userId)
    #print(loandisplay)
    if loandisplay is None:
        return jsonify({"Message": "No loans exist"})
    else:
        return jsonify(loandisplay), 200

@app.route('/create_Loan' , methods = ['POST'])
def make_loan():
    data = request.json

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
    return jsonify(loanMade), 200

'''
@app.route('edit_return')
def edit_date():
'''
   
@app.route('/loan_number', methods = ['POST'] )
def store_loan_num():
    data = request.json

    loanNum =  data.get('loans')

    return jsonify({"loanNum": loanNum})


if __name__ == '__main__':
    app.run(debug=True)