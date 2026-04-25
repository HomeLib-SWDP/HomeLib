from utils.sqldb import connect_to_sql, disconnect_from_sql

def get_user_profile(user_id):
    cnx = connect_to_sql()
    cursor = cnx.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT COUNT(*) AS count FROM user_books WHERE user_id = %s",
            (user_id,)
        )
        book_count = cursor.fetchone()["count"]

        cursor.execute(
            "SELECT COUNT(*) AS count FROM shelves WHERE user_id = %s",
            (user_id,)
        )
        shelf_count = cursor.fetchone()["count"]

        return {
            "userName": "User",
            "accountCreationDate": "N/A",
            "location": "Unknown",
            "bookCount": book_count,
            "shelfCount": shelf_count
        }

    finally:
        cursor.close()
        disconnect_from_sql(cnx)