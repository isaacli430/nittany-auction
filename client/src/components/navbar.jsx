import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { CgShoppingCart } from "react-icons/cg";
import { useState } from 'react';

// This is the navbar that shows up across the whole site
// It changes a little depending on whether the user is logged in or not
const Navbar = ({ logged }) => {

    const [profileMenu, setProfileMenu] = useState(false);
    // This opens or closes the profile dropdown menu
    // when the profile icon gets clicked
    const toggleMenu = () => {
        setProfileMenu(!profileMenu);
    };

    // This closes the dropdown after the user clicks one of the links
    // so the menu does not stay open on the next page
    const closeMenu = () => {
        setProfileMenu(false);
    };

    return (
        <>
            <nav className='flex pr-4 pl-4 pt-0 pb-0 bg-slate-200 items-center'>
                {/* Site name that also works as the home page link */}
                <Link className='nav-link' to="/">Nittany Auction</Link>

                {/* Main browse page link */}
                <Link className='nav-link' to="/products">Browse</Link>

                {/* These links only show up if the user is logged in */}
                {logged && (
                    <>
                        {/* Page where sellers can view their own listings */}
                        <Link className='nav-link' to="/my-listings">My Listings</Link>

                        {/* Page for creating a new listing to sell something */}
                        <Link className='nav-link' to="/create-listing">Sell</Link>
                    </>
                )}

                {/* Cart icon only shows for logged n users */}
                {logged && (
                    <Link className='nav-link ml-auto! pr-4! pl-4! text-lg' to="/cart">
                        <CgShoppingCart />
                    </Link>
                )}

                {/* Profile icon button that opens and closes the dropdown menu */}
                <button
                    className={`nav-link pr-4! pl-4! hover:cursor-pointer ${!logged ? 'ml-auto!' : ''}`}
                    onClick={toggleMenu}
                >
                    <CgProfile />
                </button>
            </nav>

            {/* Dropdown menu under the profile icon */}
            {profileMenu && (
                <div className='flex flex-col z-10 absolute mt-13 bg-white right-3 rounded-sm pr-0 pl-0 pt-4 pb-4 shadow-lg w-40'>
                    {logged ? (
                        <>
                            {/* These links are shown when the user is logged in */}
                            <Link className='profile-link' to="/profile" onClick={closeMenu}>View Profile</Link>
                            <Link className='profile-link' to="/reset-password" onClick={closeMenu}>Reset Password</Link>
                            <Link className='profile-link' to="/logout" onClick={closeMenu}>Logout</Link>
                        </>
                    ) : (
                        <>
                            {/* These links are shown when the user is not logged in yet */}
                            <Link className='profile-link' to="/login" onClick={closeMenu}>Login</Link>
                            <Link className='profile-link' to="/register" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default Navbar;