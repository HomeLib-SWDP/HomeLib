from flask import Blueprint, request, jsonify, session
import requests, random
from models.books import Book, add_book, get_books, create_shelf, add_book_to_shelf, get_user_shelves, update_shelf, remove_book_from_shelf, get_user_stats

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
        user_id = current_user,
        genre = data.get('cleaned_genre') or "Other", 
        num_pages = data.get('pages') or 0
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
    if add_book_to_shelf(data['user_book_id'], data['shelf_id'], data['date_added']):
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


def get_clean_genre(subjects):

    if not subjects:
        return "Other"
    
    core_genres = ["Fiction", "Mystery", "Fantasy", "Nonfiction", "Sci-Fi", "Thriller", "History", "Biography"]

    for s in subjects:
        s_lower = s.lower()
        for core in core_genres:
            if core.lower() in s_lower:
                return core
            
    for s in subjects:
        s_lower = s.lower()
        if "nyt:" not in s_lower and "bestseller" not in s_lower and "collection" not in s_lower:
            return s.split(',')[-1].strip().title()

    return "Other"


@books_bp.route('/<category>', methods=['GET'])
def get_books_by_cat(category):
    queries = {
        "popular": "first_publish_year:2020 subject:ny_times_bestseller",
        "new": "first_publish_year:2024 subject:fiction",
        "fantasy": "subject:fantasy subject:ny_times_bestseller",
        "mystery": "subject:mystery subject:ny_times_bestseller",
        "nonfiction": "subject:nonfiction subject:ny_times_bestseller",
    }
    
    query_str = queries.get(category)
    if not query_str:
        return jsonify({"error": "Category not found"}), 404

    params = {
        "q": query_str,
        "sort": "rating",
        "limit": 25,  
        "fields": "title,author_name,cover_i,key,isbn,first_publish_year,ratings_average,subject,number_of_pages_median"
    }

    try:
        response = requests.get("https://openlibrary.org/search.json", params=params)
        response.raise_for_status()
        data = response.json()
     
        
        processed_books = []
        for b in data.get('docs', []):
            if b.get('cover_i'):
                b['cleaned_genre'] = get_clean_genre(b.get('subject', []))
                b['pages'] = b.get('number_of_pages_median', 0)
                processed_books.append(b)

        random.shuffle(processed_books)
        return jsonify(processed_books[:10])

    except Exception as e:
        print(f"crash in get_books_by_cat: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@books_bp.route('/get_stats', methods=['GET'])
def stats_route():
    current_user = session.get('user_id')
    
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    stats_data = get_user_stats(current_user)

    if stats_data:
        return jsonify(stats_data), 200
    else:
        return jsonify({"error": "Could not retrieve stats"}), 500
