import { Link } from 'react-router-dom';

import { CgProfile } from "react-icons/cg";

import { useState } from 'react';


const Navbar = ({ logged }) => {

    const [profileMenu, setProfileMenu] = useState(false);

    const toggleMenu = () => {
        if (profileMenu) {
            setProfileMenu(false);
        } else {
            setProfileMenu(true);
        }
    }

    return (
        <>
            <nav className='flex pr-4 pl-4 pt-0 pb-0 bg-slate-300'>
                <Link className='nav-link' to="/">Nittany Auction</Link>
                <Link className='nav-link' to="/products">Products</Link>
                <button className='nav-link ml-auto! pr-4! pl-4! hover:cursor-pointer' onClick={toggleMenu}><CgProfile /></button>
            </nav>
            {profileMenu &&
                <div className='flex flex-col z-10 absolute bg-slate-600 right-3 rounded-sm pr-0 pl-0 pt-4 pb-4 shadow-lg'>
                    {logged ? (
                        <>
                            <Link className='profile-link' to="/">View Profile</Link>
                            <Link className='profile-link' to="/logout">Logout</Link>
                        </>
                    ) : (
                        <Link className='profile-link' to="/login">Login</Link>
                    )}
                </div>
            }
        </>
    )
}

export default Navbar;