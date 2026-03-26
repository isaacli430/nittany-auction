import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Root from "./routes/root";
import Login from "./routes/login";
import Logout from "./routes/logout";
import Products from './routes/products';
import NotFound from './routes/notfound';

const App = () => {

    return (
        <BrowserRouter>
            {/* Routes */}
            <Routes>
                <Route path= "/" element={<Root />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/products" element={<Products />} />
                <Route path="/not-found" element={<NotFound />} />

                <Route path="*" element={<Navigate to="/not-found" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;