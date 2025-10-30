"use client";
import { useSession, signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const LogoutButton = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        toast.loading("Signing you out...", {
            style: {
                background: "#ecfdf5",
                color: "#047857",
            },
            iconTheme: {
                primary: "#ecfdf5",
                secondary: "#047857",
            },
        })

        queryClient.removeQueries({queryKey: ["session"] });//Clear cached session
        await signOut({
            //redirect: false,
            callbackUrl: "/login",
        });

        toast.dismiss();
        toast.success("Signed out successfully", {
            iconTheme: {
                primary: "#ecfdf5",
                secondary: "#047857",
            },
        });
        //router.push("/login")
    };

    return (
        <button
            onClick={handleLogout}
            className="text-emerald-700 bg-white hover:cursor-pointer flex flex-row items-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                    <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"></path>
                    <path d="M9 12h12l-3-3m0 6l3-3"></path>
                </g>
            </svg>
        </button>
    )
}

export default LogoutButton;
