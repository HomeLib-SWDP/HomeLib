from utils.sqldb import connect_to_sql, disconnect_from_sql

class Book:
    def __init__(self, booktitle, author, isbn = None, cover_id = None, publishdate = None, user_id = None, cover_edition_key = None, ratings_average = None, genre = None, num_pages = None):
        self.user_id = user_id
        self.cover_id = cover_id
        self.publishdate = publishdate
        self.booktitle = booktitle
        self.author = author
        self.isbn = isbn
        self.cover_edition_key = cover_edition_key
        self.ratings_average = ratings_average
        self.genre = genre
        self.num_pages = num_pages

    def to_dict(self):
        return {
            "booktitle": self.booktitle,
            "isbn": self.isbn,
            "publishdate": self.publishdate,
            "cover_id": self.cover_id,
            "author": self.author,
            "user_id": self.user_id,
            "cover_edition_key": "",
            "ratings_average": self.ratings_average,
            "genre": self.genre,
            "num_pages": self.num_pages

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
            INSERT INTO `user_books` (user_id, booktitle, isbn, author, publishdate, cover_id, genre, num_pages)
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (book.user_id, book.booktitle, book.isbn, book.author, book.publishdate, book.cover_id, book.genre, book.num_pages)
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
                SELECT b.user_id, b.booktitle, b.isbn, b.author, b.publishdate, b.cover_id 
                FROM user_books b
                JOIN shelf_books sb ON b.lib_id = sb.user_book_id
                WHERE b.user_id = %s AND sb.shelf_id = %s
            """
            cursor.execute(query, (user_id, shelf_id))
        else:
            query = "SELECT user_id, booktitle, isbn, author, publishdate, cover_id FROM user_books WHERE user_id = %s"
            cursor.execute(query, (user_id,))
        rows=cursor.fetchall()
        return [{
            'title' : row['booktitle'],
            'author' : row['author'],
            'cover_i' : row['cover_id'],
            'isbn' : row['isbn'],
            'publishdate': str(row['publishdate'])
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

def add_book_to_shelf(user_book_id, shelf_id, date_added):
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = "INSERT INTO `shelf_books` (user_book_id, shelf_id, date_added) VALUES (%s, %s, %s)"
        cursor.execute(query, (user_book_id, shelf_id, date_added))
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


def get_user_stats(user_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN YEAR(sb.added_at) = YEAR(CURDATE()) THEN 1 END) as year,
                COUNT(CASE WHEN MONTH(sb.added_at) = MONTH(CURDATE()) AND YEAR(sb.added_at) = YEAR(CURDATE()) THEN 1 END) as month
            FROM user_books AS ub
            JOIN shelf_books AS sb ON ub.lib_id = sb.user_book_id
            JOIN shelves AS s ON sb.shelf_id = s.id
            WHERE ub.user_id = %s AND s.name = 'Read'
        """, (user_id,))
        read_counts = cursor.fetchone()

        cursor.execute("""
            SELECT author, COUNT(*) as count FROM user_books 
            WHERE user_id = %s GROUP BY author ORDER BY count DESC LIMIT 1
        """, (user_id,))
        top_author = cursor.fetchone()

        cursor.execute("""
            SELECT genre, COUNT(*) as count FROM user_books 
            WHERE user_id = %s GROUP BY genre ORDER BY count DESC LIMIT 1
        """, (user_id,))
        top_genre = cursor.fetchone()

    
        cursor.execute("""
            SELECT 
                booktitle, num_pages,
                (SELECT SUM(IFNULL(num_pages, 0)) FROM user_books WHERE user_id = %s) as total_pages
            FROM user_books 
            WHERE user_id = %s AND num_pages IS NOT NULL
            ORDER BY num_pages DESC LIMIT 1
        """, (user_id, user_id))
        page_stats = cursor.fetchone()

        return {
            "read_shelf_counts": read_counts if read_counts else {"total": 0, "year": 0, "month": 0},
            "top_author": top_author['author'] if top_author else "None",
            "top_genre": top_genre['genre'] if top_genre else "None",
            "longest_book": page_stats['booktitle'] if page_stats else "None",
            "total_pages": int(page_stats['total_pages']) if page_stats and page_stats['total_pages'] else 0
        }
    except Exception as e:
        print(f"SQL Error in get_user_stats: {e}")
        return None
    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        disconnect_from_sql(cnx)
if __name__ == "__main__":
    test_add_book()
