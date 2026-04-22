import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import validate from "../components/validate";
import Base from '../components/base';

function Profile() {
    const [logged, setLogged] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    const [userData, setUserData] = useState(null);

    const [newCard, setNewCard] = useState({
        number: '',
        type: '',
        exp_month: '',
        exp_year: '',
        security_code: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function loadProfile(){
            const valid = await validate();
            if (!valid){
                navigate('/');
                return;
            }
            setLogged(true);

            //load information
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/settings',{
                    headers: {Authorization: token }
                });
                setUserData(res.data);
            } catch (err) {
                console.log('error', err);
            }
            setLoadDone(true);
        }
        loadProfile();
    },[navigate]);

    //add card
    const addCard = async (e) =>{
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('/api/add-card', newCard, {
            headers: { Authorization: token }
        });
        alert('Card added successfully.');
        window.location.reload();
    };

    //remove card
    const removeCard = async (num) => {
        const token = localStorage.getItem('token');
        await axios.post('/api/remove-card',{ number: num },{
            headers: { Authorization: token }
        });
        alert('Card removed successfully.');
        window.location.reload();
    };

    //request password change
    const requestPasswordChange = async () => {
        const token = localStorage.getItem('token');
        await axios.post('/api/request-password-change',{},{
            headers: { Authorization: token }
        });
        alert('Request sent successfully.');
    };


    return (
        <>
            {loadDone && (
                <>
                    <Base title="Profile" logged={logged} />
                    <h1>Profile</h1>
                    <div>
                        {userData ? (
                            <div>
                                {/*Profile*/}
                                <div>
                                    <h3>Personal profile</h3>
                                    <p>Email: {userData.email}</p>
                                    <p>First Name: {userData.bidder?.first_name}</p>
                                    <p>Last Name: {userData.bidder?.last_name}</p>
                                    <p>Age: {userData.bidder?.age}</p>
                                    <p>Major: {userData.bidder?.major}</p>
                                </div>

                                <br/>

                                {/*address*/}
                                <div>
                                    <h3>Address</h3>
                                    {userData.address ? (
                                        <div>
                                            <p>Street: {userData.address.street_num} {userData.address.street_name}</p>
                                            <p>Zipcode: {userData.address.zipcode}</p>
                                        </div>
                                    ) : (
                                        <p>No address</p>
                                    )}
                                </div>

                                <br/>

                                {/*card*/}
                                <div>
                                    <h3>Credit Cards</h3>
                                    {userData.credit_cards.map((card,i) => (
                                        <div key = {i}>
                                            {card.number} ({card.type})
                                            <button onClick = {() => removeCard(card.full_number)}>
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <br/>

                                {/*add card*/}
                                <div>
                                    <h3>Add New Card</h3>
                                    <from onSubmit = {addCard}>
                                        <input placeholder="Card Number" value = {newCard.number} onChange={(e) => setNewCard({...newCard, number: e.target.value })}required /><br />
                                        <select value={newCard.type} onChange={(e) => setNewCard({...newCard, type: e.target.value })}>
                                            <option>Master</option>
                                            <option>Discover</option>
                                            <option>Visa</option>
                                            <option>American Express</option>
                                        </select><br />

                                        <input placeholder='MM' value={newCard.exp_month} onChange={(e) => setNewCard({...newCard, exp_month: e.target.value })} required />
                                        <input placeholder='YY' value={newCard.exp_year} onChange={(e) => setNewCard({...newCard, exp_year: e.target.value})} required /><br />

                                        <input placeholder='CVV' value={newCard.security_code} onChange={(e) => setNewCard({...newCard,security_code: e.target.value})} required /><br />
                                        <button type="submit">Add Card</button>
                                    </from>
                                </div>

                                <br/>

                                {/*request password change*/}
                                <div>
                                    <h3>Password Change</h3>
                                    <button onClick={requestPasswordChange}>
                                        Request Password Change
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>Loading settings...</p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

export default Profile;
