import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


const Navbar = ({ logged }) => {

    return (
        <nav>
            <Link to="/">Home</Link> |{" "}
            {logged ? (
                <Link to="/logout">Logout</Link>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    )
}

export default Navbar;