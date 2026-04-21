import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page lets a seller create a new auction listing
// If the user is not logged in or is not a seller then they should not be able to stay here
function CreateListing() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const [categories, setCategories] = useState([]);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    const navigate = useNavigate();

    // This runs when the page first opens
    // It checks if the user is logged in and makes sure they are a seller
    // and then loads the categories for the dropdown
    useEffect(() => {
        // Handles all the setup checks before the form is shown
        const checkAccess = async () => {
            const resp = await validate();

            // If the user is not logged in then send them to the login page
            if (!resp) {
                navigate('/login');
                return;
            }

            const token = localStorage.getItem('token');

            // Double checking that the logged in user is actually a seller
            try {
                const sellerCheck = await axios.get('http://127.0.0.1:5000/api/is-seller', {
                    headers: { Authorization: token }
                });

                if (!sellerCheck.data.is_seller) {
                    navigate('/');
                    return;
                }

                setIsSeller(true);
            } catch {
                navigate('/');
                return;
            }

            // Load the category list so the seller can choose where the item belongs
            try {
                const catResp = await axios.get('http://127.0.0.1:5000/api/categories');
                setCategories(catResp.data);
            } catch {
                setCategories([]);
            }

            setLoadDone(true);
        };

        checkAccess();
    }, [navigate]);

    // This runs after the form passes frontend validation
    // It sends the new listing data to the backend
    const onSubmit = (data) => {
        setSubmitError("");
        setSubmitSuccess(false);

        const token = localStorage.getItem('token');

        axios.post('http://127.0.0.1:5000/api/create-listing', {
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
            // If the request works then show the success message on the page
            .then(() => {
                setSubmitSuccess(true);
            })
            // If something fails then try to show the backend error first
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setSubmitError(error.response.data.error);
                } else {
                    setSubmitError("Something went wrong. Please try again.");
                }
            });
    };

    return (
        <>
            {loadDone && isSeller && (
                <>
                    <Base title="Create Listing" logged={true} />

                    <div className='flex justify-center items-center py-10'>
                        <div className='flex flex-col shadow-lg bg-white rounded-sm p-10 w-full max-w-lg'>
                            <h1 className='text-2xl mb-2'><b>Create Listing</b></h1>

                            <p className='text-sm text-gray-500 mb-6'>
                                Your listing will be submitted for approval before going live.
                            </p>

                            {submitSuccess && (
                                <div className='bg-green-50 border border-green-300 text-green-700 rounded-sm p-3 mb-5 text-sm'>
                                    Listing submitted successfully! It will go live after approval.
                                </div>
                            )}

                            <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)} noValidate>
                                <p className='text-sm text-gray-500 mb-1 mt-2'>Listing Details</p>

                                {/* Title shown for the auction listing */}
                                <input
                                    className={'login-input ' + (errors.auction_title && 'border-red-500!')}
                                    placeholder="Auction title"
                                    {...register("auction_title", {
                                        required: {
                                            value: true,
                                            message: "Auction title is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.auction_title && <>{errors.auction_title.message}</>}
                                </i></p>

                                {/* Basic name of the product being listed */}
                                <input
                                    className={'login-input ' + (errors.product_name && 'border-red-500!')}
                                    placeholder="Product name"
                                    {...register("product_name", {
                                        required: {
                                            value: true,
                                            message: "Product name is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.product_name && <>{errors.product_name.message}</>}
                                </i></p>

                                {/* Optional description so the seller can add more details */}
                                <textarea
                                    className={'login-input h-24 resize-none'}
                                    placeholder="Product description (optional)"
                                    {...register("product_description")}
                                />
                                <p className='login-error'><i>&nbsp;</i></p>

                                {/* Dropdown for choosing which category this listing belongs to */}
                                <select
                                    className={'login-input ' + (errors.category && 'border-red-500!')}
                                    {...register("category", {
                                        required: {
                                            value: true,
                                            message: "Please select a category."
                                        }
                                    })}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat, i) => (
                                        <option key={i} value={cat.category_name}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.category && <>{errors.category.message}</>}
                                </i></p>

                                <p className='text-sm text-gray-500 mb-1 mt-4'>Auction Settings</p>

                                {/* Number of items included in this listing */}
                                <input
                                    className={'login-input ' + (errors.quantity && 'border-red-500!')}
                                    placeholder="Quantity"
                                    type="number"
                                    {...register("quantity", {
                                        required: {
                                            value: true,
                                            message: "Quantity is required."
                                        },
                                        min: {
                                            value: 1,
                                            message: "Quantity must be at least 1."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.quantity && <>{errors.quantity.message}</>}
                                </i></p>

                                {/* Minimum price the seller is willing to accept */}
                                <input
                                    className={'login-input ' + (errors.reserve_price && 'border-red-500!')}
                                    placeholder="Reserve price ($)"
                                    type="number"
                                    step="0.01"
                                    {...register("reserve_price", {
                                        required: {
                                            value: true,
                                            message: "Reserve price is required."
                                        },
                                        min: {
                                            value: 0.01,
                                            message: "Reserve price must be greater than 0."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.reserve_price && <>{errors.reserve_price.message}</>}
                                </i></p>

                                {/* Limit for how many bids this listing can receive */}
                                <input
                                    className={'login-input ' + (errors.max_bids && 'border-red-500!')}
                                    placeholder="Max number of bids"
                                    type="number"
                                    {...register("max_bids", {
                                        required: {
                                            value: true,
                                            message: "Max bids is required."
                                        },
                                        min: {
                                            value: 1,
                                            message: "Must allow at least 1 bid."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.max_bids && <>{errors.max_bids.message}</>}
                                </i></p>

                                {/* Shows backend errors if the listing request fails */}
                                {submitError && (
                                    <p className='text-red-500 text-sm mb-3'><i>{submitError}</i></p>
                                )}

                                <button
                                    type="submit"
                                    className='bg-slate-300 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer mt-2'
                                >
                                    Submit Listing
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default CreateListing;