from flask import Blueprint, request, jsonify, session
from models.books import Book, add_book, get_books, create_shelf, add_book_to_shelf, get_user_shelves, update_shelf, remove_book_from_shelf

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
        user_id = current_user
    )

    result = add_book(new_book)

    if result:
        if result['new']:
            return jsonify({"message": "Book added successfully!"}), 200
        else:
            return jsonify({"message": "Book already exists in your library"}), 200
    else:
        return jsonify({"Error": "Failed to add book"}), 400

@books_bp.route('/get_library', methods=['GET'])
def get_library():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    
    try:
        shelf_id = request.args.get('shelf_id')
        books_data = get_books(user_id, int(shelf_id) if shelf_id else None)
        return jsonify(books_data), 200
    except Exception as e:
        print(f"Error loading library: {e}")
        return jsonify({"error": "Failed to load library"}), 500

@books_bp.route('/shelves', methods=['POST'])
def create_new_shelf():
    data = request.get_json()
    user_id = session.get('user_id') or data.get('user_id')
    if not user_id or not data.get('name'):
        return jsonify({"success": False, "message": "Missing user_id or shelf name"}), 400
    shelf_id = create_shelf(user_id, data['name'], data.get('description'))
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
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    shelves = get_user_shelves(user_id)
    return jsonify({"success": True, "shelves": shelves})

@books_bp.route('/shelves/<int:shelf_id>', methods=['PUT'])
def edit_shelf(shelf_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    data = request.get_json()
    if update_shelf(shelf_id, user_id, data.get('name'), data.get('description')):
        return jsonify({"success": True, "message": "Shelf updated"})
    return jsonify({"success": False, "message": "Failed or unauthorized"}), 400

@books_bp.route('/shelves/remove-book', methods=['POST'])
def remove_from_shelf():
    user_id = session.get('user_id')
    data = request.get_json()
    if not data.get('user_book_id') or not data.get('shelf_id'):
        return jsonify({"success": False, "message": "Missing book or shelf ID"}), 400
    if remove_book_from_shelf(data['user_book_id'], data['shelf_id']):
        return jsonify({"success": True, "message": "Book removed from shelf"})
    return jsonify({"success": False, "message": "Failed to remove the book"}), 400

