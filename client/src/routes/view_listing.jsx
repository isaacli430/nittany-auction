import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page shows the full details for one listing
// Users can view the item info, see the bid history and place a bid if they are allowed to
function ViewListing() {
    // Getting the listing ID and seller email from the URL
    const { listing_id, seller_email } = useParams();
    const navigate = useNavigate();

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listing, setListing] = useState(null);
    const [bids, setBids] = useState([]);
    const [userEmail, setUserEmail] = useState("");
    const [hasBid, setHasBid] = useState(false);
    const [error, setError] = useState("");

    // This runs when the page first loads
    // It checks login status and then loads the listing info and the bid history
    useEffect(() => {
        // Handles all the data loading for this page
        const loadPage = async () => {
            // First checking whether the user is logged in
            const resp = await validate();
            setLogged(resp);

            const token = localStorage.getItem('token');

            // Loading the main listing details from the backend
            try {
                const res = await axios.get(
                    `http://127.0.0.1:5000/api/listing/${seller_email}/${listing_id}`,
                    { headers: { Authorization: token } }
                );
                setListing(res.data);
            } catch {
                // If the listing cannot be found then show an error and stop loading the rest
                setError("Listing not found.");
                setLoadDone(true);
                return;
            }

            // Loading the bid history for this listing
            // The backend also sends back the current users email
            // and whether they already placed a bid on this listing
            try {
                const res = await axios.get(
                    `http://127.0.0.1:5000/api/listing/${seller_email}/${listing_id}/bids`,
                    { headers: { Authorization: token } }
                );
                setBids(res.data.bids);
                setUserEmail(res.data.user_email);
                setHasBid(res.data.has_bid);
                console.log("user email from bids api:", res.data.user_email);

            } catch {
                // If the bids do not load then just keep the list empty for now
                setBids([]);
            }

            setLoadDone(true);
        };

        loadPage();
    }, [listing_id, seller_email, navigate]);

    return (
        <>
            {loadDone && (
                <>
                    <Base title="View Listing" logged={logged} />

                    <div className='max-w-3xl mx-auto py-10 px-6'>
                        {/* Show an error message if the listing was not found */}
                        {error ? (
                            <p className='text-red-500'>{error}</p>

                        ) : listing ? (
                            <>
                                {/* Placeholder for image section until real listing images are added */}
                                <div className='w-full h-56 bg-slate-200 rounded-sm flex items-center justify-center mb-6'>
                                    <p className='text-slate-400 text-sm'>No image available</p>
                                </div>

                                {/* Main listing details */}
                                <span className='text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-sm'>
                                    {listing.category}
                                </span>
                                <h1 className='text-2xl font-bold mt-2 mb-1'>{listing.auction_title}</h1>
                                <p className='text-slate-500 text-sm mb-4'>{listing.product_name}</p>

                                {/* Only show the description if one was actually provided */}
                                {listing.product_description && (
                                    <p className='text-slate-700 mb-6'>{listing.product_description}</p>
                                )}

                                {/* Seller info box */}
                                <div className='border rounded-sm p-4 mb-6 bg-slate-50'>
                                    <p className='text-sm text-slate-500 mb-1'>Seller</p>
                                    <p className='font-semibold'>{listing.seller_email}</p>

                                    {/* Only show this link if the user is logged in
                                        and has already bid on this seller's listing */}
                                    {hasBid && logged && (
                                        <Link
                                            to={`/rate/${listing.seller_email}`}
                                            className='inline-block mt-2 text-sm text-blue-600 hover:underline'
                                        >
                                            Rate this seller
                                        </Link>
                                    )}
                                </div>

                                {/* Current auction info */}
                                <div className='border rounded-sm p-4 mb-6'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <div>
                                            <p className='text-sm text-slate-500'>Current Highest Bid</p>
                                            <p className='text-2xl font-bold text-green-600'>
                                                {bids && bids.length > 0
                                                    ? `$${parseFloat(bids[0].bid_price).toFixed(2)}`
                                                    : "No bids yet"
                                                }
                                            </p>
                                        </div>

                                        <div className='text-right'>
                                            <p className='text-sm text-slate-500'>Bids placed</p>
                                            <p className='text-xl font-bold'>{bids ? bids.length : 0} / {listing.max_bids}</p>
                                        </div>
                                    </div>

                                    {/* Only let the user place a bid if they are logged in,
                                        are not the seller, and the listing is still active */}
                                    {logged && userEmail !== listing.seller_email && parseInt(listing.status) === 1 && (
                                        <Link
                                            to={`/bid/${listing.seller_email}/${listing.listing_id}`}
                                            className='inline-block text-center bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer mt-3'
                                        >
                                            Place a Bid
                                        </Link>
                                    )}

                                    {/* Add to cart button - only shown to logged in bidders, not the seller */}
                                    {logged && userEmail !== listing.seller_email && (
                                        <button
                                            onClick={() => {
                                                const token = localStorage.getItem('token');
                                                axios.post('http://127.0.0.1:5000/api/cart/add', {
                                                    seller_email: listing.seller_email,
                                                    listing_id: listing.listing_id
                                                }, { headers: { Authorization: token } })
                                                    .then(() => alert("Added to cart!"))
                                                    .catch((err) => alert(err.response?.data?.error || "Failed to add to cart."));
                                            }}
                                            className='block text-center bg-slate-100 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer mt-2 border'
                                        >
                                            Add to Cart
                                        </button>
                                    )}

                                    {/* Placeholder button for messaging the seller later */}
                                    {logged && (
                                        <button className='block text-center bg-slate-100 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer mt-2 border'>
                                            Message Seller
                                        </button>
                                    )}
                                </div>

                                {/* Bid history section */}
                                <div>
                                    <h2 className='font-bold text-lg mb-3'>Bid History</h2>

                                    {bids && bids.length > 0 ? (
                                        <div className='border rounded-sm overflow-hidden'>
                                            {bids.map((bid, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                                                >
                                                    <p className='text-slate-600'>{bid.bidder_email}</p>
                                                    <p className='font-semibold'>${parseFloat(bid.bid_price).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-slate-400 text-sm'>No bids yet. Be the first!</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className='text-slate-400'>Loading...</p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

export default ViewListing;