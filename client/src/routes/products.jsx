import { useEffect, useState } from 'react';

import validate from "../components/validate";
import Base from '../components/base';

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
                    <Base title="Products" logged={logged} />
                    <h1>Products</h1>
                </>
            }
        </>

    )
}

export default Products;