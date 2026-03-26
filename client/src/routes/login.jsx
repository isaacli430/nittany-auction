
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
        axios.post("http://127.0.0.1:5000/api/login", {
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

                    <div className='flex justify-center items-center h-full'>

                        <div className='flex flex-col shadow-lg bg-white rounded-sm p-10'>
                            <h1 className='text-2xl mb-5'><b>Login</b></h1>

                            <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)} noValidate>

                                <input className={'login-input ' + ((errors.email || badLogin) && 'border-red-500!')} placeholder="Email address" {...register("email", {
                                    required: {
                                        value: true,
                                        message: "Email is required."
                                    },
                                    validate: (value) =>
                                        /^.+@.+\..+$/.test(value) || "Invalid email address."
                                })} />

                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.email && (<>{errors.email.message}</>)}
                                </i></p>

                                <input className={'login-input ' + ((errors.password || badLogin) && 'border-red-500!')} placeholder="Password" type="password" {...register("password", {
                                    required: {
                                        value: true,
                                        message: "Password is required."
                                    },
                                })} />

                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.password && (<>{errors.password.message}</>)}
                                    {(!errors.password && badLogin) && (<>Couldn't find your account.</>)}
                                </i></p>

                                <button type="submit" className='bg-slate-300 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer'>Log in</button>
                            </form>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default Login;