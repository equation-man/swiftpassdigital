// Organization Header component
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Organization from "@/types/types";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { createEventModalState } from "@/redux/reducers/generalReducer";

type Props = {
    org: Organization;
};


const OrgHeader = ({ org }: Props) => {
    const { data: session, status } = useSession();

    const dispatch = useDispatch();
    const handleCreateEventModDisp = (e: React.MouseEvent<HTMLButtonElement>, state) => {
        e.preventDefault();
        dispatch(createEventModalState(state))
    }

    const router = useRouter();
    const handleManageAccount = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!!session) {
            router.push(`/organizations/profile/${session.user.organization_id}`)
        } else {
            router.push("/login")
        }
    }

    return (
        <div className="p-2">
            <div className="my-2">
                <h1 className="font-bold text-2xl">{org.organization_name}</h1>
                <div className="text-sm">
                    <p>{org.org_email}</p>
                    <p>{org.organization_username}</p>
                    <p>{org.description}</p>
                </div>
                <div className="flex flex-row gap-x-2">
                    <button
                        onClick={handleManageAccount}
                        className="text-emerald-700 hover:cursor-pointer font-medium rounded-xs border border-emerald-600 text-xs p-1"
                    >
                        Manage Account
                    </button>
                    <button
                        onClick={e => handleCreateEventModDisp(e, true)}
                        className="bg-emerald-700 text-white font-medium text-xs p-1 rounded-xs hover:cursor-pointer"
                    >
                        Create New Event
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 bg-emerald-100 rounded-xs p-1 text-green-7">
                <div>
                    <h3 className="font-semibold"><span className="text-green-800">Total Tickets:</span> 66</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Tickets Sold:</span> 58</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Amount:</span> 58000</h3>
                </div>
                <div>
                    <h3 className="font-semibold"><span className="text-green-800">Payments processing fee:</span> 870</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Service fee:</span> 2900</h3>
                        <h3 className="font-semibold"><span className="text-green-800">Net Total:</span> 54230</h3>
                </div>
            </div>
        </div>
    );
};

export default OrgHeader;
