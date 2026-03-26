import PageTitle from "../components/title";
import Navbar from "../components/navbar";
import validate from "../components/validate";

import { useEffect, useState } from 'react';

function Products() {

    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    useEffect(() => {
        validate().then((resp) => {
            setLogged(resp);
            setLoadDone(true);
        })
    });

    return (
        <>
            {loadDone &&
                <>
                    <PageTitle title="Products" />
                    <Navbar logged={logged} />
                    <h1>Products</h1>
                </>
            }
        </>

    )
}

export default Products;