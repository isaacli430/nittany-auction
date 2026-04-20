# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, Response, send_from_directory, request
import sqlite3 as sql
from dotenv import load_dotenv
from flask_cors import CORS

import hashlib
import os
import json
import secrets

load_dotenv()

app = Flask(__name__, static_folder='client/dist')
app.secret_key = os.getenv('SECRET_KEY')

CORS(app)

# ================================
# Homepage
# ================================


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# ================================
# Login page
# ================================
@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM Users WHERE email = ? AND password = ?;", (email, password,))
    results = cursor.fetchall()

    if len(results) == 0:
        return Response(json.dumps({"error": "wrong credentials"}), status=401, mimetype="application/json")

    cursor.execute("SELECT * FROM Tokens WHERE email = ?;", (email,))
    results = cursor.fetchall()

    if len(results) == 0:

        token = secrets.token_hex()
        cursor.execute("SELECT * FROM Tokens WHERE token = ?;", (token,))
        tokens = cursor.fetchall()

        while len(tokens) != 0:
            token = secrets.token_hex()
            cursor.execute("SELECT * FROM Tokens WHERE token = ?;", (token,))
            tokens = cursor.fetchall()

        cursor.execute(
            "INSERT INTO Tokens (email, token) VALUES (?, ?);", (email, token,))
        connection.commit()

        results = token

    else:
        results = results[0][1]

    connection.close()

    return {"token": results}


# ================================
# Validate
# ================================
@app.route('/api/validate', methods=['GET'])
def validate():
    token = request.headers.get('Authorization')

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM Tokens WHERE token = ?;", (token,))
    results = cursor.fetchall()

    if len(results) == 0:
        return Response(json.dumps({"error": "bad token"}), status=401, mimetype="application/json")

    return {"message": "token correct"}

# ================================
# Register
# ================================


@app.route('/api/register', methods=['POST'])
def register():
    # This route handles new user registration
    # It takes the form data from the frontend, checks for basic problems
    # and then creates the new account in the database
    data = request.json

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    age = data.get('age')
    major = data.get('major')
    street_num = data.get('street_num')
    street_name = data.get('street_name')
    zipcode = data.get('zipcode')

    # Hashing the password first so we never store the plain text version
    password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    # If the email is already in Users then do not let them register again
    cursor.execute("SELECT * FROM Users WHERE email = ?;", (email,))
    if len(cursor.fetchall()) > 0:
        connection.close()
        return Response(
            json.dumps(
                {"error": "An account with this email already exists."}),
            status=409,
            mimetype="application/json"
        )

    # Making sure the zipcode exists first since the address table depends on it
    cursor.execute("SELECT * FROM Zipcode_Info WHERE zipcode = ?;", (zipcode,))
    if len(cursor.fetchall()) == 0:
        connection.close()
        return Response(
            json.dumps(
                {"error": "Zipcode not found. Please enter a valid zipcode."}),
            status=400,
            mimetype="application/json"
        )

    # Creating a unique ID for the address so we can link it to the bidder record
    import uuid
    address_id = str(uuid.uuid4()).replace('-', '')[:32]

    try:
        # Insert the address first, then the user, then the bidder profile
        # New accounts start as bidders by default
        cursor.execute(
            "INSERT INTO Address (address_id, zipcode, street_num, street_name) VALUES (?, ?, ?, ?);",
            (address_id, zipcode, street_num, street_name)
        )

        cursor.execute(
            "INSERT INTO Users (email, password) VALUES (?, ?);",
            (email, password)
        )

        cursor.execute(
            "INSERT INTO Bidders (email, first_name, last_name, age, home_address_id, major) VALUES (?, ?, ?, ?, ?, ?);",
            (email, first_name, last_name, age, address_id, major)
        )

        # Only save once everything works
        connection.commit()

    except Exception as e:
        # If one insert fails then undo everything so the database stays clean
        connection.rollback()
        connection.close()
        return Response(
            json.dumps({"error": "Registration failed. Please try again."}),
            status=500,
            mimetype="application/json"
        )

    connection.close()
    return json.dumps({"message": "Account created successfully."})

# ================================
# Setting page
# ================================
def mask_card(card):
    number = str(card)
    if len(number) >= 4:
        return "****-****-****-" + number[-4:]
    return number

def mask_cvv(cvv):
    return "***"

@app.route('/api/settings',methods = ['GET'])
#Getting all Setting page information
def get_settings():
    token = request.headers.get('Authorization')
    if not token:
        return Response(json.dumps({"error": "No token"}),status = 400)
    connect = sql.connect("database.db")
    cursor = connect.cursor()
    cursor.execute("SELECT email FROM Tokens WHERE = ?", (token,))
    user = cursor.fetchone()
    if not user:
        connect.close()
        return Response(json.dumps({"error": "Invalid session"}),status = 400)

    email = user[0]

    #User information
    cursor.execute("SELECT email FROM Users WHERE email = ?",(email,))
    user_data = cursor.fetchone()

    #Bidder information
    cursor.execute("SELECT first_name, last_name, age, major, home_address_id FROM Bidders WHERE email = ?",(email,))
    bidder = cursor.fetchone()

    #Address
    address = None
    if bidder:
        add_id = bidder[4]
        cursor.execute("SELECT street_num, street_name, zipcode FROM Address WHERE address_id = ?",(addr_id,))
        address = cursor.fetchone()

    #Card
    cursor.execute("SELECT credit_card_num, card_type, expire_month, expire_year, security_code FROM Credit_Cards WHERE Owner_email = ?",(email,))
    cards =cursor.fetchall()

    #Seller information
    cursor.execute("SELECT balance, bank_routing_number, bank_account_number FROM Sellers WHERE email = ?",(email,))
    seller = cursor.fetchone()

    connect.close()

    #Return
    return{
        "email":email,
        "bidder":{
            "first_name": bidder[0] if bidder else None,
            "last_name": bidder[1] if bidder else None,
            "age": bidder[2] if bidder else None,
            "major": bidder[3] if bidder else None,
        },
        "address":{
            "street_num": address[0] if address else None,
            "street_name": address[1] if address else None,
            "zipcode": address[2] if address else None,
        } if address else None,
        "credit_card":[
            {
                "number": mask_card(c[0]),
                "type": c[1],
                "exp_month": c[2],
                "exp_year": c[3],
                "cvv": mask_cvv(c[4]),
                "full_number": c[0]
            } for c in cards
        ],
        "seller":{
            "balance": seller[0] if seller else None,
            "bank_routing": seller[1] if seller else None,
            "bank_account": seller[2] if seller else None,
        } if seller else None
    }


@app.route('/api/add-card', methods=['POST'])
# Add card information
def add_card():
    token = request.headers.get('Authorization')
    data = request.json

    connect = sql.connect("database.db")
    cursor = connect.cursor()
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()
    if not user:
        return Response(json.dumps({"error": "Unauthorized"}), 400)
    email = user[0]

    try:
        cursor.execute(
            "INSERT INTO Credit_Cards (credit_card_num, card_type, expire_month, expire_year, security_code, Owner_email)VALUES(?,?,?,?,?,?)",
            (
                data['number'],
                data['type'],
                data['exp_month'],
                data['exp_year'],
                data['cvv'],
                email
            ))
        connect.commit()
        connect.clone()
        return {"message": "Card added successfully"}
    except:
        connect.close()
        return Response(json.dumps({"error": "Failed"}), 500)


@app.route('/api/remove-card', methods=['POST'])
# Remove card information
def remove_card():
    token = request.headers.get('Authorization')
    data = request.json

    connect = sql.connect("database.db")
    cursor = connect.cursor()
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()
    if not user:
        return Response(json.dumps({"error": "Unauthorized"}), 400)
    email = user[0]

    cursor.execute(
        "DELETE FROM Credit_Cards WHERE Owner_email = ? AND credit_card_num = ?", (email, data['number']))
    connect.commit()
    connect.clone()
    return {"message": "Card removed successfully"}


@app.route('/api/request-password-change', methods=['POST'])
# Seller request password change
def request_password_change():
    token = request.headers.get('Authorization')
    connect = sql.connect("database.db")
    cursor = connect.cursor()
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()
    if not user:
        return Response(json.dumps({"error": "Unauthorized"}), 400)
    email = user[0]

    try:
        cursor.execute("INSERT INTO Requests(user_email, request_type, status) VALUES(?,'Password Change','Pending')",
                       (email,))
        connect.commit()
        connect.close()
        return {"message": "Request sent to helpdesk"}
    except:
        connect.close()
        return Response(json.dumps({"error": "Failed"}), 500)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port="5000")
