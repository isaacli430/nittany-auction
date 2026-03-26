-- ================================
-- User Info
-- ================================
CREATE TABLE IF NOT EXISTS Users(
    email TEXT,
    password TEXT NOT NULL,

    PRIMARY KEY (email)
);
    

-- ================================
-- Location Info
-- ================================
CREATE TABLE IF NOT EXISTS Zipcode_Info (
    zipcode INTEGER,
    city TEXT NOT NULL,
    state TEXT NOT NULL,

    PRIMARY KEY (zipcode)
);

CREATE TABLE IF NOT EXISTS Address (
    address_id TEXT,
    zipcode INTEGER NOT NULL,
    street_num INTEGER NOT NULL,
    street_name TEXT NOT NULL,

    PRIMARY KEY (address_id),
    FOREIGN KEY (zipcode) REFERENCES Zipcode_Info
);


-- ================================
-- Bidder Info
-- ================================
CREATE TABLE IF NOT EXISTS Bidders (
    email TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    home_address_id TEXT NOT NULL,
    major TEXT NOT NULL,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE,
    FOREIGN KEY (home_address_id) REFERENCES Address(address_id)
);

CREATE TABLE IF NOT EXISTS Credit_Cards (
    credit_card_num TEXT NOT NULL,
    card_type TEXT NOT NULL,
    expire_month INTEGER NOT NULL,
    expire_year INTEGER NOT NULL,
    security_code INTEGER NOT NULL,
    owner_email TEXT NOT NULL,

    PRIMARY KEY (credit_card_num, owner_email),
    FOREIGN KEY (owner_email) REFERENCES Bidders(email) ON DELETE CASCADE
);
    

-- ================================
-- Seller Info
-- ================================
CREATE TABLE IF NOT EXISTS Sellers (
    email TEXT,
    bank_routing_number TEXT NOT NULL,
    bank_account_number INTEGER NOT NULL,
    balance REAL NOT NULL,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Local_Vendors (
    email TEXT,
    business_name TEXT NOT NULL,
    business_address_id TEXT NOT NULL,
    customer_service_phone_number TEXT NOT NULL,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Sellers ON DELETE CASCADE,
    FOREIGN KEY (business_address_id) REFERENCES Address(address_id)
);
    

-- ================================
-- Helpdesk Info
-- ================================
CREATE TABLE IF NOT EXISTS Helpdesk (
    email TEXT,
    position TEXT NOT NULL,
    
    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE
);
    
CREATE TABLE IF NOT EXISTS Requests (
    request_id INTEGER,
    sender_email TEXT NOT NULL,
    helpdesk_staff_email TEXT NOT NULL,
    request_type TEXT NOT NULL,
    request_desc TEXT NOT NULL,
    request_status INTEGER NOT NULL,

    PRIMARY KEY (request_id),
    FOREIGN KEY (sender_email) REFERENCES Users(email) ON DELETE CASCADE,
    FOREIGN KEY (helpdesk_staff_email) REFERENCES Helpdesk(email) ON DELETE CASCADE
);
    

-- ================================
-- Auction Info
-- ================================
CREATE TABLE IF NOT EXISTS Categories (
    parent_category TEXT NOT NULL,
    category_name TEXT,

    PRIMARY KEY (category_name));

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
    FOREIGN KEY (category) REFERENCES Categories(category_name) ON DELETE SET NULL
);
    
CREATE TABLE IF NOT EXISTS Bids (
    bid_id INTEGER,
    seller_email TEXT NOT NULL,
    listing_id INTEGER NOT NULL,
    bidder_email TEXT NOT NULL,
    bid_price REAL NOT NULL,

    PRIMARY KEY (bid_id),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES Ausction_Listing ON DELETE CASCADE,
    FOREIGN KEY (bidder_email) REFERENCES Bidders(email) ON DELETE CASCADE
);
    
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INTEGER,
    seller_email TEXT,
    listing_id INTEGER NOT NULL,
    bidder_email TEXT,
    date DATE NOT NULL,
    payment REAL NOT NULL,

    PRIMARY KEY (transaction_id),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE SET NULL,
    FOREIGN KEY (listing_id) REFERENCES Auction_Listing,
    FOREIGN KEY (bidder_email) REFERENCES Bidders(email) ON DELETE SET NULL
);
    
CREATE TABLE IF NOT EXISTS Ratings (
    bidder_email TEXT NOT NULL,
    seller_email TEXT NOT NULL,
    date DATE NOT NULL,
    rating INTEGER NOT NULL,
    rating_desc TEXT NOT NULL,

    PRIMARY KEY (bidder_email, seller_email, date),
    FOREIGN KEY (bidder_email) REFERENCES Bidders(email) ON DELETE CASCADE,
    FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE CASCADE
);
    
CREATE TABLE IF NOT EXISTS Tokens(
    email TEXT,
    token TEXT NOT NULL UNIQUE,

    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES Users ON DELETE CASCADE
);