from flask import Blueprint, request, jsonify
from models.books import Book, add_book

books_bp = Blueprint('books', __name__)

@books_bp.route('/api/books', methods=['POST'])


def add_manual_book():
    data = request.json

    new_book = Book(
        booktitle = request.form.get('title'),
        author = request.form.gett('author'),
        isbn = request.form.get('isbn'),
        cover_id = data.get('cover_id'),
        publish_date = data.form.get('publish_date'),
        username = request.form.get('username')
    )

    if add_book(new_book):
        return jsonify({"message" : f"'{new_book.title}' added successfully!"}), 201
    return jsonify({"Error": "failed to save book"}), 500

