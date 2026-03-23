import pandas as pd
import sqlite3 as sql
import hashlib, os, secrets

#this script is for taking csv files in the same working directory and using them to 
#populate the database (this assumes that create_db.sql has already been run).
#Relations will be populated by csvs with the same name. Making this as a seperate file
#from app.py to prevent issues with commit conflicts

def create_db():
    with open("create_db.sql") as f:
        load_db_script = f.read()

    connection = sql.connect("database.db")
    cursor = connection.cursor()

    cursor.executescript(load_db_script)

    connection.commit()
    connection.close()

csv_file_names = [file for file in os.listdir("./NittanyAuctionDataset_v1") if file.endswith(".csv")]

def get_pw_hash(password):
    hashed_pw = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return hashed_pw

def auto_populate():
    for csv_name in csv_file_names:
        path_to_csv = os.path.join("./NittanyAuctionDataset_v1", csv_name)
        df = pd.read_csv(path_to_csv)
        
        if csv_name == "Users.csv":
            df["password"] = df["password"].apply(get_pw_hash)

        relation_name = csv_name.removesuffix(".csv")
        connection = sql.connect("database.db")
        df.to_sql(relation_name, connection, index=False, if_exists="replace")
        connection.close()

def create_secret():
    secret = secrets.token_hex()
    out = f"SECRET_KEY = {secret}"

    with open('.env', 'w') as f:
        f.write(out)


if __name__ == "__main__":
    create_db()
    auto_populate()
    create_secret()
