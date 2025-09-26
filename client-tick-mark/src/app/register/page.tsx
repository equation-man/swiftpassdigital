/// Registration page.
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { registerUserFn, registerOrgFn } from "./actions";
import { RegisterUser, RegisterOrg } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UserRegistrationPage = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState<RegisterUser | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['registerUser'],
        mutationFn: (inputs) => registerUserFn(inputs),
        onSuccess: (data) => {
            toast.dismiss(); // Clear loading
            toast.success("Registration successfull", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
            router.push("/login")
        },
        onError: (err: Error) => {
            toast.error("Registration failed")
        }
    });
    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(inputs)
    }

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
                <h3 className="font-semibold text-xl max-w-xs md:max-w-sm">Swift and effortless <span className="text-emerald-700">ticketing</span> for events.</h3>
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">First name</label>
                            <input onChange={handleChange} id="organization_name" name="first_name" className="input validator w-full" type="text" required placeholder="first name" />
                        </div>
                        <div>
                            <label className="font-medium text-gray-600">Last name</label>
                            <input onChange={handleChange} id="last_name" name="last_name" className="input validator w-full" type="text" required placeholder="last name"/>
                        </div>
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} id="email" name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Telephone</label>
                        <input onChange={handleChange} id="telephone" name="telephone" className="input validator w-full" type="text" required placeholder="telephone" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Username</label>
                        <input onChange={handleChange} id="username" name="username" className="input validator w-full" type="text" required placeholder="username" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">Password</label>
                            <input onChange={handleChange} id="password" name="password" className="input validator w-full" type="password" required placeholder="********" />
                        </div>
                        <div>
                            <label className="font-medium text-gray-600">Confirm password</label>
                            <input onChange={handleChange} id="confirm_password" name="confirm_password" className="input validator w-full" type="password" required placeholder="********" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Create Account
                    </button>
                    <p className="text-sm py-1">Already have an account? <Link href="/login" className="text-emerald-600 underline">Login here</Link></p>
                </form>
            </div>
        </div>
    );
};

const RegistrationPage = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState<RegisterOrg | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['registerUser'],
        mutationFn: (inputs) => registerOrgFn(inputs),
        onSuccess: (data) => {
            toast.dismiss(); // Clear loading
            toast.success("Registration successfull", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
            router.push("/login")
        },
        onError: (err: Error) => {
            toast.error("Registration failed")
        }
    });
    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(inputs)
    }

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
                <h3 className="font-semibold text-xl max-w-xs md:max-w-sm">Swift and effortless <span className="text-emerald-700">ticketing</span> for events.</h3>
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Organization Name</label>
                        <input onChange={handleChange} id="organization_name" name="organization_name" className="input validator w-full" type="text" required placeholder="organization_name" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Organization Email</label>
                        <input onChange={handleChange} id="org_email" name="org_email" className="input validator w-full" type="email" required placeholder="organization email" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Country</label>
                        <input onChange={handleChange} id="country" name="country" className="input validator w-full" type="country" required placeholder="country" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-1">
                        <div>
                            <label className="font-medium text-gray-600">Password</label>
                            <input onChange={handleChange} id="org_pwd" name="org_pwd" className="input validator w-full" type="password" required placeholder="********" />
                        </div>
                        <div>
                            <label className="font-medium text-gray-600">Confirm password</label>
                            <input onChange={handleChange} id="confirm_password" name="confirm_password" className="input validator w-full" type="password" required placeholder="********" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Create Account
                    </button>
                    <p className="text-sm py-1">Already have an account? <Link href="/login" className="text-emerald-600 underline">Login here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
