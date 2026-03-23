# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, render_template, request, session, redirect, url_for
import random
import sqlite3 as sql
import hashlib
import secrets

app = Flask(__name__)
host = 'http://127.0.0.1:5000/'

app.secret_key = secrets.token_bytes()

def load_db():
    with open("create_db.sql") as f:
        load_db_script = f.read()

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    cursor.executescript(load_db_script)

    connection.commit()
    connection.close()




# ================================
# Homepage
# ================================
@app.route('/')
def index():
    return render_template('index.html')


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

        cursor.execute("SELECT * FROM Users WHERE email = ? AND password = ?;", (email, password))
        results = cursor.fetchall()
        connection.close()

        if len(results) == 0:
            return render_template('login.html', fail = True)

        session['email'] = email
        return redirect(url_for('index'))
        

    return render_template('login.html')

if __name__ == "__main__":
    load_db()
    app.run()