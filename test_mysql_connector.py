import mysql.connector

print("mysql.connector attributes:")
print(dir(mysql.connector))

try:
    # Try to call connect (should not error if environment is correct)
    print("Trying mysql.connector.connect...")
    conn = mysql.connector.connect()
    print("Connect attribute exists.")
except Exception as e:
    print(f"Error: {e}")
