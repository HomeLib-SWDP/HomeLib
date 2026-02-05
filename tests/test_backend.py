import backend.models.books

def test_add_book():
    print("--- Starting Database Connection Test ---")
    
    test_book = Book(
        booktitle ="Testing Avian Connection",
        author ="test author",
        publishdate= "2/5/26",
        isbn ="000-0000000000",
        username = "test user",
        cover_id = "OLID222"
      

    )
    

    print(f"Attempting to save: {test_book.booktitle}...")
    success = add_book(test_book)
    
 
    if success:
        print("SUCCESS: Book was added to DB.")
    else:
        print("FAILED: Check your connection settings or SQL syntax.")

if __name__ == "__main__":
    test_add_book()
