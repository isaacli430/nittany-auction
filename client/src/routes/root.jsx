import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This is the main home page for the site
// It shows a few active auctions and some categories so users can start browsing quickly
function Root() {
    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);

    // This runs once when the page first loads
    // It checks login status and loads the main data needed for the homepage
    useEffect(() => {
        // This function gets the listings and categories that show up on the home page
        const loadPage = async () => {
            // Check whether the user is logged in or not
            const resp = await validate();
            setLogged(resp);

            // Get active listings from the backend
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/listings');
                setListings(res.data);
            } catch {
                // If listings fail to load then just leave the section empty
                setListings([]);
            }

            // Get categories for the browse by category section
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/categories');

                // Only show top level categories on the homepage
                setCategories(res.data.filter((c) => !c.parent_category).slice(0, 12));
            } catch {
                // If categories fail to load then leave this section empty too
                setCategories([]);
            }

            setLoadDone(true);
        };

        loadPage();
    }, []);

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Home" logged={logged} />

                    {/* Top hero section thta users see first */}
                    <div className='bg-slate-800 text-white py-16 px-6 text-center'>
                        <h1 className='text-4xl font-bold mb-3'>
                            {logged ? "Welcome back!" : "Buy & Sell on Campus"}
                        </h1>

                        <p className='text-slate-300 mb-6 text-lg'>
                            {logged
                                ? "Browse active auctions or list something new."
                                : "NittanyAuction is the online auction marketplace for Penn State."
                            }
                        </p>

                        <div className='flex justify-center gap-3 flex-wrap'>
                            <Link
                                to="/products"
                                className='bg-white text-slate-800 font-semibold py-2 px-6 rounded-sm hover:brightness-90'
                            >
                                Browse Auctions
                            </Link>

                            {!logged && (
                                <Link
                                    to="/register"
                                    className='border border-white text-white font-semibold py-2 px-6 rounded-sm hover:bg-white hover:text-slate-800'
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Only show this section to users who are not logged n already */}
                    {!logged && (
                        <div className='py-12 px-6 bg-white'>
                            <div className='max-w-4xl mx-auto text-center'>
                                <h2 className='text-2xl font-bold mb-8'>How It Works</h2>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                    {[
                                        { step: "1", title: "Register", desc: "Sign up with your email to join NittanyAuction." },
                                        { step: "2", title: "Browse & Bid", desc: "Find items you want and place your bids." },
                                        { step: "3", title: "Win & Pay", desc: "Win the auction and complete your purchase." }
                                    ].map(({ step, title, desc }) => (
                                        <div key={step} className='border rounded-sm p-6'>
                                            <div className='w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3'>
                                                {step}
                                            </div>
                                            <h3 className='font-bold mb-2'>{title}</h3>
                                            <p className='text-slate-500 text-sm'>{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section for browsing main categories */}
                    {categories.length > 0 && (
                        <div className='py-10 px-6 bg-slate-50'>
                            <div className='max-w-5xl mx-auto'>
                                <h2 className='text-xl font-bold mb-5'>Browse by Category</h2>

                                <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
                                    {categories.map((cat, i) => (
                                        <Link
                                            key={i}
                                            to={`/products?category=${cat.category_name}`}
                                            className='bg-white border rounded-sm p-3 text-center hover:bg-slate-100 text-sm font-medium text-slate-700'
                                        >
                                            {cat.category_name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section showing some active auctions */}
                    <div className='py-10 px-6 bg-white'>
                        <div className='max-w-5xl mx-auto'>
                            <div className='flex justify-between items-center mb-5'>
                                <h2 className='text-xl font-bold'>Active Auctions</h2>
                                <Link to="/products" className='text-sm text-blue-600 hover:underline'>
                                    View all →
                                </Link>
                            </div>

                            {listings.length === 0 ? (
                                <p className='text-slate-400 text-sm'>No active auctions right now.</p>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {listings.map((listing, i) => (
                                        <Link
                                            key={i}
                                            to={`/listing/${listing.seller_email}/${listing.listing_id}`}
                                            className='border rounded-sm p-4 bg-white hover:bg-slate-50 flex flex-col gap-2'
                                        >
                                            {/* Small category label for the listing */}
                                            <span className='text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-sm w-fit'>
                                                {listing.category}
                                            </span>

                                            {/* Listing title and product name */}
                                            <p className='font-semibold text-slate-800'>{listing.auction_title}</p>
                                            <p className='text-sm text-slate-500'>{listing.product_name}</p>

                                            {/* Current bid amount and seller info */}
                                            <div className='flex justify-between items-center mt-2'>
                                                <div>
                                                    <p className='text-xs text-slate-400'>Current Bid</p>
                                                    <p className='font-bold text-green-600'>
                                                        {listing.current_bid
                                                            ? `$${parseFloat(listing.current_bid).toFixed(2)}`
                                                            : "No bids yet"
                                                        }
                                                    </p>
                                                </div>

                                                <p className='text-xs text-slate-400 truncate max-w-32'>
                                                    {listing.seller_email}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default Root;