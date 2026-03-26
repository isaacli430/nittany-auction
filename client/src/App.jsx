import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Root from "./routes/root";
import Login from "./routes/login";
import Logout from "./routes/logout";
import Products from './routes/products';

const App = () => {
    return (
        <BrowserRouter>
            {/* Routes */}
            <Routes>
                <Route path= "/" element={<Root />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/products" element={<Products />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;