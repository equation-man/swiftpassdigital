/// Admin info page 
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

import { deleteUserAccessFn, getUserAccessListFn, myWalletFn, createMpesaWalletFn, createUserAccessFn, availableBanksFn } from "./actions";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AddUserAccess = ({ o_id }) => {
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({
            ...values,
            [name]: value
        }));
    };

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["createAccess"],
        mutationFn: (inputs) => createUserAccessFn(inputs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accessors"] });
            toast.dismiss();
            toast.success("New access granted!", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
        },
        onError: () => {
            toast.dismiss();
            toast.error("Failed granting access!");
        }
    });

    const handleUserAccessSubmit = (event) => {
        event.preventDefault();
        inputs.user_id = o_id;
        inputs.org_id = o_id;

        toast.loading("Adding swifter...", {
            style: { background: "#ecfdf5", color: "#047857" },
            iconTheme: { primary: "#ecfdf5", secondary: "#047857" },
        });

        mutation.mutate(inputs);
    };

    return (
        <div className="w-90 p-1 shadow-xl">
            <form id="createWalletForm" onSubmit={handleUserAccessSubmit}>
                <div className="py-2">
                    <label className="font-medium text-gray-600">Enter access Name</label>
                    <input
                        id="access_username"
                        name="access_username"
                        onChange={handleChange}
                        className="input validator w-full"
                        type="text"
                        required
                        placeholder="Enter Access Name, e.g SwifterA"
                    />
                </div>

                <button type="submit" className="hover:cursor-pointer bg-emerald-800 text-white btn-block p-1">
                    Add swifter
                </button>
            </form>
        </div>
    );
};

const UsersAccess = ({ user_access }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["deleteAccess"],
        mutationFn: ({ organization_id, access_code_id }) =>
            deleteUserAccessFn(organization_id, access_code_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accessors"] });
            toast.dismiss();
            toast.success("Access revoked!", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
        },
        onError: () => {
            toast.dismiss();
            toast.error("Failed revoking access!");
        }
    });

    const handleDeleteAccess = (event) => {
        event.preventDefault();
        toast.loading("Revoking swifter...", {
            style: { background: "#ecfdf5", color: "#047857" },
            iconTheme: { primary: "#ecfdf5", secondary: "#047857" },
        });

        mutation.mutate({
            organization_id: user_access.organization_id,
            access_code_id: user_access.access_code_id
        });
    };

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

            <button
                onClick={handleDeleteAccess}
                className="text-rose-50 bg-rose-500 p-1 btn-block hover:cursor-pointer"
            >
                Revoke
            </button>
        </div>
    );
};

const AdminInfo = ({ org }) => {
    const [createWallet, setCreateWallet] = useState(false);
    const [addAccess, setAddAccess] = useState(false);
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({ ...values, [name]: value }));
    };

    const handleWalletCreation = (e, value) => {
        e.preventDefault();
        setCreateWallet(value);
    };

    const queryClient = useQueryClient();

    // Create Wallet Mutation
    const mutation = useMutation({
        mutationKey: ["createWallet"],
        mutationFn: (inputs) => createMpesaWalletFn(inputs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
            toast.dismiss();
            toast.success("Wallet created successfully", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            setCreateWallet(false);
        },
        onError: () => {
            toast.error("Wallet creation failed");
        }
    });

    const handleCreateWalletSubmission = (event) => {
        event.preventDefault();
        inputs.owner_id = org.organization_id;
        mutation.mutate(inputs);
    };

    // Wallet Query
    const { data } = useQuery({
        queryKey: ["wallet", org.organization_id],
        queryFn: () => myWalletFn(org.organization_id),
        enabled: !!org.organization_id
    });

    // Access List Query
    const accessList = useQuery({
        queryKey: ["accessors", org.organization_id],
        queryFn: () => getUserAccessListFn(org.organization_id),
        enabled: !!org.organization_id
    });

    // Banks query
    const suptdBanks = useQuery({
        queryKey: ["avalBanks", org.organization_id],
        queryFn: () => availableBanksFn(org.organization_id),
        enabled: !!org.organization_id
    });

    let supportedBanks = null;
    if (suptdBanks?.data) {
        supportedBanks = [
            ...new Map(suptdBanks.data.map(bank => [bank.code, bank])).values()
        ];
    }

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

                {/* Wallet Card */}
                <div className="w-90 border border-emerald-500 rounded-sm py-2 my-3 flex flex-col items-center justify-center">
                    <h3 className="font-semibold text-gray-500">Wallet Details</h3>

                    {data && data.wallet_email !== "none@notset.com" ? (
                        <div className="w-full p-2">
                            <p><span className="font-medium">Account Number:</span> {data.account_number}</p>
                            <p><span className="font-medium">Currency:</span> {data.currency}</p>
                            <p><span className="font-medium">Service fee:</span> {data.percentage_charge}</p>
                            <p><span className="font-medium">Settlement bank:</span> {data.settlement_bank}</p>
                            <p><span className="font-medium">Wallet email:</span> {data.wallet_email}</p>

                            <button className="bg-rose-600 btn-block text-white px-2 py-1 rounded-sm text-sm hover:cursor-pointer">
                                Delete/Change Wallet
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => handleWalletCreation(e, true)}
                            className="bg-emerald-700 text-white px-2 py-1 rounded-sm text-sm hover:cursor-pointer"
                        >
                            Add wallet
                        </button>
                    )}
                </div>

                {/* Wallet creation form */}
                {createWallet && (
                    <div className="w-90 p-1 shadow-xl border border-emerald-500">
                        <form id="createWalletForm" onSubmit={handleCreateWalletSubmission}>
                            <div>
                                <label className="font-medium text-emerald-600">Business Name</label>
                                <input name="business_name" onChange={handleChange} className="input validator w-full" required />
                            </div>

                            <div>
                                <label className="font-medium text-emerald-600">Select Settlement Bank</label>
                                <select name="settlement_bank" onChange={handleChange} className="w-full">
                                    {supportedBanks && (
                                        supportedBanks.map((bank) => {
                                            return <option key={bank.code} value={bank.code}>{bank.name}</option>
                                        })
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="font-medium text-emerald-600">Account Number</label>
                                <input name="account_number" onChange={handleChange} className="input validator w-full" required />
                            </div>

                            <div>
                                <label className="font-medium text-emerald-600">Email Address</label>
                                <input name="wallet_email" onChange={handleChange} className="input validator w-full" required />
                            </div>
                        </form>

                        <div className="flex gap-x-2 my-2">
                            <button onClick={(e) => handleWalletCreation(e, false)} className="bg-emerald-600 text-white btn-block p-1">
                                Cancel
                            </button>

                            <button form="createWalletForm" type="submit" className="bg-emerald-800 text-white btn-block p-1">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Swifter Access */}
            <div className="pt-5">
                <div className="flex flex-row gap-x-2">
                    <h3 className="font-bold text-gray-600 text-2xl">Swifter Access</h3>

                    {addAccess ? (
                        <button
                            onClick={() => setAddAccess(false)}
                            className="border border-emerald-700 text-emerald-700 px-1 text-xs rounded-sm"
                        >
                            Close form
                        </button>
                    ) : (
                        <button
                            onClick={() => setAddAccess(true)}
                            className="border border-emerald-700 text-emerald-700 px-1 text-xs rounded-sm"
                        >
                            Generate swifter access
                        </button>
                    )}
                </div>

                <div>
                    {addAccess && <AddUserAccess o_id={org.organization_id} />}

                    {accessList.isLoading && <p>Loading Swifter access...</p>}

                    {accessList.isSuccess && accessList?.data.length > 0 ? (
                        <div>
                            {accessList.data.map((usr) => (
                                <UsersAccess key={usr.access_code_id} user_access={usr} />
                            ))}
                        </div>
                    ) : (
                        <p className="font-semibold text-gray-800">
                            No external access granted
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminInfo;

