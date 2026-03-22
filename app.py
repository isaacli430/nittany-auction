# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, render_template, request
import random
import sqlite3 as sql

app = Flask(__name__)

host = 'http://127.0.0.1:5000/'

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

if __name__ == "__main__":
    load_db()
    app.run()