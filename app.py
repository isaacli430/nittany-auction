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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Users(
    email TEXT,
    password TEXT,
    PRIMARY KEY (email));
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Sellers(
    email TEXT,
    bank_routing_number TEXT,
    bank_account_number INTEGER,
    balance REAL,
    PRIMARY KEY (email)
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE);
    """)

    cursor.excute("""
    CREATE TABLE IF NOT EXISTS Zipcode_Info (
    zipcode INTEGER,
    city TEXT,
    state TEXT,
    PRIMARY KEY (zipcode));
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Address (
    address_id INTEGER,
    zipcode INTEGER,
    street_num INTEGER,
    street_name TEXT,
    PRIMARY KEY (address_id)
    FOREIGN KEY (zipcode) REFERENCES Zipcode_Info);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Auction_Listing (
    seller_email TEXT,
    listing_id INTEGER,
    category TEXT,
    auction_title TEXT,
    product_name TEXT,
    product_description TEXT,
    quantity INTEGER,
    reserve_price REAL,
    max_bids INTEGER,
    status INTEGER,
    PRIMARY KEY (listing_id),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE SET NULL);
    """)



# ================================
# Homepage
# ================================
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()