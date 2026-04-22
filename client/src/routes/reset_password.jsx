import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// This page lets a user reset their password.
// They just enter their email, type a new password, and confirm it.
function ResetPassword() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [logged, setLogged] = useState(false);

    useEffect(() => {
        validate().then((resp) => {
            setLogged(resp);
        })
    });

    // Watch the new password field so we can compare it with the confirm password box.
    const newPassword = watch("new_password");

    // This checks whether the confirm password field matches the new password field.
    const checkPasswordMatch = (value) => {
        return value === newPassword || "Passwords do not match.";
    };

    // This runs when the form is submitted.
    // It sends the email and new password to the backend.
    const onSubmit = (data) => {
        setSubmitError("");

        axios.post('http://127.0.0.1:5000/api/reset-password', {
            email: data.email,
            new_password: data.new_password
        })
            // If the reset works, show a success message
            // and send the user to the login page after a short delay.
            .then(() => {
                setSubmitSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            })
            // If something fails, show the backend error if there is one.
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setSubmitError(error.response.data.error);
                } else {
                    setSubmitError("Something went wrong. Please try again.");
                }
            });
    };

    return (
        <>
            <Base title="Reset Password" logged={logged} />

            <div className='flex justify-center items-center py-10'>
                <div className='flex flex-col shadow-lg bg-white rounded-sm p-10 w-full max-w-md'>
                    <h1 className='text-2xl mb-2'><b>Reset Password</b></h1>
                    <p className='text-sm text-slate-500 mb-6'>
                        Enter your email and a new password below.
                    </p>

                    {/* Show this success message after the password gets updated */}
                    {submitSuccess && (
                        <div className='bg-green-50 border border-green-300 text-green-700 rounded-sm p-3 mb-5 text-sm'>
                            Password updated successfully! Redirecting to login...
                        </div>
                    )}

                    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Input for the user's email */}
                        <input
                            className={'login-input ' + (errors.email && 'border-red-500!')}
                            placeholder="Email address"
                            type="email"
                            {...register("email", {
                                required: {
                                    value: true,
                                    message: "Email is required."
                                }
                            })}
                        />
                        <p className='login-error'><i>
                            &nbsp;
                            {errors.email && <>{errors.email.message}</>}
                        </i></p>

                        {/* Input for the new password */}
                        <input
                            className={'login-input ' + (errors.new_password && 'border-red-500!')}
                            placeholder="New password"
                            type="password"
                            {...register("new_password", {
                                required: {
                                    value: true,
                                    message: "New password is required."
                                },
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters."
                                }
                            })}
                        />
                        <p className='login-error'><i>
                            &nbsp;
                            {errors.new_password && <>{errors.new_password.message}</>}
                        </i></p>

                        {/* Input to make sure the user typed the same new password twice */}
                        <input
                            className={'login-input ' + (errors.confirm_password && 'border-red-500!')}
                            placeholder="Confirm new password"
                            type="password"
                            {...register("confirm_password", {
                                required: {
                                    value: true,
                                    message: "Please confirm your password."
                                },
                                validate: checkPasswordMatch
                            })}
                        />
                        <p className='login-error'><i>
                            &nbsp;
                            {errors.confirm_password && <>{errors.confirm_password.message}</>}
                        </i></p>

                        {/* Show backend error messages here if the reset fails */}
                        {submitError && (
                            <p className='text-red-500 text-sm mb-3'><i>{submitError}</i></p>
                        )}

                        {/* Button to submit the reset form */}
                        <button
                            type="submit"
                            className='bg-slate-300 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer mt-2'
                        >
                            Reset Password
                        </button>

                        {/* Link back to the login page if the user remembers their password */}
                        <p className='text-sm text-slate-400 mt-4'>
                            Remembered your password?{' '}
                            <Link to="/login" className='text-blue-500 hover:underline'>
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;