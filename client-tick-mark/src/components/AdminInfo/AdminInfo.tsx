/// Admin info page 
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { UsersAccessInfo, Organization } from "@/types/types";
import { deleteUserAccessFn, getUserAccessListFn, myWalletFn, createMpesaWalletFn, createUserAccessFn } from "./actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
    org: Organization;
};

const AddUserAccess = ({ o_id }: { o_id: string }) => {
    const [inputs, setInputs] = useState<CreateEvent | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['createAccess'],
        mutationFn: (inputs) => createUserAccessFn(inputs),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["accessors"]});
            toast.dismiss();
            toast.success("New access granted!", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
        },
        onError: (err: Error) => {
            toast.dismiss();
            toast.error("Failed granting access!");
        }
    });

    const handleUserAccessSubmit = async (event) => {
        event.preventDefault();
        inputs.user_id = o_id
        inputs.org_id = o_id
        toast.loading("Adding swifter...", {
            style: {
                background: "#ecfdf5",
                color: "#047857",
            },
            iconTheme: {
                primary: "#ecfdf5",
                secondary: "#047857",
            },
        });
        mutation.mutate(inputs);
    }

    return (
        <div className="w-90 p-1 shadow-xl">
            <form id="createWalletForm" onSubmit={handleUserAccessSubmit}>
                <div className=" py-2">
                    <label className="font-medium text-gray-600">Enter access Name</label>
                    <input id="access_username" name="access_username" onChange={handleChange} className="input validator w-full" type="text" required placeholder="Enter Access Name, e.g SwifterA" />
                </div>
                <button type="submit" className="hover:cursor-pointer bg-emerald-800 text-white btn-block p-1">
                    Add swifter
                </button>
            </form>
        </div>
    );
}

const UsersAccess = ({user_access}: {user_access: UsersAccessInfo}) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['deleteAccess'],
        mutationFn: ({organization_id, access_code_id}:{organization_id: string, access_code_id: string}) => deleteUserAccessFn(organization_id, access_code_id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["accessors"]});
            toast.dismiss();
            toast.success("Access revoked!", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
        },
        onError: (err: Error) => {
            toast.dismiss();
            toast.error("Failed revoking access!");
        }
    });
    
    const handleDeleteAccess = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toast.loading("Revoking swifter...", {
            style: {
                background: "#ecfdf5",
                color: "#047857",
            },
            iconTheme: {
                primary: "#ecfdf5",
                secondary: "#047857",
            },
        });
        mutation.mutate({organization_id: user_access.organization_id, access_code_id: user_access.access_code_id});
    }

    return (
        <div className="w-90 p-2 shadow-xl flex flex-row items-center gap-x-4 justify-between">
            <div>
                <h3 className="font-semibold">Access Name</h3>
                <p>{user_access.access_username}</p>
            </div>
            <div>
                <h3 className="font-semibold">Access Code</h3>
                <p>{user_access.access_code}</p>
            </div>
            <div>
                <button
                    onClick={handleDeleteAccess}
                    className="text-rose-50 bg-rose-500 p-1 btn-block hover:cursor-pointer"
                >
                    Revoke
                </button>
            </div>
        </div>
    );
}

const AdminInfo = ({ org }: Props) => {
    const [createWallet, setCreateWallet] = useState(false);
    const [addAccess, setAddAccess] = useState(false);
    const [inputs, setInputs] = useState();
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const { data: session, status } = useSession();
    const router = useRouter();
    const handleRouteToDashboard = () => {
        if (!!session) {
            router.push()
        } else {
            router.push("/login")
        }
    }

    const handleWalletCreation = (e: React.MouseEvent<HTMLButtonElement>, value) => {
        e.preventDefault();
        setCreateWallet(value);
    }

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['createWallet'],
        mutationFn: (inputs) => createMpesaWalletFn(inputs),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["wallet"]});
            toast.dismiss(); // Clear loading
            toast.success("Wallet created successfully", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
            setCreateWallet(false);
        },
        onError: (err: Error) => {
            toast.error("Wallet creation failed")
        }
    });
    const handleCreateWalletSubmission = async (event) => {
        event.preventDefault();
        inputs.owner_id = org.organization_id;
        mutation.mutate(inputs);
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['wallet', org.organization_id],
        queryFn: () => myWalletFn(org.organization_id),
        onSuccess: (data) => {
            console.log("Wallet fetch success is", data)
        },
        onError: (error) => {
            console.llg("Wallet fetch error is", error)
        }
    });

    const accessList = useQuery({
        queryKey: ['accessors', org.organization_id],
        queryFn: () => getUserAccessListFn(org.organization_id),
        onSuccess: (data) => {
            console.log("The access liset is", data);
        },
        onError: (error) => {
            console.log("The error for access is", error);
        }
    });

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
                    <div className="w-90 border border-emerald-500 border-2px rounded-sm py-2 my-3 flex flex-col items-center justify-center hover:cursor-pointer">
                        <h3 className="font-semibold text-gray-500">Wallet Details</h3>
                        {data ? (
                            <div className="w-full p-2">
                                <div className="">
                                    <p className="text-emerald-800"><span className="text-gray-800 font-medium">Account Number:</span> {data.account_number}</p>
                                    <p className="text-emerald-800"><span className="text-gray-800 font-medium">Currency:</span> {data.currency}</p>
                                    <p className="text-emerald-800"><span className="text-gray-800 font-medium">Service fee(percent):</span> {data.percentage_charge}</p>
                                    <p className="text-emerald-800"><span className="text-gray-800 font-medium">Settlement bank:</span> {data.settlement_bank}</p>
                                    <p className="text-emerald-800"><span className="text-gray-800 font-medium">Wallet email:</span> {data.wallet_email}</p>
                                </div>
                                <button className="bg-rose-600 btn-block text-white px-2 py-1 rounded-sm text-sm flex flex-row items-center gap-x-1 hover:cursor-pointer">
                                    Delete/Change Wallet
                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M19 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H20a1 1 0 0 1-1-1"></path>
                                        <path fill="currentColor" fillRule="evenodd" d="M18.6 4H3.4A2.4 2.4 0 0 0 1 6.4v11.2A2.4 2.4 0 0 0 3.4 20h15.2a2.4 2.4 0 0 0 2.4-2.4V16h.4a2.6 2.6 0 0 0 2.6-2.6v-2.8A2.6 2.6 0 0 0 21.4 8H21V6.4A2.4 2.4 0 0 0 18.6 4m-2 6a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h4.8a.6.6 0 0 0 .6-.6v-2.8a.6.6 0 0 0-.6-.6z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                                {/*Delete wallet*/}
                                <div>
                                </div>
                            </div>
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
                                <form id="createWalletForm" onSubmit={handleCreateWalletSubmission}>
                                    <div>
                                        <label className="font-medium text-gray-600">Business Name</label>
                                        <input id="business_name" onChange={handleChange} name="business_name" className="input validator w-full" type="text" required placeholder="Business Name" />
                                    </div>
                                    <div className="my-2">
                                        <label className="font-medium text-gray-600">Settlement Scheme</label>
                                        <select onClick={handleChange} id="settlement_bank" name="settlement_bank" className="px-2">
                                            <option value="MPESA">MPESA</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Account (MPESA number)</label>
                                        <input id="account_number" onChange={handleChange} name="account_number" className="input validator w-full" type="text" required placeholder="Mpesa no. eg 0712345678" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Email address</label>
                                        <input id="wallet_email" onChange={handleChange} name="wallet_email" className="input validator w-full" type="text" required placeholder="Contact email." />
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
                                        type="submit"
                                        form="createWalletForm"
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
                        <h3 className="font-bold text-gray-600 text-2xl">Swifter Access</h3>
                        {addAccess ? (
                            <button
                                onClick={() => setAddAccess(false)}
                                className="bg-white text-emerald-700 px-1 text-xs rounded-sm flex flex-row gap-x-1 items-center hover:cursor-pointer border border-emerald-700"
                            >
                                Close form
                                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20">
                                    <path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07m1.41-1.41A8 8 0 1 0 15.66 4.34A8 8 0 0 0 4.34 15.66m9.9-8.49L11.41 10l2.83 2.83l-1.41 1.41L10 11.41l-2.83 2.83l-1.41-1.41L8.59 10L5.76 7.17l1.41-1.41L10 8.59l2.83-2.83z"></path>
                                </svg>
                            </button>
                        ):(
                            <button
                                onClick={() => setAddAccess(true)}
                                className="bg-white text-emerald-700 px-1 text-xs rounded-sm flex flex-row gap-x-1 items-center hover:cursor-pointer border border-emerald-700"
                            >
                                Generate swifter access
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"></path>
                                </svg> 
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    {addAccess && (<AddUserAccess o_id={org.organization_id}/>)}
                    {accessList.isLoading && (<p>Loading Swifter access</p>)}
                    {accessList.isSuccess ? (
                        <div>
                            {accessList.data.map((usr) => <UsersAccess key={usr.access_code_id} user_access={usr}/>)}
                        </div>
                    ):(
                        <p className="font-semibold text-gray-800">No external access granted</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminInfo
