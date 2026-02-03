import mysql.connector
import backend.sqldetails as sqldetails

cert_path = 'certs/ca.pem'

database_config = {
    'host': sqldetails.host,
    'user': sqldetails.user,
    'port':  sqldetails.port,
    'user': sqldetails.user,
    'password': sqldetails.password,
    'database': sqldetails.database,
    'ssl_ca': cert_path,
    'ssl_verify_cert': True
}

def connect_to_sql():
    cnx = mysql.connector.connect(**database_config)
    return cnx

def disconnect_from_sql(cnx):
    cnx.close()
