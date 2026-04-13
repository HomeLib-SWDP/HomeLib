from flask import Blueprint, request, jsonify, session
import requests, random
from models.books import Book, add_book, get_books, create_shelf, add_book_to_shelf, get_user_shelves, update_shelf, delete_shelf, remove_book_from_shelf, ensure_read_shelf

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
    ensure_read_shelf(user_id)
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
    return jsonify({"success": False, "message": "Failed to edit shelf"}), 400

@books_bp.route('/shelves/<int:shelf_id>', methods=['DELETE'])
def delete_shelf_route(shelf_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    if delete_shelf(shelf_id, user_id):
        return jsonify({"success": True, "message": "Shelf deleted"})
    return jsonify({"success": False, "message": "Failed to delete shelf"}), 400

@books_bp.route('/shelves/remove-book', methods=['POST'])
def remove_from_shelf():
    user_id = session.get('user_id')
    data = request.get_json()
    if not data.get('user_book_id') or not data.get('shelf_id'):
        return jsonify({"success": False, "message": "Missing book or shelf ID"}), 400
    if remove_book_from_shelf(data['user_book_id'], data['shelf_id']):
        return jsonify({"success": True, "message": "Book removed from shelf"})
    return jsonify({"success": False, "message": "Failed to remove the book"}), 400

@books_bp.route('/<category>', methods=['GET'])
def get_books_by_cat(category):
    queries = {
        "popular": "first_publish_year:2020 subject:ny_times_bestseller",
        "new": "first_publish_year:2024 subject:fiction" ,
        "fantasy": "subject:fantasy subject:fantasy subject:ny_times_bestseller",
        "mystery": "subject:mystery subject:mystery subject:ny_times_bestseller",
        "nonfiction": "subject:nonfiction subject:nonfiction subject:ny_times_bestseller",
    }
    
    query_str = queries.get(category)
    if not query_str:
        return jsonify({"error": "Category not found"}), 404

    params = {
        "q": query_str,
        "sort": "rating",
        "limit": 25,  
        "fields": "title,author_name,cover_i,key,isbn,first_publish_year,ratings_average"
    }

    try:

        response = requests.get("https://openlibrary.org/search.json", params=params)
        response.raise_for_status()
        data = response.json()
     
        with_covers = [b for b in data.get('docs', []) if b.get('cover_i')]

        
        random.shuffle(with_covers)

        
        return jsonify(with_covers[:10])

    except Exception as e:
        print(f"CRASH in get_books_by_cat: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500