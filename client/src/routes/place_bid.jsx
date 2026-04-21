import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page lets a user place a bid on a specific listing
// It loads the listing info, shows the current highest bid,
// and makes sure the next bid is high enough
function PlaceBid() {
    // Getting the seller email and listing ID from the URL
    const { seller_email, listing_id } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [listing, setListing] = useState(null);
    const [currentHighest, setCurrentHighest] = useState(0);
    const [submitError, setSubmitError] = useState("");
    const [userEmail, setUserEmail] = useState("");

    // This runs when the page first opens
    // It checks login status, loads the listing,
    // and figures out what the current highest bid is
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

            // Load the listing details so the user can see what they are bidding on
            try {
                const res = await axios.get(
                    `http://127.0.0.1:5000/api/listing/${seller_email}/${listing_id}`,
                    { headers: { Authorization: token } }
                );
                setListing(res.data);
            } catch {
                // If the listing does not exist or fails to load then just send them home
                navigate('/');
                return;
            }

            // Load the current bids so we know what the highest bid is right now
            try {
                const res = await axios.get(
                    `http://127.0.0.1:5000/api/listing/${seller_email}/${listing_id}/bids`,
                    { headers: { Authorization: token } }
                );

                setUserEmail(res.data.user_email);

                // The bids come back sorted from highest to lowest,
                // so the first one is the current top bid
                const highest = res.data.bids.length > 0 ? res.data.bids[0].bid_price : 0;
                setCurrentHighest(highest);

                // Autofill the input with the smallest valid next bid
                setValue("bid_price", (parseFloat(highest) + 1).toFixed(2));
            } catch {
                // If bid history fails to load then just default the starting bid to $1.00
                setValue("bid_price", "1.00");
            }

            setLoadDone(true);
        };

        loadPage();
    }, [listing_id, seller_email, navigate, setValue]);

    // This runs after the form passes frontend validation
    // It sends the new bid to the backend
    const onSubmit = (data) => {
        setSubmitError("");

        const token = localStorage.getItem('token');

        axios.post('http://127.0.0.1:5000/api/bid', {
            seller_email: seller_email,
            listing_id: listing_id,
            bid_price: data.bid_price
        }, {
            headers: { Authorization: token }
        })
            // If the bid works then send the user back to the listing page
            .then(() => {
                navigate(`/listing/${seller_email}/${listing_id}`);
            })
            // If the backend rejects the bid then show that message on the page
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setSubmitError(error.response.data.error);
                } else {
                    setSubmitError("Something went wrong. Please try again.");
                }
            });
    };

    // This handles the cancel button
    // It just takes the user back to the listing page without placing a bid
    const goBackToListing = () => {
        navigate(`/listing/${seller_email}/${listing_id}`);
    };

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Place a Bid" logged={logged} />

                    <div className='flex justify-center items-center py-10'>
                        <div className='flex flex-col shadow-lg bg-white rounded-sm p-10 w-full max-w-md'>
                            <h1 className='text-2xl mb-2'><b>Place a Bid</b></h1>

                            {/* Show the listing title and product name so the user knows what they are bidding on */}
                            {listing && (
                                <p className='text-sm text-slate-500 mb-6'>
                                    {listing.auction_title} - {listing.product_name}
                                </p>
                            )}

                            {/* Box showing the current highest bid and the minimum next bid */}
                            <div className='bg-slate-50 border rounded-sm p-3 mb-6'>
                                <p className='text-sm text-slate-500'>Current Highest Bid</p>
                                <p className='text-xl font-bold text-green-600'>
                                    {currentHighest > 0
                                        ? `$${parseFloat(currentHighest).toFixed(2)}`
                                        : "No bids yet"
                                    }
                                </p>
                                <p className='text-xs text-slate-400 mt-1'>
                                    Minimum bid: ${(parseFloat(currentHighest) + 1).toFixed(2)}
                                </p>
                            </div>

                            <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)} noValidate>
                                {/* Input for entering the bid amount */}
                                <input
                                    className={'login-input ' + (errors.bid_price && 'border-red-500!')}
                                    placeholder="Your bid ($)"
                                    type="number"
                                    step="0.01"
                                    {...register("bid_price", {
                                        required: {
                                            value: true,
                                            message: "Please enter a bid amount."
                                        },
                                        // This validation makes sure the new bid is higher than the current highest bid
                                        validate: (value) =>
                                            parseFloat(value) > parseFloat(currentHighest) ||
                                            `Bid must be higher than $${parseFloat(currentHighest).toFixed(2)}`
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.bid_price && <>{errors.bid_price.message}</>}
                                </i></p>

                                {/* Small reminder so the user knows bidding is a real commitment */}
                                <p className='text-xs text-slate-400 mb-4'>
                                    By placing a bid you agree to pay if you win the auction.
                                </p>

                                {/* Show backend errors here if the bid request fails */}
                                {submitError && (
                                    <p className='text-red-500 text-sm mb-3'><i>{submitError}</i></p>
                                )}

                                <div className='flex gap-3'>
                                    {/* Button to submit the bid */}
                                    <button
                                        type="submit"
                                        className='bg-slate-300 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer'
                                    >
                                        Confirm Bid
                                    </button>

                                    {/* Button to cancel and go back without bidding */}
                                    <button
                                        type="button"
                                        onClick={goBackToListing}
                                        className='bg-slate-100 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer border'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default PlaceBid;