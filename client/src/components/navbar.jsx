import { Link } from 'react-router-dom';


const Navbar = ({ logged }) => {

    return (
        <nav>
            <Link to="/">Home</Link> |{" "}
            <Link to="/products">Products</Link> |{" "}
            {logged ? (
                <Link to="/logout">Logout</Link>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    )
}

export default Navbar;