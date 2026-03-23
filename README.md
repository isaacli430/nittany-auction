# Mini-summary of our work (for prog check)

## How to Execute Our Project

1. If this is your first time executing our project:
   a. Run `pip install -r requirements.txt`
   b. Run `python setup.py`
2. Run `python app.py`

## Python Library Requirements

- flask
- python-dotenv
- pandas

## The webpage layout

The webpage is constructed through flask and several html pages. Currently the index contains two links, which change depending on the user's login status: "homepage" and "logout" for logged-in users and "homepage" and "login" for not logged-in users (these links stay constant across all pages until login status is changed). The base page/homepage shows user login status (either "logged in as" and then the user's username or "not logged in"), along with the user's role(s) (i.e. seller, bidder, or helpdesk) if they are logged-in. The login page has fields for inputting username (not hidden) and password (hidden), as well as a submit button; the logout features a lone "logout" button.

## Project Features

### Basic Setup

The `requirements.txt` file contains all the Python libraries required to run our project, and must be used to install the required libraries first to run our project.

Alongside that, the `setup.py` file creates the `SECRET_KEY` environment variable that will be used by Flask's session manager, and must also be run in order to set up the project.

### Database Creation and Population

The `setup.py` file also handles the creation and population of the database.

To create the database, `setup.py` connects to `database.db` and executes `create_db.sql`, which contains the `CREATE TABLE` codes for all the relations, and creates the relations if they do not already exist.

To populate the database, `setup.py` reads each `.csv` file in `NittanyAuctionDataset_v1`, which contains all the datasets organized into relations and their respective columns. Each relation is then converted into a `pandas` DataFrame, and then uses `panda`'s `.to_sql()` function to export each relation into `database.db`. The only exception is the `Users` relation, where the `password` field is run through a SHA256 function before exporting.

### User Login

Upon pressing the submit button on the login page, one of two things will happen. If the incorrect credentials are given or empty fields are present, then a "failed" message is displayed to the user and the user remains on the login page. Otherwise, the user gets taken back to the base page and the index is updated to say "logged in as" and then their username and role (either seller, bidder, or helpdesk). The logout page simply offers a "logout" button that, when pressed, takes the user back to the homepage and updates the index to say "not logged in".

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
    │   ├── login.html
    │   ├── logout.html
    ├── .gitignore
    ├── app.py
    ├── create_db.sql
    ├── README.md
    ├── requirements.txt
    └── setup.py