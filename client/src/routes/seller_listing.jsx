import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page lets a seller view one of their own listings in detail
// They can also edit the listing, unlist it, delete it and check the bid history
function SellerListing() {
    const { listing_id } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listing, setListing] = useState(null);
    const [bids, setBids] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");

    // This runs when the page first opens
    // It checks login makes sure the user is really a seller
    // and then loads the listing details, bids, and category options
    useEffect(() => {
        // Handles all the startup loading for this page
        const loadPage = async () => {
            // If the user is not logged in then send them to the login page
            const resp = await validate();
            if (!resp) {
                navigate('/login');
                return;
            }

            setLogged(true);

            const token = localStorage.getItem('token');

            // Double checking that the current user is actually a seller
            try {
                const sellerCheck = await axios.get('http://127.0.0.1:5000/api/is-seller', {
                    headers: { Authorization: token }
                });

                if (!sellerCheck.data.is_seller) {
                    navigate('/');
                    return;
                }
            } catch {
                // If the seller check fails then just send them back home
                navigate('/');
                return;
            }

            // Load the details for this specific listing
            try {
                const res = await axios.get(`http://127.0.0.1:5000/api/my-listing/${listing_id}`, {
                    headers: { Authorization: token }
                });

                setListing(res.data.listing);
                setBids(res.data.bids);

                // Fill the edit form with the current listing values
                // so the seller does not have to type everything again
                reset(res.data.listing);
            } catch {
                // If the listing is invalid or does not belong to this seller
                // then send them back to the listings page
                navigate('/my-listings');
                return;
            }

            // Load the list of categories for the edit form dropdown
            try {
                const catRes = await axios.get('http://127.0.0.1:5000/api/categories');
                setCategories(catRes.data);
            } catch {
                // If categories fail to load then just leave the dropdown empty
                setCategories([]);
            }

            setLoadDone(true);
        };

        loadPage();
    }, [listing_id, navigate, reset]);

    // This runs when the seller saves changes while in edit mode
    // It sends the updated listing info to the backend
    const onSubmit = (data) => {
        setSubmitError("");
        setSubmitSuccess("");

        const token = localStorage.getItem('token');

        axios.post(`http://127.0.0.1:5000/api/my-listing/${listing_id}/edit`, {
            category: data.category,
            auction_title: data.auction_title,
            product_name: data.product_name,
            product_description: data.product_description,
            quantity: data.quantity,
            reserve_price: data.reserve_price,
            max_bids: data.max_bids
        }, {
            headers: { Authorization: token }
        })
            // If the update works then update the page right away
            // so the seller can see the new changes immediately
            .then(() => {
                setListing({ ...listing, ...data });
                setSubmitSuccess("Listing updated successfully.");
                setEditMode(false);
            })
            // If something fails then show the backend error if there is one
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setSubmitError(error.response.data.error);
                } else {
                    setSubmitError("Something went wrong. Please try again.");
                }
            });
    };

    // This handles the unlist button
    // It keeps the listing in the system but makes it inactive
    // so buyers can no longer place bids on it
    const handleUnlist = () => {
        const confirmed = window.confirm("Are you sure you want to unlist this item?");
        if (!confirmed) return;

        const token = localStorage.getItem('token');

        axios.post(`http://127.0.0.1:5000/api/my-listing/${listing_id}/unlist`, {}, {
            headers: { Authorization: token }
        })
            // If unlisting works then update the status on the page instantly
            .then(() => {
                setListing({ ...listing, status: 0 });
                setSubmitSuccess("Listing has been unlisted.");
                setSubmitError("");
            })
            .catch(() => {
                setSubmitError("Failed to unlist. Please try again.");
            });
    };

    // This handles the delete button
    // Unlike unlisting this completely removes the listing from the database
    const handleDelete = () => {
        const confirmed = window.confirm("Are you sure you want to permanently delete this listing? This cannot be undone.");
        if (!confirmed) return;

        const token = localStorage.getItem('token');

        axios.post(`http://127.0.0.1:5000/api/my-listing/${listing_id}/delete`, {}, {
            headers: { Authorization: token }
        })
            // After deleting send the seller back to the main listings page
            .then(() => {
                navigate('/my-listings');
            })
            .catch(() => {
                setSubmitError("Failed to delete. Please try again.");
            });
    };

    // This helper changes the numeric status into a normal word
    // so it looks cleaner on the page
    const getStatusLabel = (status) => {
        if (status === 1) return "Active";
        if (status === 2) return "Sold";
        return "Inactive";
    };

    // This handles the back button at the top of the page
    // It just sends the seller back to all of their listings
    const goBackToListings = () => {
        navigate('/my-listings');
    };

    // This switches between edit mode and normal view mode
    // It also clears out any old success or error messages
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setSubmitError("");
        setSubmitSuccess("");
    };

    return (
        <>
            {loadDone && listing && (
                <>
                    <Base title="My Listing" logged={logged} />

                    <div className='max-w-3xl mx-auto py-10 px-6'>
                        {/* Top bar with the back button and edit button */}
                        <div className='flex justify-between items-center mb-6'>
                            <button
                                onClick={goBackToListings}
                                className='text-sm text-slate-500 hover:underline cursor-pointer'
                            >
                                ← Back to My Listings
                            </button>

                            {/* Do not show edit if the listing is already sold */}
                            {listing.status !== 2 && (
                                <button
                                    onClick={toggleEditMode}
                                    className='bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer'
                                >
                                    {editMode ? "Cancel Edit" : "Edit Listing"}
                                </button>
                            )}
                        </div>

                        {/* Success message after something works */}
                        {submitSuccess && (
                            <div className='bg-green-50 border border-green-300 text-green-700 rounded-sm p-3 mb-5 text-sm'>
                                {submitSuccess}
                            </div>
                        )}

                        {/* Error message if something fails */}
                        {submitError && (
                            <p className='text-red-500 text-sm mb-4'>{submitError}</p>
                        )}

                        {/* Quick summary showing the listing ID and current status */}
                        <div className='flex gap-6 mb-6'>
                            <div>
                                <p className='text-xs text-slate-400'>Listing ID</p>
                                <p className='font-semibold'>#{listing.listing_id}</p>
                            </div>
                            <div>
                                <p className='text-xs text-slate-400'>Status</p>
                                <p className='font-semibold'>{getStatusLabel(listing.status)}</p>
                            </div>
                        </div>

                        {editMode ? (
                            // In edit mode show the form so the seller can update the listing
                            <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-3'>
                                <div>
                                    <p className='text-xs text-slate-400 mb-1'>Auction Title</p>
                                    <input
                                        className={'login-input ' + (errors.auction_title && 'border-red-500!')}
                                        placeholder="Auction title"
                                        {...register("auction_title", { required: "Auction title is required." })}
                                    />
                                    {errors.auction_title && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.auction_title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <p className='text-xs text-slate-400 mb-1'>Product Name</p>
                                    <input
                                        className={'login-input ' + (errors.product_name && 'border-red-500!')}
                                        placeholder="Product name"
                                        {...register("product_name", { required: "Product name is required." })}
                                    />
                                    {errors.product_name && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.product_name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <p className='text-xs text-slate-400 mb-1'>Product Description</p>
                                    <textarea
                                        className='login-input h-24 resize-none'
                                        placeholder="Product description (optional)"
                                        {...register("product_description")}
                                    />
                                </div>

                                <div>
                                    <p className='text-xs text-slate-400 mb-1'>Category</p>
                                    <select
                                        className={'login-input ' + (errors.category && 'border-red-500!')}
                                        {...register("category", { required: "Please select a category." })}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat, i) => (
                                            <option key={i} value={cat.category_name}>
                                                {cat.category_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.category.message}</p>
                                    )}
                                </div>

                                <div className='flex gap-4'>
                                    <div className='flex-1'>
                                        <p className='text-xs text-slate-400 mb-1'>Quantity</p>
                                        <input
                                            className='login-input'
                                            type="number"
                                            {...register("quantity", { required: true, min: 1 })}
                                        />
                                    </div>

                                    <div className='flex-1'>
                                        <p className='text-xs text-slate-400 mb-1'>Reserve Price ($)</p>
                                        <input
                                            className='login-input'
                                            type="number"
                                            step="0.01"
                                            {...register("reserve_price", { required: true, min: 0.01 })}
                                        />
                                    </div>

                                    <div className='flex-1'>
                                        <p className='text-xs text-slate-400 mb-1'>Max Bids</p>
                                        <input
                                            className='login-input'
                                            type="number"
                                            {...register("max_bids", { required: true, min: 1 })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className='bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer w-fit mt-2'
                                >
                                    Save Changes
                                </button>
                            </form>
                        ) : (
                            // In normal view mode just show the listing details
                            <div className='flex flex-col gap-4'>
                                <div className='border rounded-sm p-4 bg-white'>
                                    <p className='text-xs text-slate-400 mb-1'>Auction Title</p>
                                    <p className='font-semibold'>{listing.auction_title}</p>
                                </div>

                                <div className='border rounded-sm p-4 bg-white'>
                                    <p className='text-xs text-slate-400 mb-1'>Product Name</p>
                                    <p>{listing.product_name}</p>
                                </div>

                                {listing.product_description && (
                                    <div className='border rounded-sm p-4 bg-white'>
                                        <p className='text-xs text-slate-400 mb-1'>Description</p>
                                        <p className='text-slate-700'>{listing.product_description}</p>
                                    </div>
                                )}

                                <div className='flex gap-4'>
                                    <div className='flex-1 border rounded-sm p-4 bg-white'>
                                        <p className='text-xs text-slate-400 mb-1'>Category</p>
                                        <p>{listing.category}</p>
                                    </div>

                                    <div className='flex-1 border rounded-sm p-4 bg-white'>
                                        <p className='text-xs text-slate-400 mb-1'>Quantity</p>
                                        <p>{listing.quantity}</p>
                                    </div>
                                </div>

                                <div className='flex gap-4'>
                                    <div className='flex-1 border rounded-sm p-4 bg-white'>
                                        <p className='text-xs text-slate-400 mb-1'>Reserve Price</p>
                                        <p>{listing.reserve_price}</p>
                                    </div>

                                    <div className='flex-1 border rounded-sm p-4 bg-white'>
                                        <p className='text-xs text-slate-400 mb-1'>Max Bids</p>
                                        <p>{listing.max_bids}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Danger zone actions like unlisting or deleting the listing */}
                        {listing.status !== 2 && (
                            <div className='mt-8 border border-red-200 rounded-sm p-4'>
                                <p className='text-sm font-semibold text-red-500 mb-3'>Danger Zone</p>

                                <div className='flex gap-3'>
                                    {/* Only show unlist if the listing is currently active */}
                                    {listing.status === 1 && (
                                        <button
                                            onClick={handleUnlist}
                                            className='bg-slate-100 border hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer'
                                        >
                                            Unlist
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDelete}
                                        className='bg-red-100 text-red-600 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer border border-red-200'
                                    >
                                        Delete Listing
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Bid history for this listing */}
                        <div className='mt-8'>
                            <h2 className='font-bold text-lg mb-3'>Bid History</h2>

                            {bids.length > 0 ? (
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
                                <p className='text-slate-400 text-sm'>No bids yet.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default SellerListing;