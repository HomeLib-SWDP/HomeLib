from utils.sqldb import connect_to_sql, disconnect_from_sql   

def bookSearch(bookName, userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        SELECT lib_id FROM `user_books` WHERE booktitle = %s AND user_id = %s 
        """
        cursor.execute(query, (bookName, userId,)) 
        idResult = cursor.fetchone()
        return idResult[0] if idResult else None
    
    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)
    
# function to create loan
def createLoan(borrowedDate, returningDate, borrowerName, bookName, userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    bookId = bookSearch (bookName, userId)

    if(borrowedDate > returningDate):
        return False

    try:
        query = """
        INSERT INTO `loans` (bookId, userId, borrowedDate, returningDate,borrowerName, bookName) VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (bookId, userId, borrowedDate, returningDate,borrowerName, bookName,))
        cnx.commit()
        return cursor.lastrowid
    
    except Exception as e:
        if "Duplicate Entry" in str(e):
            cursor.execute("""
                SELECT loanId from `loans` 
                    WHERE userId = %s AND bookId = %s
            """, (userId, bookId,))
            result = cursor.fetchone()
            duplicateId = result[0]
            return duplicateId if result else None
        
        else:
            print(f"Error creating loan: {e}")
            return False

    finally:
        cursor.close()
        disconnect_from_sql(cnx)


def expireLoansBatch():
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = """
        UPDATE `loans` SET expired = 1 WHERE (CURDATE() > returningDate)
        """
        cursor.execute(query)
        cnx.commit()

    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        

def editReturn(returningDate, loanId, borrowedDate):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    if(borrowedDate > returningDate):
        return False

    try:
        query = """
        UPDATE `loans` SET returningDate = %s WHERE loanId = %s
        """
        cursor.execute(query, (returningDate, loanId,)) 
        cnx.commit()
        return True
    
    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)     


def displayLoans(userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor(dictionary= True)

    expireLoansBatch()

    try:
        query = """
        SELECT 
         loanId, DATE_FORMAT(borrowedDate, '%Y-%m-%d') AS borrowedDate, DATE_FORMAT(returningDate, '%Y-%m-%d') AS returningDate, borrowerName, bookName, expired
         FROM `loans` WHERE userId = %s 
        """
        cursor.execute(query, ( userId,))
        result = cursor.fetchall()
        #print(result)
        return result if result else None
    
    except Exception as e:
        print(e)
        return None
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)   


#TESTS    
def test_create_loan():
    borrowedDate = "2026-02-19"
    returningDate = "2026-05-21"
    bookName = "Fourth Wing"
    borrowerName = "John"
    userId= "kqA82Go1gfhhUWOnEIdCkHcglAI3"

    loan_test = createLoan(borrowedDate, returningDate, borrowerName, bookName, userId)
    if loan_test:
        print(f"Loan made with ID: {loan_test}")
        return loan_test
    else:
        print("Error creating loan")

def test_return_loan():
    returningDate = "2026-03-22"
    loanId = 7

    return_test = editReturn(returningDate, loanId)

    if return_test:
        print("Return edit completed")
    
    else:
        print("Error editing return")

def test_display_loan():
    userId= "kqA82Go1gfhhUWOnEIdCkHcglAI3"

    load = displayLoans(userId)
    if load:
        print(f"Loans displayed: {load}")
        return load
    else:
        ("Error creating loan")


if __name__ == "__main__":
    #test_create_loan()
    #expireLoansBatch()
    # test_return_loan()
    test_display_loan()