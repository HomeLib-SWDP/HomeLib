'''
from utils.sqldb import connect_to_sql, disconnect_from_sql   
from models import books

# loan class to store info
class Loan:

    def __init__(self, borrowerName, borrowedDate= None, returningDate = None, loanId = None,):
        self.borrowedDate = borrowedDate
        self.returningDate = returningDate
        self.borrowerName = borrowerName
        self.loanId = loanId

# function to create loan
def createLoan(borrowedDate, returningDate, user_book_id, borrowerName):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    if borrowedDate > returningDate: #making sure that the borrowed date is not after the returning date
        print("Borrowed date cannot be after returning date")
        return None
    try:
        query = """
            INSERT INTO `loans_test` (borrowerName, borrowedDate, returningDate, user_book_id) VALUES(%s,%s,%s,%s)
        """
        cursor.execute(query, (borrowerName, borrowedDate, returningDate, user_book_id))
        cnx.commit()
        print(f"Loan created for lib ID {user_book_id} and borrower {borrowerName}")

    except Exception as e:
       if "Duplicate entry" in str(e) or "unique_loan" in str(e): #checking if there is a duplicate loan
           cursor.execute(""" 
                SELECT loan_id FROM `loans_test`
                WHERE user_book_id = %s AND returningDate IS NULL
            """, (user_book_id,))
           result = cursor.fetchone()
           if result:
                presentId = result[0]
                print(f"Loan exists, present loan id = {presentId}")
                return presentId
           else:                
               return None
       else:
            print(f"Error: {e}")
            return None 
    finally:
        cursor.close()  
        disconnect_from_sql(cnx)    
    
def test_create_loan():
    borrowedDate = "2026-02-23"
    returningDate = "2026-03-26"
    user_book_id = 5
    borrowerName = "Michael"


    loan_test = createLoan(borrowedDate, returningDate, user_book_id, borrowerName)
    if loan_test:
        print(f"Loan made with ID: {loan_test}")
        return loan_test
    else:
        print("Error creating loan")

if __name__ == "__main__":
    test_create_loan()
   
  '''