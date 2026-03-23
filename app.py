# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, render_template, request, session, redirect, url_for
import sqlite3 as sql
from dotenv import load_dotenv
import hashlib, os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')


# ================================
# Homepage
# ================================
@app.route('/')
def index():
    if 'email' in session:
        return render_template('index.html', email = session['email'], roles = ', '.join(session['roles']))

    return render_template('index.html')


# ================================
# Login page
# ================================
@app.route('/login', methods = ['GET', 'POST'])
def login():
    if 'email' in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        connection = sql.connect("database.db")
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM Users WHERE email = ? AND password = ?;", (email, password,))
        results = cursor.fetchall()

        if len(results) == 0:
            return render_template('login.html', fail = True)


        session['email'] = email
        session['roles'] = []

        cursor.execute("SELECT * FROM Bidders WHERE email = ?;", (email,))
        results = cursor.fetchall()

        if len(results) > 0:
            session['roles'].append('bidder')

        cursor.execute("SELECT * FROM Sellers WHERE email = ?;", (email,))
        results = cursor.fetchall()

        if len(results) > 0:
            session['roles'].append('seller')

        cursor.execute("SELECT * FROM Helpdesk WHERE email = ?;", (email,))
        results = cursor.fetchall()

        if len(results) > 0:
            session['roles'].append('helpdesk')


        connection.close()
        return redirect(url_for('index'))

    return render_template('login.html')


# ================================
# Logout page
# ================================
@app.route('/logout')
def logout():
    if 'email' not in session:
        return redirect(url_for('login'))

    session.pop('email', None)
    session['roles'] = []
    return redirect(url_for('login'))
