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


if __name__ == "__main__":
    app.run(host="127.0.0.1", port="5000")
