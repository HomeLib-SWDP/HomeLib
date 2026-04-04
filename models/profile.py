from utils.sqldb import connect_to_sql, disconnect_from_sql   
from models import books

class Profile:

    def __init__(self, userId= None, userName = None, accountDate = None, userDescription = None, profileId = None):
        self.userId = userId
        self.userName = userName
        self.accountDate = accountDate
        self.userDescription = userDescription
        self.profileId = profileId


def createProfile(userId, userName, accountDate, userDescription):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        INSERT INTO `profile` (userId, userName, accountDate, userDescription, profileId ) VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (userId, userName, accountDate, userDescription, ))
        cnx.commit()
        return cursor.lastrowid
    
    except Exception as e:
        if "Duplicate entry" in str(e):
            cursor.execute("""
                SELECT profileId from `profile`
                WHERE  userId = %s     
                """, (userId))
            result = cursor.fetchone()
            id = result[0]
            return id if result else None
        else:
            print(f"Error creating user: {e}")
            return None

    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        
def editDescription(userDescription, userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        UPDATE `loans` SET userDescription = %s WHERE userId = %s
        """
        cursor.execute(query, (userDescription, userId,)) 
        cnx.commit()
        return True
    
    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)     


def displayProfile(userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        SELECT * FROM `profile` WHERE userId = %s 
        """
        cursor.execute(query, ( userId,))
        result = cursor.fetchall()
        #print(result)
        return result if result else None
    
    except Exception as e:
        print(e)
        return False
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)   


#TESTS 

def test_create_profile():
    userId= "dsds"
    userName= "ami"
    accountDate= ""
    userDescription = ""
    test = createProfile(userId, userName, accountDate, userDescription)

    if test:
        print(f"Profile created with id: {test}")
    else:
        print("Error creating attribute")
  

if __name__ == "__main__":
    test_create_profile()