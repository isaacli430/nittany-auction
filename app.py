# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, Response, send_from_directory, request
import sqlite3 as sql
from dotenv import load_dotenv
from flask_cors import CORS

import hashlib, os, json, secrets

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

    cursor.execute("SELECT * FROM Users WHERE email = ? AND password = ?;", (email, password,))
    results = cursor.fetchall()

    if len(results) == 0:
        return Response(json.dumps({"error": "wrong credentials"}), status = 401, mimetype = "application/json")

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

        cursor.execute("INSERT INTO Tokens (email, token) VALUES (?, ?);", (email, token,))
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
        return Response(json.dumps({"error": "bad token"}), status = 401, mimetype = "application/json")

    return {"message": "token correct"}

if __name__ == "__main__":
    app.run()
