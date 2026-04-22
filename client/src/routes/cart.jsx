import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page shows everything currently in the logged-in user's cart.
// The user can view the items, remove them, and see the total cost.
function Cart() {
    const navigate = useNavigate();

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState("");

    // This runs when the page first loads.
    // It checks if the user is logged in and then loads their cart items.
    useEffect(() => {
        // This function handles loading all the data needed for the cart page.
        const loadPage = async () => {
            // If the user is not logged in, send them to the login page.
            const resp = await validate();
            if (!resp) {
                navigate('/login');
                return;
            }

            setLogged(true);

            const token = localStorage.getItem('token');

            // Get all cart items for the current user.
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/cart', {
                    headers: { Authorization: token }
                });
                setCartItems(res.data.items);
            } catch {
                // If loading fails, just keep the cart empty instead of crashing the page.
                setCartItems([]);
            }

            setLoadDone(true);
        };

        loadPage();
    }, [navigate]);

    // This removes one item from the cart.
    // If the backend call works, the item also gets removed from the page right away.
    const handleRemove = (cart_id) => {
        const token = localStorage.getItem('token');

        axios.post('http://127.0.0.1:5000/api/cart/remove', { cart_id }, {
            headers: { Authorization: token }
        })
            // If it works, update local state so the UI changes immediately.
            .then(() => {
                setCartItems(cartItems.filter(item => item.cart_id !== cart_id));
            })
            .catch(() => {
                setError("Failed to remove item. Please try again.");
            });
    };

    // This adds up all the item prices in the cart
    // so the user can see the final total at the bottom.
    const getTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = parseFloat(item.current_bid || 0);
            return sum + price;
        }, 0).toFixed(2);
    };

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Shopping Cart" logged={logged} />

                    <div className='max-w-3xl mx-auto py-10 px-6'>
                        <h1 className='text-2xl font-bold mb-6'>Shopping Cart</h1>

                        {/* Show this error message if something goes wrong */}
                        {error && (
                            <p className='text-red-500 text-sm mb-4'>{error}</p>
                        )}

                        {cartItems.length === 0 ? (
                            // Show this if the user has nothing in their cart yet.
                            <div className='text-center py-16'>
                                <p className='text-slate-400 text-sm mb-4'>Your cart is empty.</p>
                                <Link
                                    to="/"
                                    className='bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer'
                                >
                                    Browse Listings
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Main list of all cart items */}
                                <div className='flex flex-col gap-3 mb-6'>
                                    {cartItems.map((item, i) => (
                                        <div
                                            key={i}
                                            className='border rounded-sm p-4 bg-white flex justify-between items-center'
                                        >
                                            <div>
                                                {/* Link that takes the user to the actual listing page */}
                                                <Link
                                                    to={`/listing/${item.seller_email}/${item.listing_id}`}
                                                    className='font-semibold hover:underline'
                                                >
                                                    {item.auction_title}
                                                </Link>
                                                <p className='text-sm text-slate-500'>{item.product_name}</p>
                                                <p className='text-xs text-slate-400'>Seller: {item.seller_email}</p>
                                            </div>

                                            <div className='text-right flex flex-col items-end gap-2'>
                                                {/* Price for this cart item */}
                                                <p className='font-semibold text-green-600'>
                                                    ${parseFloat(item.current_bid || 0).toFixed(2)}
                                                </p>

                                                {/* Button to remove this item from the cart */}
                                                <button
                                                    onClick={() => handleRemove(item.cart_id)}
                                                    className='text-xs text-red-500 hover:underline cursor-pointer'
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Final total for everything currently in the cart */}
                                <div className='border rounded-sm p-4 bg-white flex justify-between items-center'>
                                    <p className='font-semibold'>Total</p>
                                    <p className='text-xl font-bold text-green-600'>${getTotal()}</p>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

export default Cart;