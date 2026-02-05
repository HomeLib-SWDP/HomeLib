from backend.utils.sqldb import connect_to_sql, disconnect_from_sql

class Book:
    def __init__(self, booktitle, author, isbn = None, cover_id = None, publishdate = None, username = None):
        self.username = username
        self.cover_id = cover_id
        self.publishdate = publishdate
        self.booktitle = booktitle
        self.author = author
        self.isbn = isbn


def add_book(book):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = "INSERT INTO `user-book-info` (username, booktitle, isbn, author, publishdate,  cover_id) VALUES(%s,%s,%s,%s,%s,%s)"
        values = (book.username, book.booktitle, book.isbn, book.author, book.publishdate, book.cover_id)

        cursor.execute(query, values)
        cnx.commit()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        cursor.close()
        disconnect_from_sql(cnx)






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

