from utils.sqldb import connect_to_sql, disconnect_from_sql   
    
# function to create lprofile
def createProfile(emailValue, accountDate, userName, userId):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    print()

    try:
        query = """
        INSERT INTO `profiles` (emailValue, accountDate, userName, userId) VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (emailValue, accountDate, userName, userId,))
        cnx.commit()
        return cursor.lastrowid
    
    except Exception as e:
        if "Duplicate Entry" in str(e):
            cursor.execute("""
                SELECT loanId from `loans` 
                    WHERE userId = %s AND bookId = %s
            """, (userId,))
            result = cursor.fetchone()
            duplicateId = result[0]
            return duplicateId if result else None
        
        else:
            print(f"Error creating profile: {e}")
            return False

    finally:
        cursor.close()
        disconnect_from_sql(cnx)
        

def editProfile(userId, userDescription, emailValue, accountDate, userName):
    cnx = connect_to_sql()
    cursor = cnx.cursor()

    try:
        query = """
        UPDATE `profiles` SET userDescription = %s WHERE userId = %s
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
    cursor = cnx.cursor(dictionary= True)
    
    try:
        query = """
        SELECT 
        emailValue, DATE_FORMAT(accountDate, '%Y-%m-%d') AS accountDate, userName,  userId
         FROM `profiles` WHERE userId = %s 
        """
        cursor.execute(query, ( userId,))
        result = cursor.fetchall()
        return result if result else None
    
    except Exception as e:
        print(e)
        return None
    
    finally:
        cursor.close()
        disconnect_from_sql(cnx)   


#TESTS    
def test_create_profile():
    userDescription = ""
    accountDate = "2026-05-21"
    userName = ""
    emailValue = ""
    userId= "kqA82Go1gfhhUWOnEIdCkHcglAI3"

    profile_test = createProfile(emailValue, accountDate, userName, userId, userDescription)
    if profile_test:
        print(f"Profile made with ID: {profile_test}")
        return profile_test
    else:
        print("Error creating profile")

def test_edit_desc():
    userDescription = ""
    userId = 7

    edit_test = editProfile(userId, userDescription)

    if edit_test:
        print("Return edit completed")
    
    else:
        print("Error editing return")

def test_display_user():
    userId= "N2nUQFebEjNZLaVDR99wPz0F2pM2"

    load = displayProfile(userId)
    if load:
        print(f"Profile displayed: {load}")
        return load
    else:
        ("Error creating profile")


if __name__ == "__main__":
    #test_create_profile()
    test_display_user()
    # test_edit_desc()
 