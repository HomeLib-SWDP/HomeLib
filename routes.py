from flask import Blueprint, request, jsonify
from models.books import Book, add_book

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

