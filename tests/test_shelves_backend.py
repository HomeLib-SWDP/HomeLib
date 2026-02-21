import sys
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(project_root)
sys.path.insert(0, project_root)

from app import app
from models.books import Book, add_book, create_shelf, add_book_to_shelf, get_user_shelves

TEST_USERNAME = "testuser"

with app.test_request_context():
    print("Testing Shelves Backend\n")

    book = Book(
        username=TEST_USERNAME,
        booktitle="To Kill a Mockingbird",
        author="Harper Lee",
        isbn="9780446310789",
        cover_id="OL470087M",
        publishdate="1960-06-11"
    )
    
    user_book_id = add_book(book)
    print(f"Book Added -> ID: {user_book_id} (type: {type(user_book_id)})\n")

    shelf_tbr= create_shelf(TEST_USERNAME, "TBR", "Books I want to read in the future")
    shelf_fav= create_shelf(TEST_USERNAME, "Favorites", "Favorite books")
    print(f"Shelf 'TBR' created -> ID: {shelf_tbr}")
    print(f"Shelf 'Favorites' -> ID {shelf_fav}\n")

    if user_book_id:
        success1 = add_book_to_shelf(user_book_id, shelf_tbr)
        success2 = add_book_to_shelf(user_book_id, shelf_fav)
        print(f"Book added to TBR: {success1}")
        print(f"Book added to favorites: {success2}\n")
    else:
        print("SKIPPED linking because user_book_id or shelf_id is missing")

    shelves = get_user_shelves(TEST_USERNAME)
    print(f"\nUser has {len(shelves)} shelf(s):")
    for s in shelves:
        print(f"  * {s['name']} (ID: {s['id']})")

print("\nTest Complete")