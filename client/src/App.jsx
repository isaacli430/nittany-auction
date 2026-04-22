import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Root from "./routes/root";
import Login from "./routes/login";
import Logout from "./routes/logout";
import Products from './routes/products';
import Profile from './routes/profile';
import Register from './routes/register';
import CreateListing from './routes/create_listing';
import ViewListing from './routes/view_listing';
import PlaceBid from './routes/place_bid';
import Category from './routes/category';
import Listings from './routes/listings';
import SellerListings from './routes/seller_listings';
import SellerListing from './routes/seller_listing';
import NotFound from './routes/notfound';

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/listing/:seller_email/:listing_id" element={<ViewListing />} />
                <Route path="/bid/:seller_email/:listing_id" element={<PlaceBid />} />
                <Route path="/my-listings" element={<SellerListings />} />
                <Route path="/seller-listing/:listing_id" element={<SellerListing />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/products" element={<Products />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/categories" element={<Category />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
