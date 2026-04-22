import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page shows all the listings that belong to the logged-in seller
// From here they can check their current listings or go and create a new one
function SellerListings() {
    const navigate = useNavigate();

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listings, setListings] = useState([]);
    const [sellerEmail, setSellerEmail] = useState("");

    // This runs when the page first opens
    // It checks if the user is logged in then makes sure they are actually a seller
    // and then loads all of their listings
    useEffect(() => {
        // This handles all the page setup and data loading
        const loadPage = async () => {
            // If the user is not logged in then send them to the login page
            const resp = await validate();
            if (!resp) {
                navigate('/login');
                return;
            }

            setLogged(true);

            const token = localStorage.getItem('token');

            // Double checking that this user is really a seller before showing seller only data
            try {
                const sellerCheck = await axios.get('http://127.0.0.1:5000/api/is-seller', {
                    headers: { Authorization: token }
                });

                if (!sellerCheck.data.is_seller) {
                    navigate('/');
                    return;
                }
            } catch {
                // If the seller check fails then just send them back home.
                navigate('/');
                return;
            }

            // Load all listings that belong to this seller
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/my-listings', {
                    headers: { Authorization: token }
                });

                setListings(res.data.listings);
                setSellerEmail(res.data.seller_email);
            } catch {
                // If something goes wrong then just leave the listings empty instead of crashing the page
                setListings([]);
            }

            setLoadDone(true);
        };

        loadPage();
    }, [navigate]);

    // This helper turns the numeric listing status into a label and color
    // that is easier to show on the page
    const getStatusInfo = (status) => {
        if (status === 1) return { label: "Active", color: "text-green-600" };
        if (status === 2) return { label: "Sold", color: "text-blue-600" };
        return { label: "Inactive", color: "text-slate-400" };
    };

    return (
        <>
            {loadDone && (
                <>
                    <Base title="My Listings" logged={logged} />

                    <div className='max-w-3xl mx-auto py-10 px-6'>
                        <div className='flex justify-between items-center mb-6'>
                            <h1 className='text-2xl font-bold'>My Listings</h1>

                            {/* Button that takes the seller to the create listing page */}
                            <Link
                                to="/create-listing"
                                className='bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer'
                            >
                                + New Listing
                            </Link>
                        </div>

                        {/* Show this if the seller has not posted anything yet */}
                        {listings.length === 0 ? (
                            <p className='text-slate-400 text-sm'>You have no listings yet.</p>
                        ) : (
                            <div className='flex flex-col gap-3'>
                                {listings.map((listing, i) => {
                                    // Get the text and color that match this listings status
                                    const { label, color } = getStatusInfo(listing.status);

                                    return (
                                        <Link
                                            key={i}
                                            to={`/seller-listing/${listing.listing_id}`}
                                            className='border rounded-sm p-4 bg-white hover:bg-slate-50 flex justify-between items-center'
                                        >
                                            <div>
                                                <p className='font-semibold'>{listing.auction_title}</p>
                                                <p className='text-sm text-slate-500'>
                                                    {listing.category} - ID #{listing.listing_id}
                                                </p>
                                            </div>

                                            <div className='text-right'>
                                                {/* Show the listing status and number of bids on the right side */}
                                                <p className={`text-sm font-semibold ${color}`}>{label}</p>
                                                <p className='text-xs text-slate-400'>{listing.bid_count} bids</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

export default SellerListings;