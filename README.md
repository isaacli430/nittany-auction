# Mini-summary of our work (for prog check)

## How to Execute Our Project

1. If this is your first time executing our project:
   a. Run `pip install -r requirements.txt`
   b. Run `python setup.py`
2. Run `flask run` or `python -m flask run`

## Python Library Requirements

- flask
- python-dotenv
- pandas

## Project Features

### Basic Setup

The `requirements.txt` file contains all the Python libraries required to run our project, and must be used to install the required libraries first to run our project.

Alongside that, the `setup.py` file creates the `SECRET_KEY` environment variable that will be used by Flask's session manager, and must also be run in order to set up the project.

### Database Creation and Population

The `setup.py` file also handles the creation and population of the database.

To create the database, `setup.py` connects to `database.db` and executes `create_db.sql`, which contains the `CREATE TABLE` codes for all the relations, and creates the relations if they do not already exist.

To populate the database, `setup.py` reads each `.csv` file in `NittanyAuctionDataset_v1`, which contains all the datasets organized into relations and their respective columns. Each relation is then converted into a `pandas` DataFrame, and then uses `panda`'s `.to_sql()` function to export each relation into `database.db`. The only exception is the `Users` relation, where the `password` field is run through a SHA256 function before exporting.

### User Login

The webpage is constructed through `Flask` and several `.html` pages. Currently, the index contains two links, which change depending on the user's login status: `Homepage` and `Logout` for logged-in users, and `Homepage` and `Login` for not logged-in users (these links stay constant across all pages until login status is changed).

The homepage shows user login status (either `Logged in as: <email>` or `Not logged in`), along with the user's role(s) (i.e. `seller`, `bidder`, or `helpdesk`) if they are logged in.

The login page has fields for inputting `email` (not hidden) and `password` (hidden), as well as a submit button. Upon pressing the submit button in the login page, one of two things will happen. If the incorrect credentials are given or empty fields are present, then a `Failed!` message is displayed to the user and the user remains on the login page. Otherwise, the user gets taken back to the updated homepage containing the user info mentioned above.

The logout page redirects the user upon accessing. If the user is logged in, then the user is logged out and redirected back to an updated homepage. Otherwise, the user is redirected to the login page.

## Code Directory

└── nittany-auction
├── NittanyAuctionDataset_v1
│   ├── Address.csv
│   ├── Auction_Listing.csv
│   ├── Bidders.csv
│   ├── Bids.csv
│   ├── Categories.csv
│   ├── Credit_Cards.csv
│   ├── Helpdesk.csv
│   ├── Local_Vendors.csv
│   ├── Ratings.csv
│   ├── Requests.csv
│   ├── Sellers.csv
│   ├── Transactions.csv
│   ├── Users.csv
│   └── Zipcode_Info.csv
├── templates
│   ├── base.html
│   ├── index.html
│   └── login.html
├── .gitignore
├── app.py
├── create_db.sql
├── README.md
├── requirements.txt
└── setup.py
