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

def mask_security_code(security_code):
    return "***"

@app.route('/api/settings',methods = ['GET'])
#Getting all Setting page information
def get_settings():
    token = request.headers.get('Authorization')
    if not token:
        return Response(json.dumps({"error": "No token"}),status = 401)
    connect = sql.connect("database.db")
    cursor = connect.cursor()
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()
    if not user:
        connect.close()
        return Response(json.dumps({"error": "Invalid session"}),status = 401)

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
        addr_id = bidder[4]
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
        "credit_cards":[
            {
                "number": mask_card(c[0]),
                "type": c[1],
                "exp_month": c[2],
                "exp_year": c[3],
                "security_code": mask_security_code(c[4]),
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
        return Response(json.dumps({"error": "Unauthorized"}), 401)
    email = user[0]

    try:
        cursor.execute(
            "INSERT INTO Credit_Cards (credit_card_num, card_type, expire_month, expire_year, security_code, Owner_email)VALUES(?,?,?,?,?,?)",
            (
                data['number'],
                data['type'],
                data['exp_month'],
                data['exp_year'],
                data['security_code'],
                email
            ))
        connect.commit()
        connect.close()
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
        return Response(json.dumps({"error": "Unauthorized"}), 401)
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
        return Response(json.dumps({"error": "Unauthorized"}), 401)
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

# ================================
# category routes
# ================================


@app.route('/api/categories', methods=['GET'])
def get_categories():
    # This route sends all categories to the frontend
    # It is mainly used for things like dropdowns and category browsing
    connection = sql.connect("database.db")
    cursor = connection.cursor()

    cursor.execute("SELECT category_name, parent_category FROM Categories")
    rows = cursor.fetchall()
    connection.close()

    return json.dumps([{
        "category_name": row[0],
        "parent_category": row[1]
    } for row in rows])


# ================================
# seller check route
# ================================
@app.route('/api/is-seller', methods=['GET'])
def is_seller():
    # This route checks whether the logged-in user is a seller or not
    # The frontend uses it before opening pages that should only be available to sellers
    token = request.headers.get('Authorization')

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    # Use the token to figure out which user is making the request
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()

    # If the token does not match anything then the user is not authorized
    if not user:
        connection.close()
        return Response(json.dumps({"error": "Unauthorized"}), status=401, mimetype="application/json")

    email = user[0]

    # Now checking whether that email exists in the Sellers table
    cursor.execute("SELECT email FROM Sellers WHERE email = ?", (email,))
    seller = cursor.fetchone()
    connection.close()

    # Send back true if they are a seller otherwise false
    return json.dumps({"is_seller": seller is not None})


# ================================
# create listing route
# ================================
@app.route('/api/create-listing', methods=['POST'])
def create_listing():
    # This route creates a new auction listing for a seller
    # The listing starts as pending, and HelpDesk has to approve it before it can go live
    token = request.headers.get('Authorization')
    data = request.json

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    # First figure out which user is making the request by using the token
    cursor.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cursor.fetchone()

    # If the token is invalid, stop right away
    if not user:
        connection.close()
        return Response(json.dumps({"error": "Unauthorized"}), status=401, mimetype="application/json")

    email = user[0]

    # Make sure the logged-in user is actually a seller
    cursor.execute("SELECT email FROM Sellers WHERE email = ?", (email,))
    if not cursor.fetchone():
        connection.close()
        return Response(json.dumps({"error": "You are not a seller."}), status=403, mimetype="application/json")

    # Listing IDs are unique per seller, so we grab the current max and add 1
    cursor.execute(
        "SELECT MAX(listing_id) FROM Auction_Listing WHERE seller_email = ?", (email,))
    max_id = cursor.fetchone()[0]
    listing_id = 1 if max_id is None else max_id + 1

    try:
        # Add the new listing to the auction table
        # Status 0 means the listing is still waiting for approval
        cursor.execute("""
            INSERT INTO Auction_Listing 
            (seller_email, listing_id, category, auction_title, product_name, 
             product_description, quantity, reserve_price, max_bids, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            email,
            listing_id,
            data.get('category'),
            data.get('auction_title'),
            data.get('product_name'),
            data.get('product_description'),
            data.get('quantity'),
            data.get('reserve_price'),
            data.get('max_bids')
        ))

        # Also create a HelpDesk request automatically
        # so someone can review and approve the listing
        cursor.execute("SELECT MAX(request_id) FROM Requests")
        max_req = cursor.fetchone()[0]
        request_id = 1 if max_req is None else max_req + 1

        cursor.execute("""
            INSERT INTO Requests 
            (request_id, sender_email, helpdesk_staff_email, request_type, request_desc, request_status)
            VALUES (?, ?, 'helpdeskteam@lsu.edu', 'ApproveListing', ?, 0)
        """, (
            request_id,
            email,
            f"Approval request for listing: {data.get('auction_title')}"
        ))

        # Save both inserts only if everything above works
        connection.commit()

    except Exception:
        # If something breaks in the middle then undo everything
        # so the database does not end up with half finished data
        connection.rollback()
        connection.close()
        return Response(
            json.dumps(
                {"error": "Failed to create listing. Please try again."}),
            status=500,
            mimetype="application/json"
        )

    connection.close()

    # If everything worked then return a success message and the new listing ID
    return json.dumps({"message": "Listing submitted for approval.", "listing_id": listing_id})

# ================================
# Get one listing
# ================================


@app.route('/api/listing/<seller_email>/<int:listing_id>', methods=['GET'])
def get_listing(seller_email, listing_id):
    # This route returns all the details for one specific listing
    # We need both the seller email and listing ID because listing IDs are only unique under each seller
    token = request.headers.get('Authorization')

    conn = sql.connect("database.db")
    cur = conn.cursor()

    # Look up the listing in the auction table using the seller + listing ID combo
    cur.execute("""
        SELECT listing_id, seller_email, category, auction_title,
               product_name, product_description, quantity,
               reserve_price, max_bids, status
        FROM Auction_Listing
        WHERE seller_email = ? AND listing_id = ?
    """, (seller_email, listing_id))
    row = cur.fetchone()

    # If nothing matches then return 404 so the frontend knows the listing does not exist
    if not row:
        conn.close()
        return Response(
            json.dumps({"error": "Listing not found"}),
            status=404,
            mimetype="application/json"
        )

    conn.close()

    # Send the listing data back in JSON format.
    return json.dumps({
        "listing_id":          row[0],
        "seller_email":        row[1],
        "category":            row[2],
        "auction_title":       row[3],
        "product_name":        row[4],
        "product_description": row[5],
        "quantity":            row[6],
        "reserve_price":       row[7],
        "max_bids":            row[8],
        "status":              row[9]
    })


# ================================
# Get bids for one listing
# ================================
@app.route('/api/listing/<seller_email>/<int:listing_id>/bids', methods=['GET'])
def get_listing_bids(seller_email, listing_id):
    # This route gets all bids for one listing
    # It also checks whether the current logged in user has already placed a bid on it
    token = request.headers.get('Authorization')

    conn = sql.connect("database.db")
    cur = conn.cursor()

    # This keeps track of who is making the request
    # If the token is missing or invalid then user_email just stays none
    user_email = None
    if token:
        # Use the token to figure out which user is currently logged in
        cur.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
        user = cur.fetchone()
        if user:
            user_email = user[0]

    # Get all bids for this listing from highest to lowest
    # That way the frontend can show the top bid right away
    cur.execute("""
        SELECT bid_id, bidder_email, bid_price
        FROM Bids
        WHERE seller_email = ? AND listing_id = ?
        ORDER BY bid_price DESC
    """, (seller_email, listing_id))
    rows = cur.fetchall()

    # Check if the current logged in user already appears in the bid list
    has_bid = False
    if user_email:
        has_bid = any(r[1] == user_email for r in rows)

    conn.close()

    # Send back the bid list, the current user email,
    # and whether that user has already bid on this listing
    return json.dumps({
        "bids": [{"bid_id": r[0], "bidder_email": r[1], "bid_price": r[2]} for r in rows],
        "user_email": user_email,
        "has_bid": has_bid
    })

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
# Place a bid
# ================================


@app.route('/api/bid', methods=['POST'])
def place_bid():
    # This route lets a logged in user place a bid on a listing
    # Before saving anything it checks all the basic auction rules
    # so bad bids do not get into the database
    token = request.headers.get('Authorization')
    data = request.json

    seller_email = data.get('seller_email')
    listing_id = data.get('listing_id')
    bid_price = float(data.get('bid_price'))

    conn = sql.connect("database.db")
    cur = conn.cursor()

    # Use the token to figure out which user is trying to place the bid
    cur.execute("SELECT email FROM Tokens WHERE token = ?", (token,))
    user = cur.fetchone()

    # If the token is invalid then the user is not allowed to bid
    if not user:
        conn.close()
        return Response(
            json.dumps({"error": "Unauthorized"}),
            status=401,
            mimetype="application/json"
        )

    bidder_email = user[0]

    # Getting the listing info so we can check if it exists
    # and whether it is still open for bidding
    cur.execute("""
        SELECT listing_id, status, max_bids
        FROM Auction_Listing
        WHERE seller_email = ? AND listing_id = ?
    """, (seller_email, listing_id))
    listing = cur.fetchone()

    # If the listing does not exist then stop here
    if not listing:
        conn.close()
        return Response(
            json.dumps({"error": "Listing not found."}),
            status=404,
            mimetype="application/json"
        )

    # Status 1 means the auction is still active
    # Any other status means bidding should not be allowed anymore
    if listing[1] != 1:
        conn.close()
        return Response(
            json.dumps({"error": "This auction is no longer active."}),
            status=400,
            mimetype="application/json"
        )

    # Do not let sellers bid on their own listings
    if bidder_email == seller_email:
        conn.close()
        return Response(
            json.dumps({"error": "You cannot bid on your own listing."}),
            status=400,
            mimetype="application/json"
        )

    # Count how many bids are already on this listing
    # If the listing already reached its bid limit then it should be treated as finished
    cur.execute(
        "SELECT COUNT(*) FROM Bids WHERE seller_email = ? AND listing_id = ?",
        (seller_email, listing_id)
    )
    bid_count = cur.fetchone()[0]

    if bid_count >= listing[2]:
        conn.close()
        return Response(
            json.dumps({"error": "This auction has already ended."}),
            status=400,
            mimetype="application/json"
        )

    # Find the current highest bid so the new bid has to beat it
    cur.execute("""
        SELECT MAX(bid_price) FROM Bids
        WHERE seller_email = ? AND listing_id = ?
    """, (seller_email, listing_id))
    max_bid = cur.fetchone()[0]
    current_highest = float(max_bid) if max_bid else 0

    # Reject the bid if it is not higher than the current top bid
    if bid_price <= current_highest:
        conn.close()
        return Response(
            json.dumps(
                {"error": f"Bid must be higher than ${current_highest:.2f}"}),
            status=400,
            mimetype="application/json"
        )

    # Make the next bid ID by taking the current highest one and adding 1
    cur.execute("SELECT MAX(bid_id) FROM Bids")
    max_bid_id = cur.fetchone()[0]
    bid_id = 1 if max_bid_id is None else max_bid_id + 1

    try:
        # Insert the new bid into the bids table
        cur.execute("""
            INSERT INTO Bids (bid_id, seller_email, listing_id, bidder_email, bid_price)
            VALUES (?, ?, ?, ?, ?)
        """, (bid_id, seller_email, listing_id, bidder_email, bid_price))

        # If this bid fills up the max number of allowed bids
        # then update the listing status so it is marked as finished
        if bid_count + 1 >= listing[2]:
            cur.execute("""
                UPDATE Auction_Listing SET status = 2
                WHERE seller_email = ? AND listing_id = ?
            """, (seller_email, listing_id))

        # Save everything if all database steps worked
        conn.commit()

    except Exception:
        # If anything fails then undo the changes from this request
        # so the database does not end up in a half saved state
        conn.rollback()
        conn.close()
        return Response(
            json.dumps({"error": "Failed to place bid. Please try again."}),
            status=500,
            mimetype="application/json"
        )

    conn.close()

    # If everything worked then send back a success message and the new bid ID
    return json.dumps({
        "message": "Bid placed successfully.",
        "bid_id": bid_id
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port="5000")
