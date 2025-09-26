/// The login page
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { loginUserFn, loginOrgFn } from "./actions";
import { LoginUser, LoginOrg } from "@/types/types";
import { useSession, signIn } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UserLoginPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [inputs, setInputs] = useState<LoginUser | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            toast.loading("Signing you in...", {
                style: {
                    background: "#ecfdf5",
                    color: "#047857",
                },
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });

            const res = await signIn("credentials", {
                redirect: false, // Prevents redirects
                email: inputs.email,
                password: inputs.password,
            });

            toast.dismiss();
            if (res?.error) {
                toast.error("Invalid credentials");
            } else {
                toast.success("Welcome back! Redirecting...", {
                    iconTheme: {
                        primary: "#ecfdf5",
                        secondary: "#047857",
                    },
                });
                router.push(`/organizations/${session.user.user_id}`)
            }
        } catch (err) {
            toast.dismiss();
            toast.error("Something went wrong, try again!")
        }
    }

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} id="email" name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Password</label>
                        <input onChange={handleChange} id="password" name="password" className="input validator w-full" type="password" required placeholder="********" />
                    </div>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Login
                    </button>
                    <p className="text-sm py-1">Don&apos;t have an account? <Link href="/register" className="text-emerald-600 underline">Signup here</Link></p>
                </form>
                {/*<p className="text-gray-600 text-center my-2">OR</p>
                <button className="btn btn-block bg-emerald-300 w-full md:max-w-md border border-emerald-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 48 48">
                        <path fill="#ffc107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"></path>
                        <path fill="#ff3d00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"></path>
                        <path fill="#4caf50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"></path>
                        <path fill="#1976d2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"></path>
                    </svg>
                    Continue with Google
                    </button>*/}
            </div>
        </div>
    );
};

const LoginPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [inputs, setInputs] = useState<LoginUser | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            toast.loading("Signing you in...", {
                style: {
                    background: "#ecfdf5",
                    color: "#047857",
                },
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });

            const res = await signIn("credentials", {
                redirect: false, // Prevents redirects
                org_email: inputs.email,
                org_pwd: inputs.password,
            });

            toast.dismiss();
            if (res?.error) {
                toast.error("Invalid credentials");
            } else {
                toast.success("Welcome back! Redirecting...", {
                    iconTheme: {
                        primary: "#ecfdf5",
                        secondary: "#047857",
                    },
                });
                router.push(`/organizations/${session.user.organization_id}`)
            }
        } catch (err) {
            toast.dismiss();
            toast.error("Something went wrong, try again!")
        }
    }

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} id="email" name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Password</label>
                        <input onChange={handleChange} id="password" name="password" className="input validator w-full" type="password" required placeholder="********" />
                    </div>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Login
                    </button>
                    <p className="text-sm py-1">Don&apos;t have an account? <Link href="/register" className="text-emerald-600 underline">Signup here</Link></p>
                </form>
                {/*<p className="text-gray-600 text-center my-2">OR</p>
                <button className="btn btn-block bg-emerald-300 w-full md:max-w-md border border-emerald-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 48 48">
                        <path fill="#ffc107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"></path>
                        <path fill="#ff3d00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"></path>
                        <path fill="#4caf50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"></path>
                        <path fill="#1976d2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"></path>
                    </svg>
                    Continue with Google
                    </button>*/}
            </div>
        </div>
    );
};

export default LoginPage;
