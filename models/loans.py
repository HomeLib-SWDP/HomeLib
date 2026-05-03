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
        return idResult[0] if idResult else None # return the id
    
    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)

def loanSearch(bookId, userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        SELECT loanId FROM `loans` WHERE bookId = %s AND userId = %s
        """
        cursor.execute(query, (bookId, userId,)) 
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

    bookId = bookSearch (bookName, userId) #look for loan in user library using userid and name of the book
    #print(bookId)

    existingLoan = loanSearch(bookId, userId)
    print(existingLoan)

    if existingLoan is not None or bookId is None:
        return None

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
            print(f"Error creating loan: {e}")
            return False

    finally:
        cursor.close()
        disconnect_from_sql(cnx)

# function to change loan status
def expireLoansBatch(): # a batch process mimic to expire loans if returning date is past today's date
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


def modifyLoansBatch(): # a batch process mimic to expire loans if returning date is past today's date
    cnx = connect_to_sql()
    cursor = cnx.cursor()
    try:
        query = """
        UPDATE `loans` SET expired = 0 WHERE (CURDATE() < returningDate)
        """
        cursor.execute(query)
        cnx.commit()

    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        
# allowing user to edit loan
def editReturn(returningDate, userId, loanId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        UPDATE `loans` SET returningDate = %s WHERE userId = %s AND loanId = %s
        """
        cursor.execute(query, (returningDate, userId, loanId))  #update the return date from new edit
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

    expireLoansBatch() #setting expired status before displaying
    modifyLoansBatch()

    try: # fetching all relevant data for the userId. Switching date format from datetime so it can conveniently be converted to json
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
    bookName = "The Safekeep"
    borrowerName = "John"
    userId= "3sGMNArtUVQnWjQHft4r6hY8FcV2"

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
    print("Testing loan functions...")
    test_create_loan()
    #expireLoansBatch()
    # test_return_loan()
    test_display_loan()