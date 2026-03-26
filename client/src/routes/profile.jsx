import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import validate from "../components/validate";
import Base from '../components/base';

function Profile() {
    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        validate().then((resp) => {

            if (!resp) {
                navigate('/');
            }

            setLogged(true);
            setLoadDone(true);
        })

    });

    return (
        <>
            {loadDone && (
                <>
                    <Base title="Profile" logged={logged} />
                    <h1>Profile</h1>
                </>
            )}
        </>
    );
}

export default Profile;