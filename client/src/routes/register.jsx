import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import validate from "../components/validate";
import Base from '../components/base';

// Main register page component
// This handles the full sign up form, field validation and sending the user data to the backend
const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    // Watching the password field so we can compare it with confirm password in real time
    const password = watch("password");

    // Stores any backend error message if the registration fails
    const [registerError, setRegisterError] = useState("");

    // Used so that the page waits until login checking is finished before showing the form
    const [loadDone, setLoadDone] = useState(false);

    // This page is for the users who are not logged in yet
    const logged = false;
    const navigate = useNavigate();

    // Simple email checker
    // This just makes sure that the user typed something that looks like an email
    const checkEmail = (value) => {
        return /^.+@.+\..+$/.test(value) || "Invalid email address.";
    };

    // Confirm password checker
    // This makes sure that the second password box matches whatever was typed in the password field
    const checkPasswordMatch = (value) => {
        return value === password || "Passwords do not match.";
    };

    // Runs once when the page loads
    // The main point here is to stop logged in users from accessing the register page again
    useEffect(() => {
        // Calls the helper function that checks whether the user already has a valid login session
        const checkIfLoggedIn = async () => {
            const resp = await validate();

            // If the user is already logged in then send them back to the home page
            if (resp === true) {
                navigate('/');
            }

            // Once the login check is finished, it allows the page content to render
            setLoadDone(true);
        };

        checkIfLoggedIn();
    }, [navigate]);

    // Runs after the form passes all frontend validation
    // This sends the registration data to the backend API and handles success or failure
    const onSubmit = (data) => {
        // Clears old error messages before trying again
        setRegisterError("");

        axios.post("http://127.0.0.1:5000/api/register", {
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            age: data.age,
            major: data.major,
            street_num: data.street_num,
            street_name: data.street_name,
            zipcode: data.zipcode
        })
            // If registration works then send the user to the home page
            .then(() => {
                navigate('/');
            })
            // If something fails then show a useful error message on the page
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error) {
                    setRegisterError(error.response.data.error);
                } else {
                    setRegisterError("Something went wrong. Please try again.");
                }
            });
    };

    return (
        <>
            {loadDone &&
                <>
                    <Base title="Register" logged={logged} />

                    <div className='flex justify-center items-center py-10'>
                        <div className='flex flex-col shadow-lg bg-white rounded-sm p-10 w-full max-w-md'>
                            <h1 className='text-2xl mb-5'><b>Create Account</b></h1>

                            <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)} noValidate>
                                <p className='text-sm text-gray-500 mb-1 mt-2'>Account Info</p>

                                {/* Email field for the users login email */}
                                <input
                                    className={'login-input ' + ((errors.email || registerError) && 'border-red-500!')}
                                    placeholder="Email address"
                                    {...register("email", {
                                        required: {
                                            value: true,
                                            message: "Email is required."
                                        },
                                        validate: checkEmail
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.email && <>{errors.email.message}</>}
                                </i></p>

                                {/* Password field for the account password */}
                                <input
                                    className={'login-input ' + (errors.password && 'border-red-500!')}
                                    placeholder="Password"
                                    type="password"
                                    {...register("password", {
                                        required: {
                                            value: true,
                                            message: "Password is required."
                                        },
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.password && <>{errors.password.message}</>}
                                </i></p>

                                {/* Second password field so the user can confirm that they typed it correctly */}
                                <input
                                    className={'login-input ' + (errors.confirmPassword && 'border-red-500!')}
                                    placeholder="Confirm password"
                                    type="password"
                                    {...register("confirmPassword", {
                                        required: {
                                            value: true,
                                            message: "Please confirm your password."
                                        },
                                        validate: checkPasswordMatch
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.confirmPassword && <>{errors.confirmPassword.message}</>}
                                </i></p>

                                <p className='text-sm text-gray-500 mb-1 mt-4'>Personal Info</p>

                                {/* Users first name */}
                                <input
                                    className={'login-input ' + (errors.first_name && 'border-red-500!')}
                                    placeholder="First name"
                                    {...register("first_name", {
                                        required: {
                                            value: true,
                                            message: "First name is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.first_name && <>{errors.first_name.message}</>}
                                </i></p>

                                {/* Users last name */}
                                <input
                                    className={'login-input ' + (errors.last_name && 'border-red-500!')}
                                    placeholder="Last name"
                                    {...register("last_name", {
                                        required: {
                                            value: true,
                                            message: "Last name is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.last_name && <>{errors.last_name.message}</>}
                                </i></p>

                                {/* Age input */}
                                <input
                                    className={'login-input ' + (errors.age && 'border-red-500!')}
                                    placeholder="Age"
                                    type="number"
                                    {...register("age", {
                                        required: {
                                            value: true,
                                            message: "Age is required."
                                        },
                                        min: {
                                            value: 1,
                                            message: "Please enter a valid age."
                                        },
                                        max: {
                                            value: 120,
                                            message: "Please enter a valid age."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.age && <>{errors.age.message}</>}
                                </i></p>

                                {/* Users major */}
                                <input
                                    className={'login-input ' + (errors.major && 'border-red-500!')}
                                    placeholder="Major"
                                    {...register("major", {
                                        required: {
                                            value: true,
                                            message: "Major is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.major && <>{errors.major.message}</>}
                                </i></p>

                                <p className='text-sm text-gray-500 mb-1 mt-4'>Address</p>

                                {/* House number or building number in the address */}
                                <input
                                    className={'login-input ' + (errors.street_num && 'border-red-500!')}
                                    placeholder="Street number"
                                    type="number"
                                    {...register("street_num", {
                                        required: {
                                            value: true,
                                            message: "Street number is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.street_num && <>{errors.street_num.message}</>}
                                </i></p>

                                {/* Street name in the address */}
                                <input
                                    className={'login-input ' + (errors.street_name && 'border-red-500!')}
                                    placeholder="Street name"
                                    {...register("street_name", {
                                        required: {
                                            value: true,
                                            message: "Street name is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.street_name && <>{errors.street_name.message}</>}
                                </i></p>

                                {/* Zipcode for the users address */}
                                <input
                                    className={'login-input ' + (errors.zipcode && 'border-red-500!')}
                                    placeholder="Zipcode"
                                    type="number"
                                    {...register("zipcode", {
                                        required: {
                                            value: true,
                                            message: "Zipcode is required."
                                        }
                                    })}
                                />
                                <p className='login-error'><i>
                                    &nbsp;
                                    {errors.zipcode && <>{errors.zipcode.message}</>}
                                </i></p>

                                {/* Shows backend error messages like duplicate email or failed registration */}
                                {registerError && (
                                    <p className='text-red-500 text-sm mb-3'><i>{registerError}</i></p>
                                )}

                                {/* Submit button for creating the account */}
                                <button
                                    type="submit"
                                    className='bg-slate-300 w-fit pt-1 pb-1 pr-4 pl-4 rounded-sm hover:brightness-80 cursor-pointer mt-2'
                                >
                                    Create Account
                                </button>

                                {/* Link for users who already have an account */}
                                <p className='text-sm text-gray-500 mt-4'>
                                    Already have an account?{" "}
                                    <Link to="/login" className='text-blue-600 hover:underline'>Log in</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </>
            }
        </>
    );
};

export default Register;