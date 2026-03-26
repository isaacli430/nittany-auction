import { useEffect } from 'react';

import Navbar from './navbar';

const Base = ({ title, logged }) => {

    useEffect(() => {
        document.title = 'Nittany Auction | ' + title;
    });

    return (
        <>
            <Navbar logged={logged} />
        </>
    )
}

export default Base;