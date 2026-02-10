from flask import Blueprint, request, jsonify
from backend.models.books import Book, add_book, get_books

books_bp = Blueprint('books', __name__)

@books_bp.route('/books', methods=['POST'])
def add_manual_book():
    data = request.json

    new_book = Book(
        title = data.get('title'),
        author = data.get('author'),
        isbn = data.get('isbn'),
        cover_id = data.get('cover_id'),
        user_id = data.get('user_id'),
        book_id = data.get('book_id')
    )

    if add_book(new_book):
        return jsonify({"message" : f"'{new_book.title}' added successfully!"}), 201
    return jsonify({"Error": "failed to save book"}), 500

@books_bp.route('/get_library', methods=['GET'])
def get_library():
    library = get_books()
    library_dicts = [book.to_dict() for book in library]
    return jsonify(library_dicts)