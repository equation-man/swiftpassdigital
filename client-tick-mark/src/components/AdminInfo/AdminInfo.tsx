/// Admin info page 
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { myWalletFn } from "./actions";
import { useQuery } from "@tanstack/react-query";

type Props = {
    org: Organization;
};

const AdminInfo = ({ org }: Props) => {
    const [createWallet, setCreateWallet] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleRouteToDashboard = () => {
        if (!!session) {
            router.push()
        } else {
            router.push("/login")
        }
    }

    const handleWalletCreation = (e, value) => {
        e.preventDefault();
        setCreateWallet(value);
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => myWalletFn(org.organization_id),
        onSuccess: (data) => {
            console.log("Wallet fetch success is", data)
        },
        onError: (error) => {
            console.llg("Wallet fetch error is", error)
        }
    });
    console.log("The data and error is", data, error)

    return (
        <div>
            <div>
                <h3 className="text-emerald-500 text-2xl font-bold">Admin Settings</h3>
                <h1 className="font-bold text-xl text-gray-800">{org.organization_name}</h1>
                <div className="text-xs">
                    <h3 className="text-sm">{org.org_email}</h3>
                    <p>{org.organization_username}</p>
                    <p>{org.description}</p>
                </div>
                <div>
                    <div className="w-64 border border-emerald-500 border-2px rounded-sm h-20 py-2 my-3 flex flex-col items-center justify-center hover:cursor-pointer">
                        {data ? (
                            <button className="bg-emerald-700 text-white px-2 py-1 rounded-sm text-sm flex flex-row items-center gap-x-1 hover:cursor-pointer">
                                Edit wallet
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M19 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H20a1 1 0 0 1-1-1"></path>
                                    <path fill="currentColor" fillRule="evenodd" d="M18.6 4H3.4A2.4 2.4 0 0 0 1 6.4v11.2A2.4 2.4 0 0 0 3.4 20h15.2a2.4 2.4 0 0 0 2.4-2.4V16h.4a2.6 2.6 0 0 0 2.6-2.6v-2.8A2.6 2.6 0 0 0 21.4 8H21V6.4A2.4 2.4 0 0 0 18.6 4m-2 6a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h4.8a.6.6 0 0 0 .6-.6v-2.8a.6.6 0 0 0-.6-.6z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        ):(
                            <button onClick={(e) => handleWalletCreation(e, true)}
                                className="bg-emerald-700 text-white px-2 py-1 rounded-sm text-sm flex flex-row items-center gap-x-1 hover:cursor-pointer"
                            >
                                Add wallet
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M19 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H20a1 1 0 0 1-1-1"></path>
                                    <path fill="currentColor" fillRule="evenodd" d="M18.6 4H3.4A2.4 2.4 0 0 0 1 6.4v11.2A2.4 2.4 0 0 0 3.4 20h15.2a2.4 2.4 0 0 0 2.4-2.4V16h.4a2.6 2.6 0 0 0 2.6-2.6v-2.8A2.6 2.6 0 0 0 21.4 8H21V6.4A2.4 2.4 0 0 0 18.6 4m-2 6a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h4.8a.6.6 0 0 0 .6-.6v-2.8a.6.6 0 0 0-.6-.6z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        )}

                    </div>
                    <div>
                        {createWallet && (
                            <div className="max-w-xs md:max-w-sm p-1 shadow-xl border border-emerald-500 border-2px">
                                <form>
                                    <div>
                                        <label className="font-medium text-gray-600">Business Name</label>
                                        <input id="business_name" name="business_name" className="input validator w-full" type="text" required placeholder="Business Name" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Account number</label>
                                        <input id="account_number" name="account_number" className="input validator w-full" type="text" required placeholder="Account No." />
                                    </div>
                                </form>
                                <div className="flex flex-row gap-x-2 my-2">
                                    <button
                                        onClick={(e) => handleWalletCreation(e, false) }
                                        className="hover:cursor-pointer bg-emerald-600 text-white btn-block p-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={(e) => handleWalletCreation(e, false) }
                                        className="hover:cursor-pointer bg-emerald-800 text-white btn-block p-1"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="pt-5">
                <div>
                    <div className="flex flex-row gap-x-2">
                        <h3 className="font-bold text-gray-600 text-2xl">Access</h3>
                        <button
                            className="bg-white text-emerald-700 px-1 text-xs rounded-sm flex flex-row gap-x-1 items-center hover:cursor-pointer border border-emerald-700"
                        >
                            Grant access
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"></path>
                            </svg> 
                        </button>
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-gray-800">No external access granted</p>
                </div>
            </div>
        </div>
    );
}

export default AdminInfo
