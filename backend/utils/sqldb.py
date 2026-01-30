import mysql.connector
import sqldetails

database_config = {
    'host': sqldetails.host(),
    'port':  sqldetails.port(),
    'user': sqldetails.user(),
    'password': sqldetails.password(),
    'database': sqldetails.database()
}

def connect_to_sql():
    cnx = mysql.connector.connect(**database_config)
    return cnx

def disconnect_from_sql(cnx):
    cnx.close()