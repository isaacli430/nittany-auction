# Mini-summary of our work (for prog check)

## The webpage layout

The webpage is constructed through flask and several html pages. Currently the index contains two links, which change depending on the user's login status: "homepage" and "logout" for logged-in users and "homepage" and "login" for not logged-in users (these links stay constant across all pages until login status is changed). The base page/homepage shows user login status (either "logged in as" and then the user's username or "not logged in"), along with the user's role (i.e. seller, bidder, or helpdesk) if they are logged-in. The login page has fields for inputting username (not hidden) and password (hidden), as well as a submit button; the logout features a lone "logout" button.

## Database Creation and Population

The app.py file, in addition to containing all the functions needed for flask to run the website, also contains a function called load_db. This function's only purpose is to create the database named "database.db" (the main backend of NittanyAuction) if it does not exist already, and then run the create_db SQL file. This SQL file creates the all the necessary relations if they are not already present. After the database has been created, it can be manually populated using e.g. data imports via pycharm, or it can be auto-populated with the separate python file populate_db.py. The populate_db.py file assumes database.db already exists with all relevant fields. It reads each csv in the NittanyAuctionDataset_v1 directory into a pandas dataframe, naming the dataframe after the file name (minus the .csv extension). Then it uses the .to_sql function in pandas to export that dataframe to the relation in database.db whose name matches the dataframe's name; the only exception is the Users dataframe, whose password column has the sha256 hash function applied to it before being exported to the Users relation in the database. 

## Login process

Upon pressing the submit button on the login page, one of two things will happen. If the incorrect credentials are given or empty fields are present, then a "failed" message is displayed to the user and the user remains on the login page. Otherwise, the user gets taken back to the base page and the index is updated to say "logged in as" and then their username and role (either seller, bidder, or helpdesk). The logout page simply offers a "logout" button that, when pressed, takes the user back to the homepage and updates the index to say "not logged in". 
