/// The login page
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

const OrgLoginPage = () => {
  const router = useRouter();
  const { update } = useSession();
  const [inputs, setInputs] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await signIn("credentials", { redirect: false, org_email: email, org_pwd: password });
      if (!res?.ok) throw new Error(res?.error || "Invalid credentials");

      const session = await update();
      if (!session?.user?.user?.organization_id) throw new Error("Session missing user id");

      return session;
    },
    onSuccess: (session) => {
      toast.dismiss();
      toast.success("Welcome back! Redirecting...", {
        iconTheme: { primary: "#ecfdf5", secondary: "#047857" },
      });
      router.push(`/organizations/${session?.user?.user?.organization_id}`);
    },
    onError: () => {
      toast.dismiss();
      toast.error("Invalid credentials");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.loading("Signing you in...", { style: { background: "#ecfdf5", color: "#047857" } });
    mutation.mutate({ email: inputs.email, password: inputs.password });
  };

  return (
    <div className="flex flex-col items-center h-screen py-3">
      <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
        <div>
          <label className="font-medium text-gray-600">Email</label>
          <input onChange={handleChange} name="email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" autoComplete="current-password"/>
        </div>
        <div>
          <label className="font-medium text-gray-600">Password</label>
          <div className="relative w-full">
            <input
              onChange={handleChange}
              name="password"
              className="input validator w-full"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              required
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
        <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">Login</button>
        <p className="text-sm py-1">Don&apos;t have an account? <Link href="/register" className="text-emerald-600 underline">Signup here</Link></p>
      </form>
    </div>
  );
};

const DefaultOrgAccess = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: async ({ access_username, access_code }) => {
      const res = await signIn("credentials", { redirect: false, access_username, access_code });
      if (!res?.ok) throw new Error(res?.error || "Invalid credentials");

      const sessionRes = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
      const session = await sessionRes.json();

      if (!session?.user?.user?.organization_id) throw new Error("Session missing user id");

      return session;
    },
    onSuccess: (session) => {
      toast.dismiss();
      toast.success("Welcome back! Redirecting...", {
        iconTheme: { primary: "#ecfdf5", secondary: "#047857" },
      });
      router.push(`/organizations/${session?.user?.user?.organization_id}`);
    },
    onError: () => {
      toast.dismiss();
      toast.error("Invalid credentials");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.loading("Signing you in...", { style: { background: "#ecfdf5", color: "#047857" } });
    mutation.mutate({ access_username: inputs.access_username, access_code: inputs.access_code });
  };

  return (
    <div className="flex flex-col items-center h-screen py-3">
      <form onSubmit={handleSubmit} className="max-w-xs md:max-w-sm">
        <div>
          <label className="font-medium text-gray-600">Access Name</label>
          <input onChange={handleChange} name="access_username" className="input validator w-full" type="text" required placeholder="Enter access username" />
        </div>
        <div>
          <label className="font-medium text-gray-600">Access Code</label>
          <div className="relative w-full">
            <input
              onChange={handleChange}
              name="access_code"
              className="input validator w-full"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              required
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
        <button type="submit" className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">Login</button>
        <p className="text-sm py-1">If you can't login, request logins from your admin</p>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const [adminLogin, setAdminLogin] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-x-2 mb-4">
        <button className={adminLogin ? "border-b-2 border-emerald-800" : ""} onClick={() => setAdminLogin(true)}>Admin</button>
        <button className={!adminLogin ? "border-b-2 border-emerald-800" : ""} onClick={() => setAdminLogin(false)}>User</button>
      </div>
      {adminLogin ? <OrgLoginPage /> : <DefaultOrgAccess />}
    </div>
  );
};

export default LoginPage;

