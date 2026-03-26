# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, Response, send_from_directory, request
from flask_cors import CORS
import sqlite3 as sql
from dotenv import load_dotenv
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

    print(results)

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
# Listings
# ================================


@app.route('/api/listings', methods=['GET'])
def get_listings():
    connection = sql.connect("database.db")
    cursor = connection.cursor()
    cursor.execute('''
        SELECT
            al.listing_id,
            al.auction_title,
            al.product_name,
            al.product_description,
            al.seller_email,
            al.category,
            al.reserve_price,
            MAX(b.bid_price) AS current_bid,
            AVG(r.rating) AS avg_rating
        FROM Auction_Listing al
        LEFT JOIN Bids b ON al.listing_id = b.listing_id
        LEFT JOIN Ratings r ON al.seller_email = r.seller_email
        WHERE al.status = 1
        GROUP BY al.listing_id
        ORDER BY al.listing_id
        LIMIT 6
    ''')
    rows = cursor.fetchall()
    connection.close()
    return json.dumps([{
        "listing_id":          row[0],
        "auction_title":       row[1],
        "product_name":        row[2],
        "product_description": row[3],
        "seller_email":        row[4],
        "category":            row[5],
        "reserve_price":       row[6],
        "current_bid":         row[7],
        "avg_rating":          row[8]
    } for row in rows])


# ================================
# Categories
# ================================
@app.route('/api/categories', methods=['GET'])
def get_categories():
    connection = sql.connect("database.db")
    cursor = connection.cursor()
    cursor.execute('''
        SELECT category_name, parent_category
        FROM Categories
        LIMIT 12
    ''')
    rows = cursor.fetchall()
    connection.close()
    return json.dumps([{
        "category_name":   row[0],
        "parent_category": row[1]
    } for row in rows])


if __name__ == "__main__":
    app.run()
