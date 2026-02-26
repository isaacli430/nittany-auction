# ================================
# Imports and Flask Setup
# ================================
from flask import Flask, render_template, request
import random
import sqlite3 as sql

app = Flask(__name__)

host = 'http://127.0.0.1:5000/'


# ================================
# Homepage
# ================================
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()