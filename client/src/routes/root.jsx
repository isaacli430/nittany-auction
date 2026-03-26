import { useEffect, useState } from 'react';
import validate from "../components/validate";
import Base from '../components/base';

function Root() {
    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    useEffect(() => {
        validate().then((resp) => {
            setLogged(resp);
            setLoadDone(true);
        });
    });

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Home" logged={logged} />
                    <h1>Homepage</h1>
                </>
            )}
        </>
    );
}

export default Root;