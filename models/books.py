from utils.sqldb import connect_to_sql, disconnect_from_sql

class Book:
    def __init__(self, booktitle, author, isbn = None, cover_id = None, publishdate = None, user_id = None, cover_edition_key = None, ratings_average = None):
        self.user_id = user_id
        self.cover_id = cover_id
        self.publishdate = publishdate
        self.booktitle = booktitle
        self.author = author
        self.isbn = isbn
        self.cover_edition_key = cover_edition_key
        self.ratings_average = ratings_average

    def to_dict(self):
        return {
            "booktitle": self.booktitle,
            "isbn": self.isbn,
            "publishdate": self.publishdate,
            "cover_id": self.cover_id,
            "author": self.author,
            "user_id": self.user_id,
            "cover_edition_key": "",
            "ratings_average": self.ratings_average
        }

def add_book(book):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        cursor.execute("""
            SELECT lib_id FROM `user_books`
            WHERE user_id = %s 
              AND booktitle = %s 
              AND author = %s
        """, (book.user_id, book.booktitle, book.author))
        
        result = cursor.fetchone()
        if result:
            existing_id = result[0]
            return {'id': existing_id, 'new': False}

        query = """
            INSERT INTO `user_books` (user_id, booktitle, isbn, author, publishdate, cover_id)
            VALUES(%s, %s, %s, %s, %s, %s)
        """
        values = (book.user_id, book.booktitle, book.isbn, book.author, book.publishdate, book.cover_id)
        cursor.execute(query, values)
        cnx.commit()
        
        new_id = cursor.lastrowid
        return {'id': new_id, 'new': True}
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def get_books(user_id, shelf_id=None):
    cnx = connect_to_sql()
    cursor = cnx.cursor(dictionary=True, buffered=True)
    try:
        if shelf_id:
            query = """
                SELECT b.user_id, b.booktitle, b.isbn, b.author, b.publishdate, b.cover_id , b.lib_id
                FROM user_books b
                JOIN shelf_books sb ON b.lib_id = sb.user_book_id
                WHERE b.user_id = %s AND sb.shelf_id = %s
            """
            cursor.execute(query, (user_id, shelf_id))
        else:
            query = "SELECT user_id, booktitle, isbn, author, publishdate, cover_id, lib_id FROM user_books WHERE user_id = %s"
            cursor.execute(query, (user_id,))
        rows=cursor.fetchall()
        return [{
            'lib_id' : row['lib_id'],
            'title' : row['booktitle'],
            'author' : row['author'],
            'cover_i' : row['cover_id'],
            'isbn' : row['isbn'],
            'publishdate': str(row['publishdate']),
            'lib_id': row['lib_id']
        } for row in rows]
    finally:
        cursor.close()
        disconnect_from_sql(cnx)


def test_add_book():
    print("--- Starting Database Connection Test ---")
    
    test_book = Book(
        booktitle ="Testing Avian Connection",
        author ="test author",
        publishdate= "2/5/26",
        isbn ="000-111111",
        user_id = "test user",
        cover_id = "OLID222"  
    )
    
    success = add_book(test_book)
    
    if success:
        print("SUCCESS: Book was added to DB.")
    else:
        print("FAILED: Check your connection settings or SQL syntax.")

def create_shelf(user_id, name, description=None):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = "INSERT INTO `shelves` (user_id, name, description) VALUES (%s, %s, %s)"
        cursor.execute(query, (user_id, name, description))
        cnx.commit()
        return cursor.lastrowid
    except Exception as e:
        if "Duplicate entry" in str(e):
            cursor.execute("""
                SELECT id FROM `shelves`
                WHERE user_id = %s AND name = %s
            """, (user_id, name))
            result = cursor.fetchone()
            return result[0] if result else None
        else:
            print(f"Create shelf error: {e}")
            return None
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def ensure_read_shelf(user_id):
    shelves = get_user_shelves(user_id)
    if not any(s.get('name') == 'Read' for s in shelves):
        create_shelf(user_id, 'Read', 'Default shelf for books you have read')

def add_book_to_shelf(user_book_id, shelf_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = "INSERT INTO `shelf_books` (user_book_id, shelf_id) VALUES (%s, %s)"
        cursor.execute(query, (user_book_id, shelf_id))
        cnx.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def get_user_shelves(user_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor(dictionary=True)
    try:
        query = "SELECT id, name, description, created_at FROM `shelves` WHERE user_id = %s ORDER BY created_at DESC"
        cursor.execute(query, (user_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def update_shelf(shelf_id, user_id, name=None, description=None):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        set_parts = []
        values = []
        if name is not None:
            set_parts.append("name = %s")
            values.append(name)
        if description is not None:
            set_parts.append("description = %s")
            values.append(description)
        if not set_parts:
            return False
        values.append(shelf_id)
        values.append(user_id)
        query = f"UPDATE `shelves` SET { ', '.join(set_parts)} WHERE id = %s AND user_id = %s"
        cursor.execute(query, values)
        cnx.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def delete_shelf(shelf_id, user_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        current_shelves = get_user_shelves(user_id)
        for shelf in current_shelves:
            if shelf['id'] == shelf_id and shelf['name'] == 'Read':
                raise ValueError("Cannot delete the protected 'Read' shelf")
        query = "DELETE FROM `shelves` WHERE id = %s AND user_id = %s"
        cursor.execute(query, (shelf_id, user_id))
        cnx.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        
def remove_book_from_shelf(user_book_id, shelf_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = "DELETE FROM `shelf_books` WHERE user_book_id = %s AND shelf_id = %s"
        cursor.execute(query, (user_book_id, shelf_id))
        cnx.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def remove_book_from_library(lib_id, user_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try: # Deletes from database using the lib_id and user_id
        query = "DELETE FROM `user_books` WHERE lib_id = %s and user_id = %s"
        cursor.execute(query, (lib_id, user_id))
        cnx.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

        
if __name__ == "__main__":
    test_add_book()