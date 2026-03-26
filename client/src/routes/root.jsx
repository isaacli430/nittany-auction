import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

function Root() {
    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        validate().then((resp) => {
            setLogged(resp);
            setLoadDone(true);
        });
        axios.get('http://localhost:5000/api/listings')
            .then(res => setListings(res.data))
            .catch(() => setListings([]));
        axios.get('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Home" logged={logged} />

                    {/* ── HERO ─────────────────────────────────────── */}
                    <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-24 px-6 text-center">
                        <h1 className="text-5xl font-bold mb-4">
                            {logged ? "Welcome Back!" : "Buy & Sell on Campus"}
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto">
                            {logged
                                ? "Discover great deals or list your own items for auction."
                                : "NittanyAuction is the online auction marketplace for Lion State University members."
                            }
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Link
                                to="/products"
                                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-full transition"
                            >
                                Browse Auctions
                            </Link>
                            {!logged && (
                                <Link
                                    to="/register"
                                    className="border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded-full transition"
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* ── SEARCH BAR ───────────────────────────────── */}
                    <section className="bg-gray-100 py-6 px-6 border-b shadow-sm">
                        <div className="max-w-3xl mx-auto flex gap-3">
                            <input
                                type="text"
                                placeholder="Search for items, categories, or sellers..."
                                className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition text-sm">
                                Search
                            </button>
                        </div>
                    </section>

                    {/* ── HOW IT WORKS (logged out only) ───────────── */}
                    {!logged && (
                        <section className="py-16 px-6 bg-white">
                            <div className="max-w-5xl mx-auto text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-12">How NittanyAuction Works</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { step: "1", title: "Register", desc: "Sign up with your LSU email address to join the NittanyAuction community." },
                                        { step: "2", title: "Browse & Bid", desc: "Explore listings by category, find items you want, and place your bids." },
                                        { step: "3", title: "Win & Pay", desc: "Win the auction, complete your payment, and rate your seller." },
                                    ].map(({ step, title, desc }) => (
                                        <div key={step} className="p-6 rounded-2xl border hover:shadow-md transition">
                                            <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                                {step}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                                            <p className="text-gray-500 text-sm">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── CATEGORIES ───────────────────────────────── */}
                    <section className="py-14 px-6 bg-gray-50">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Browse by Category</h2>
                                <Link to="/products" className="text-blue-600 hover:underline text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.length > 0 ? (
                                    categories.map((cat, i) => (
                                        <Link
                                            to={`/products?category=${cat.category_name}`}
                                            key={i}
                                            className="bg-white border rounded-2xl p-4 text-center hover:border-blue-500 hover:shadow-md transition"
                                        >
                                            <div className="text-3xl mb-2">🏷️</div>
                                            <p className="text-sm font-semibold text-gray-700">{cat.category_name}</p>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-400 col-span-full">No categories found.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── ACTIVE LISTINGS ──────────────────────────── */}
                    <section className="py-14 px-6 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Active Auctions</h2>
                                <Link to="/products" className="text-blue-600 hover:underline text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.length > 0 ? (
                                    listings.map((listing, i) => (
                                        <div key={i} className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                                            {/* Category badge */}
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-3">
                                                {listing.category}
                                            </span>
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{listing.auction_title}</h3>
                                            {/* Product name */}
                                            <p className="text-sm text-gray-500 mb-3">{listing.product_name}</p>
                                            {/* Description */}
                                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{listing.product_description}</p>
                                            {/* Bid + end info */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-400">Current Bid</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {listing.current_bid
                                                            ? `$${parseFloat(listing.current_bid).toFixed(2)}`
                                                            : "No bids yet"
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">Reserve</p>
                                                    <p className="text-sm font-semibold text-gray-600">
                                                        ${parseFloat(listing.reserve_price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Seller + rating */}
                                            <div className="flex items-center justify-between border-t pt-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                                                        {listing.seller_email[0].toUpperCase()}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{listing.seller_email}</p>
                                                </div>
                                                {listing.avg_rating && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-full">
                                                        ⭐ {parseFloat(listing.avg_rating).toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            {/* CTA */}
                                            <Link
                                                to={`/products/${listing.listing_id}`}
                                                className="mt-4 block text-center bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition text-sm"
                                            >
                                                View & Bid
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 text-gray-400">
                                        <p className="text-lg">No active auctions right now.</p>
                                        {logged && (
                                            <Link to="/sell" className="mt-4 inline-block bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 transition">
                                                List an Item
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── SELLER CTA (logged-in bidders only) ──────── */}
                    {logged && (
                        <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-16 px-6 text-center">
                            <h2 className="text-3xl font-bold mb-3">Have Something to Sell?</h2>
                            <p className="text-blue-100 mb-6 text-lg">Apply to become a seller and list your items for auction.</p>
                            <Link
                                to="/apply-seller"
                                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-full transition"
                            >
                                Apply to Sell
                            </Link>
                        </section>
                    )}
                </>
            )}
        </>
    );
}

export default Root;