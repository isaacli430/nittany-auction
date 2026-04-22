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
                    <div>
                        {userData ? (
                            <div className="grid grid-cols-2 mt-5 ml-5">
                                {/*Profile*/}
                                <div className="flex flex-col rounded-sm border border-gray-300 m-5">
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p><b>Personal Details</b></p>
                                    </div>
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p className="text-slate-500">Email</p>
                                        <p>{userData.email}</p>
                                    </div>
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p className="text-slate-500">First Name</p>
                                        <p>{userData.bidder?.first_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p className="text-slate-500">Last Name</p>
                                        <p>{userData.bidder?.last_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p className="text-slate-500">Age</p>
                                        <p>{userData.bidder?.age}</p>
                                    </div>
                                    <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                        <p className="text-slate-500">Major</p>
                                        <p>{userData.bidder?.major}</p>
                                    </div>
                                    {userData.address ? (
                                        <>
                                            <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                                <p className="text-slate-500">Street</p>
                                                <p>{userData.address.street_num} {userData.address.street_name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                                <p className="text-slate-500">Zipcode</p>
                                                <p>{userData.address.zipcode}</p>
                                            </div>
                                        </>
                                    ):<></>}
                                    {userData.rating ? (
                                        <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                                            <p className="text-slate-500">Rating</p>
                                            <p>{userData.rating} / 5</p>
                                        </div>
                                    ):<></>}
                                </div>
                                

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

                                {/*add card*/}
                                <div className="flex flex-col rounded-sm border border-gray-300 m-5">
                                    <h3>Add New Card</h3>
                                    <form onSubmit = {addCard} className="flex flex-col" noValidate>
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
                                    </form>
                                </div>

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
