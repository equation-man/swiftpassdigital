// Organization Header component
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { createEventModalState } from "@/redux/reducers/generalReducer";

const OrgHeader = ({ org }) => {
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const router = useRouter();

    const handleCreateEventModDisp = (e, state) => {
        e.preventDefault();
        dispatch(createEventModalState(state));
    };

    const handleManageAccount = (e) => {
        e.preventDefault();
        if (session) {
            router.push(`/organizations/profile/${session.user.user.organization_id}`);
        } else {
            router.push("/login");
        }
    };

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
                        onClick={(e) => handleCreateEventModDisp(e, true)}
                        className="bg-emerald-700 text-white font-medium text-xs p-1 rounded-xs hover:cursor-pointer"
                    >
                        Create New Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrgHeader;

