from flask import Blueprint, request, jsonify
from models.books import Book, add_book

books_bp = Blueprint('books', __name__)

@books_bp.route('/api/books', methods=['POST'])


def add_manual_book():
    data = request.json

    new_book = Book(
        booktitle = data.get('booktitle'),
        author = data.get('author'),
        isbn = data.get('isbn'),
        cover_id = data.get('cover_id'),
        username = data.get('username') 
    )

    if add_book(new_book):
        return jsonify({"message" : f"'{new_book.title}' added successfully!"}), 201
    return jsonify({"Error": "failed to save book"}), 500

@books_bp.route('/user_id_post', methods=['POST'])
def sent_user_id():
    data = request.json
    user_id = data.get('user_id')
    session['user_id'] = user_id #storing user id in flask session
    return jsonify({"message" : "User id stored in session"}) , 200
    

@books_bp.route('/user_id_get', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')
    return jsonify({"user_id": user_id})
