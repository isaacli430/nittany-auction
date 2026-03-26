
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import validate from "../components/validate";
import Base from '../components/base';

const Login = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [badLogin, setBadLogin] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    const logged = false;
    const navigate = useNavigate();

    useEffect(() => {

        validate().then((resp) => {
            if (resp == true) {
                navigate('/');
            }

            setLoadDone(true);
        })

    });


    const onSubmit = (data) => {
        axios.post("http://localhost:5000/api/login", {
            email: data.email,
            password: data.password
        })
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                navigate('/');
            })
            .catch((error) => {
                console.log(error);
                setBadLogin(true);
            })
    };

    return (
        <>
            {loadDone &&
                <>
                    <Base title="Login" logged={logged} />
                    <h1>Login</h1>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <input placeholder="Email address" {...register("email", {
                            required: {
                                value: true,
                                message: "Email is required."
                            },
                            validate: (value) =>
                                /^.+@.+\..+$/.test(value) || "Invalid email address."
                        })} />

                        {errors.email && <p>{errors.email.message}</p>}

                        <br />

                        <input placeholder="Password" type="password" {...register("password", {
                            required: {
                                value: true,
                                message: "Password is required."
                            },
                        })} />

                        {errors.password && <p>{errors.password.message}</p>}

                        <br />

                        <button type="submit">Log in</button>
                    </form>

                    {badLogin && <p>Incorrect credentials!</p>}
                </>
            }
        </>
    )
}

export default Login;