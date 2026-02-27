from flask import Blueprint, request, jsonify, session
from models.books import Book, add_book, get_books, create_shelf, add_book_to_shelf, get_user_shelves
from models.loans import createLoan

books_bp = Blueprint('books', __name__)

@books_bp.route('/add_manual_book', methods=['POST'])


def add_manual_book():
    
    current_user = session.get('user_id')
   
    data = request.json

    new_book = Book(
        booktitle = data.get('title'),
        author = data.get('author'),
        isbn = data.get('isbn'),
        cover_id = data.get('cover_id'),
        publishdate = data.get('publish_date'),
        username=current_user
    )

    book_id = add_book(new_book)

    if book_id:
        return jsonify({"message": "Book added successfully!"}), 200
    else:
        return jsonify({"Error": "Failed to add book. It might already exist."}), 400

@books_bp.route('/get_library', methods=['GET'])
def get_library():
    library = get_books()
    library_dicts = [book.to_dict() for book in library]
    return jsonify(library_dicts)

@books_bp.route('/shelves', methods=['POST'])
def create_new_shelf():
    data = request.get_json()
    username = session.get('username') or data.get('username')
    if not username or not data.get('name'):
        return jsonify({"success": False, "message": "Missing username or shelf name"}), 400
    shelf_id = create_shelf(username, data['name'], data.get('description'))
    if shelf_id:
        return jsonify({"success": True, "shelf_id": shelf_id, "message": "Shelf created successfully"}), 201
    return jsonify({"success": False, "message": "Failed to create shelf"}), 500

@books_bp.route('/shelves/add-book', methods=['POST'])
def add_to_shelf():
    data = request.get_json()
    if not data.get('user_book_id') or not data.get('shelf_id'):
        return jsonify({"success": False, "message": "Missing book ID or shelf ID"}), 400
    if add_book_to_shelf(data['user_book_id'], data['shelf_id']):
        return jsonify({"success": True, "message": "Book added to shelf"}), 201
    return jsonify({"success": False, "message": "Failed to add book to shelf"}), 500

@books_bp.route('/shelves/my', methods=['GET'])
def get_my_shelves():
    username = session.get('username')
    if not username: 
        return jsonify({"success": False, "message": "Not logged in"}), 401
    shelves = get_user_shelves(username)
    return jsonify({"success": True, "shelves": shelves})


#@books_bp.route('/make-loan', methods = ['POST'])
#def create_new_loan():
   # data = request.get_json()
   # borrowedate = data.get('borrowedDate')
      #returningdate = data.get('returningDate')
       #user_book_id = data.get('user_book_id')
      # borrowerName = data.get('borrowerName')
       #newLoan = createLoan(borrowedate, returningdate, user_book_id, borrowerName)

    
#@books_bp.route('/display_user_loans', methods = ['GET'])
#def display_loans():
  #  data = request.get_json()
  #  userId = data.get('user_id')
