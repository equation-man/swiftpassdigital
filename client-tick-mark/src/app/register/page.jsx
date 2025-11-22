/// Registration page.
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { registerUserFn, registerOrgFn } from "./actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

const UserRegistrationPage = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["registerUser"],
        mutationFn: (inputs) => registerUserFn(inputs),
        onSuccess: () => {
            toast.dismiss();
            toast.success("Registration successful", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            router.push("/login");
        },
        onError: () => {
            toast.error("Registration failed");
        }
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(inputs);
    };

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
                <h3 className="font-semibold text-xl max-w-xs md:max-w-sm">
                    Swift and effortless <span className="text-emerald-700">ticketing</span> for events.
                </h3>
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">First name</label>
                            <input onChange={handleChange} name="first_name" className="input validator w-full" type="text" required placeholder="first name" />
                        </div>
                        <div>
                            <label className="font-medium text-gray-600">Last name</label>
                            <input onChange={handleChange} name="last_name" className="input validator w-full" type="text" required placeholder="last name" />
                        </div>
                    </div>

                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                    </div>

                    <div>
                        <label className="font-medium text-gray-600">Telephone</label>
                        <input onChange={handleChange} name="telephone" className="input validator w-full" type="text" required placeholder="telephone" />
                    </div>

                    <div>
                        <label className="font-medium text-gray-600">Username</label>
                        <input onChange={handleChange} name="username" className="input validator w-full" type="text" required placeholder="username" />
                    </div>

                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">Password</label>
                            <input onChange={handleChange} name="password" className="input validator w-full" type="password" required placeholder="********" autoComplete="current-password"/>
                        </div>
                        <div>
                            <label className="font-medium text-gray-600">Confirm password</label>
                            <input onChange={handleChange} name="confirm_password" className="input validator w-full" type="password" required placeholder="********" autoComplete="current-password"/>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Create Account
                    </button>

                    <p className="text-sm py-1">
                        Already have an account? <Link href="/login" className="text-emerald-600 underline">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

const RegistrationPage = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState({});
    const [passwordError, setPasswordError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    };

    // Password strength validation.
    const isStrongPassword = (pwd) => {
        return /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(pwd);
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["registerOrg"],
        mutationFn: (inputs) => registerOrgFn(inputs),
        onSuccess: () => {
            toast.dismiss();
            toast.success("Registration successful", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            router.push("/login");
        },
        onError: () => {
            toast.error("Registration failed");
        }
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        // Added matching password check
        if (inputs.org_pwd !== inputs.confirm_password) {
            setPasswordError("Passwords do not match");
            toast.error("Passwords do not match");
            return;
        }

        // Strong password check
        if (!isStrongPassword(inputs.org_pwd)) {
            setPasswordError("Password should be at least 8 characters long and include atleast 1 number and 1 special chaaracter.");
            toast.error("Weak password")
            return;
        }

        setPasswordError("");
        mutation.mutate(inputs);
    };

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
                <h3 className="font-semibold text-xl max-w-xs md:max-w-sm">
                    Swift and effortless <span className="text-emerald-700">ticketing</span> for events.
                </h3>
            </div>

            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Organization Name</label>
                        <input onChange={handleChange} name="organization_name" className="input validator w-full" type="text" required placeholder="organization_name" />
                    </div>

                    <div>
                        <label className="font-medium text-gray-600">Organization Email</label>
                        <input onChange={handleChange} name="org_email" className="input validator w-full" type="email" required placeholder="organization email" />
                    </div>

                    <div>
                        <label className="font-medium text-gray-600">Country</label>
                        <input onChange={handleChange} name="country" className="input validator w-full" type="text" required placeholder="country" />
                    </div>

                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">Password</label>
                            <div className="relative w-full">
                                <input
                                    onChange={handleChange}
                                    name="org_pwd"
                                    className="input validator w-full"
                                    type={showPass ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    placeholder="********" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-gray-600">Confirm password</label>
                            <div className="relative w-full">
                                <input
                                    onChange={handleChange}
                                    name="confirm_password"
                                    className="input validator w-full"
                                    type={showPass ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    placeholder="********" 
                                />
                                <button
                                  type="button"
                                  onMouseDown={() => setShowPass(true)}
                                  onMouseUp={() => setShowPass(false)}
                                  onMouseLeave={() => setShowPass(false)}
                                  onTouchStart={() => setShowPass(true)}
                                  onTouchEnd={() => setShowPass(false)}
                                  className="absolute right-2 top-2 z-10 text-emerald-800 hover:cursor-pointer"
                                >
                                  {showPass ? <EyeOff size={25} /> : <Eye size={25} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/*Password UI error*/}
                    {passwordError && (<p className="text-red-600 text-sm mt-1">{passwordError}</p>)}

                    <p className="font-semibold text-sm">Signing up means you have agreed to our  <Link href="/terms-of-service" className="underline text-emerald-600 hover:cursor-pointer">terms of service</Link></p>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Create Account
                    </button>

                    <p className="text-sm py-1">
                        Already have an account? <Link href="/login" className="text-emerald-600 underline">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;

