/// The login page
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession, signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
const UserLoginPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [inputs, setInputs] = useState({ email: "", password: "" });
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => (Object.assign(Object.assign({}, values), { [name]: value })));
    };
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
            if (res === null || res === void 0 ? void 0 : res.error) {
                toast.error("Invalid credentials");
            }
            else {
                toast.success("Welcome back! Redirecting...", {
                    iconTheme: {
                        primary: "#ecfdf5",
                        secondary: "#047857",
                    },
                });
                router.push(`/organizations/${session === null || session === void 0 ? void 0 : session.user.user_id}`);
            }
        }
        catch (err) {
            toast.dismiss();
            toast.error("Something went wrong, try again!");
        }
    };
    return (<div className="flex flex-col items-center h-screen">
            <div className="mt-25">
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} id="email" name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com"/>
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Password</label>
                        <input onChange={handleChange} id="password" name="password" className="input validator w-full" type="password" required placeholder="********"/>
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
        </div>);
};
const OrgLoginPage = () => {
    const router = useRouter();
    const { update, data: session, status } = useSession();
    const [inputs, setInputs] = useState({});
    const [showPass, setShowPass] = useState(false);
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => (Object.assign(Object.assign({}, values), { [name]: value })));
    };
    const mutation = useMutation({
        mutationFn: async ({ email, password }) => {
            var _a, _b;
            const res = await signIn("credentials", { redirect: false, org_email: email, org_pwd: password });
            if (!(res === null || res === void 0 ? void 0 : res.ok))
                throw new Error((res === null || res === void 0 ? void 0 : res.error) || "Invalid credentials");
            const session = await update();
            if (!((_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.organization_id))
                throw new Error("Session missing user id");
            return session;
        },
        onSuccess: (session) => {
            var _a, _b;
            toast.dismiss();
            toast.success("Welcome back! Redirecting...", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            router.push(`/organizations/${(_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.organization_id}`);
        },
        onError: (error) => {
            toast.dismiss();
            toast.error("Invalid credentials");
        }
    });
    const handleSubmit = async (event) => {
        event.preventDefault();
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
        mutation.mutate({ email: inputs.email, password: inputs.password });
    };
    return (<div className="flex flex-col items-center h-screen">
            <div className="mt-25">
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input onChange={handleChange} id="email" name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com"/>
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Password</label>
                        <div className="relative w-full">
                            <input onChange={handleChange} id="password" name="password" className="input validator w-full" type={showPass ? "text" : "password"} required placeholder="********"/>
                            <button type="button" onClick={() => setShowPass(true)} onMouseDown={() => setShowPass(true)} onMouseUp={() => setShowPass(false)} onMouseLeave={() => setShowPass(false)} onTouchStart={() => setShowPass(true)} onTouchEnd={() => setShowPass(false)} className="absolute right-2 top-2 z-10 text-emerald-800 hover:cursor-pointer">
                                {showPass ? <EyeOff size={25}/> : <Eye size={25}/>}
                            </button>
                        </div>
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
        </div>);
};
const DefaultOrgAccess = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [inputs, setInputs] = useState({});
    const [showPass, setShowPass] = useState(false);
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => (Object.assign(Object.assign({}, values), { [name]: value })));
    };
    const mutation = useMutation({
        mutationFn: async ({ access_username, access_code }) => {
            var _a, _b;
            const res = await signIn("credentials", { redirect: false, access_username: access_username, access_code: access_code });
            if (!(res === null || res === void 0 ? void 0 : res.ok))
                throw new Error((res === null || res === void 0 ? void 0 : res.error) || "Invalid credentials");
            const sessionRes = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
            const session = await sessionRes.json();
            if (!((_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.organization_id))
                throw new Error("Session missing user id");
            return session;
        },
        onSuccess: (session) => {
            var _a, _b;
            toast.dismiss();
            toast.success("Welcome back! Redirecting...", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            router.push(`/organizations/${(_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.organization_id}`);
        },
        onError: (error) => {
            console.log("The error at login is", error);
            toast.dismiss();
            toast.error("Invalid credentials");
        }
    });
    const handleSubmit = async (event) => {
        event.preventDefault();
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
        mutation.mutate({ access_username: inputs.access_username, access_code: inputs.access_code });
    };
    return (<div className="flex flex-col items-center h-screen">
            <div className="mt-25">
            </div>
            <div className="flex flex-col items-center py-3">
                <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Access Name</label>
                        <input onChange={handleChange} id="access_useranme" name="access_username" className="input validator w-full" type="text" required placeholder="Enter access username"/>
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Access Code</label>
                        <div className="relative w-full">
                            <input onChange={handleChange} id="access_code" name="access_code" className="input validator w-full" type={showPass ? "text" : "password"} required placeholder="********"/>
                            <button type="button" onMouseDown={() => setShowPass(true)} onMouseUp={() => setShowPass(false)} onMouseLeave={() => setShowPass(false)} onTouchStart={() => setShowPass(true)} onTouchEnd={() => setShowPass(false)} className="absolute right-2 top-2 z-10 text-emerald-800 hover:cursor-pointer">
                                {showPass ? <EyeOff size={25}/> : <Eye size={25}/>}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Login
                    </button>
                    <p className="text-sm py-1">If you can't login, request logins from your admin</p>
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
        </div>);
};
const LoginPage = () => {
    const [adminLogin, setAdminLogin] = useState(true);
    return (<div className="flex flex-col items-center justify-center">
            <div className="items-center flex gap-x-2">
                <button className={`${adminLogin && "border-b border-5px border-emerald-800"}`} onClick={() => setAdminLogin(true)}>Admin</button>
                <button className={`${!adminLogin && "border-b border-5px border-emerald-800"}`} onClick={() => setAdminLogin(false)}>User</button>
            </div>
            {adminLogin ? (<OrgLoginPage />) : (<DefaultOrgAccess />)}
        </div>);
};
export default LoginPage;
