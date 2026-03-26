import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Root from "./routes/root";
import Login from "./routes/login";
import Logout from "./routes/logout";

const App = () => {
    return (
        <BrowserRouter>
            {/* Routes */}
            <Routes>
                <Route path= "/" element={<Root />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;