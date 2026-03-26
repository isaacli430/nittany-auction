import { useEffect } from 'react';

const PageTitle = ({ title }) => {

    useEffect(() => {
        document.title = "Nittany Auction | " + title;
    }, []);

    return null;
};

export default PageTitle;