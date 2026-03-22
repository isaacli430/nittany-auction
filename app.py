# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, render_template, request
import random
import sqlite3 as sql

app = Flask(__name__)

host = 'http://127.0.0.1:5000/'

def load_db():
    sql.connect("database.db")
    connection.cursor()

    # ================================
    # User Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Users(
    email TEXT,
    password TEXT NOT NULL,

    PRIMARY KEY (email));
    """)


    # ================================
    # Location Info
    # ================================
    cursor.excute("""
    CREATE TABLE IF NOT EXISTS Zipcode_Info (
    zipcode INTEGER,
    city TEXT NOT NULL,
    state TEXT NOT NULL,

    PRIMARY KEY (zipcode));
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Address (
    address_id TEXT,
    zipcode INTEGER NOT NULL,
    street_num INTEGER NOT NULL,
    street_name TEXT NOT NULL,

    PRIMARY KEY (address_id),
    FOREIGN KEY (zipcode) REFERENCES Zipcode_Info);
    """)


    # ================================
    # Bidder Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Bidders (
    email TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    home_address_id TEXT NOT NULL,
    major TEXT NOT NULL,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE,
    FOREIGN KEY (home_address_id) REFERENCES Address(address_id));
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Credit_Cards (
    credit_card_num TEXT NOT NULL,
    card_type TEXT NOT NULL,
    expire_month INTEGER NOT NULL,
    expire_year INTEGER NOT NULL,
    security_code INTEGER NOT NULL,
    owner_email TEXT NOT NULL,

    PRIMARY KEY (credit_card_num, owner_email),
    FOREIGN KEY (owner_email) REFERENCES Bidders(email) ON DELETE CASCADE);
    """)

    # ================================
    # Seller Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Sellers (
    email TEXT,
    bank_routing_number TEXT NOT NULL,
    bank_account_number INTEGER NOT NULL,
    balance REAL NOT NULL,

    PRIMARY KEY (email)
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Local_Vendors (
    email TEXT,
    business_name TEXT NOT NULL,
    business_address_id TEXT NOT NULL,
    customer_service_phone_number TEXT NOT NULL,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Sellers ON DELETE CASCADE,
    FOREIGN KEY (business_address_id) REFERENCES Address(address_id));
    """)


    # ================================
    # Helpdesk Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Helpdesk (
    email TEXT,
    position TEXT NOT NULL,
    
    PRIMARY KEY (email)
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE);
    """)


    # ================================
    # Category Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Categories (
    parent_category TEXT NOT NULL,
    category_name TEXT,

    PRIMARY KEY (category_name));
    """)


    # ================================
    # Auction Info
    # ================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Auction_Listing (
    seller_email TEXT,
    listing_id INTEGER,
    category TEXT,
    auction_title TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_description TEXT,
    quantity INTEGER NOT NULL,
    reserve_price REAL NOT NULL,
    max_bids INTEGER NOT NULL,
    status INTEGER NOT NULL,

    PRIMARY KEY (listing_id),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE SET NULL,
    FOREIGN KEY (category) REFERENCES Categories(category_name) ON DELETE SET NULL);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Bids (
    bid_id INTEGER,
    seller_email TEXT NOT NULL,
    listing_id INTEGER NOT NULL,
    bidder_email TEXT NOT NULL,
    bid_price REAL NOT NULL,

    PRIMARY KEY (bid_id),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES Ausction_Listing ON DELETE CASCADE,
    FOREIGN KEY (bidder_email) REFERENCES Bidders(email) ON DELETE CASCADE);
    """)





# ================================
# Homepage
# ================================
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()