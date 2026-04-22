import { useEffect, useState } from 'react';
import axios from 'axios';

import Navbar from './navbar';
// This is the main layout wrapper used across the site
// It shows the navbar, updates the page title, and includes the floating help widget
const Base = ({ title, logged }) => {
    const [widgetOpen, setWidgetOpen] = useState(false);
    const [helpMessage, setHelpMessage] = useState("");
    const [widgetStatus, setWidgetStatus] = useState("");

    // This runs when the page loads or whenever the title changes
    // It updates the browser tab title so the page name matches where the user is
    useEffect(() => {
        document.title = 'Nittany Auction | ' + title;
    }, [title]);

    // This sends the help request to the backend
    // It first checks if the user actually typed something before submitting
    const handleHelpSubmit = () => {
        if (!helpMessage.trim()) {
            setWidgetStatus("Please enter a message.");
            return;
        }

        const token = localStorage.getItem('token');

        axios.post('http://127.0.0.1:5000/api/helpdesk/request', {
            message: helpMessage
        }, {
            headers: { Authorization: token }
        })
            // If it works then clear the message box and show a success message
            .then(() => {
                setWidgetStatus("Request submitted! We'll get back to you soon.");
                setHelpMessage("");
            })
            // If something goes wrong then try to show the backend error
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setWidgetStatus(error.response.data.error);
                } else {
                    setWidgetStatus("Something went wrong. Please try again.");
                }
            });
    };

    // This closes the help widget and clears out old text
    // so it feels fresh the next time the user opens it
    const handleClose = () => {
        setWidgetOpen(false);
        setHelpMessage("");
        setWidgetStatus("");
    };

    // This opens or closes the help widget
    // when the floating help button gets clicked
    const toggleWidget = () => {
        setWidgetOpen(!widgetOpen);
    };

    // This updates the message state while the user is typing in the help box
    const handleMessageChange = (e) => {
        setHelpMessage(e.target.value);
    };

    return (
        <>
            <Navbar logged={logged} />

            {/* Help widget fixed in the bottom-right corner */}
            <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2'>
                {/* Help popup box */}
                {widgetOpen && (
                    <div className='bg-white border rounded-sm shadow-lg p-4 w-72 flex flex-col gap-3'>
                        <div className='flex justify-between items-center'>
                            <p className='font-semibold text-sm'>Help & Support</p>

                            {/* Button to close the help popup */}
                            <button
                                onClick={handleClose}
                                className='text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer'
                            >
                                ×
                            </button>
                        </div>

                        <p className='text-xs text-slate-500'>
                            Have a question or issue? Send us a message and our helpdesk team will get back to you.
                        </p>

                        {/* Text area where the user types their help request */}
                        <textarea
                            className='border rounded-sm p-2 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-slate-300'
                            placeholder='Describe your issue...'
                            value={helpMessage}
                            onChange={handleMessageChange}
                        />

                        {/* Status message for errors or successful submission */}
                        {widgetStatus && (
                            <p className='text-xs text-slate-500'>{widgetStatus}</p>
                        )}

                        {/* Button to send the help request */}
                        <button
                            onClick={handleHelpSubmit}
                            className='bg-slate-300 hover:brightness-90 py-1 px-4 rounded-sm text-sm cursor-pointer w-fit'
                        >
                            Send Request
                        </button>
                    </div>
                )}

                {/* Floating button that opens or closes the help widget */}
                <button
                    onClick={toggleWidget}
                    className='bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:brightness-110 cursor-pointer text-lg'
                >
                    ?
                </button>
            </div>
        </>
    );
};

export default Base;