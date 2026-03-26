import PageTitle from "../components/title";
import Navbar from "../components/navbar";
import validate from "../components/validate";

import { useEffect, useState } from 'react';
import axios from 'axios';

function Root() {

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
                    <PageTitle title="Home" />
                    <Navbar logged={logged} />
                    <h1>Homepage</h1>
                </>
            }
        </>

    )
}

export default Root;