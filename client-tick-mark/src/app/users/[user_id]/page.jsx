/// Users activity page or dashboard
"use client";
import React from "react";
import { orgsAvailableFn } from "../actions";
import { useQuery } from "@tanstack/react-query";
import OrgsNetwork from "@/components/UserActivity/UserActivity";


const UserActivityPage = () => {
    const {data, isLoading, error} = useQuery({
        queryKey: ["organizations"],
        queryFn: () => orgsAvailableFn(),
        onSuccess: () => {},
        onError: () => {},
    });

    return (
        <div className="p-4">
            <h1 className="text-emerald-700 font-bold text-2xl">Fun experiences are now modern and digital</h1>
            {data && data.length > 0 ? (
                <>
                    {data.map(org => <OrgsNetwork key={org.organization_id} orgs={org}/>)}
                </>
            ):(
                <div>Failed fetching organizations</div>
            )}
            <OrgsNetwork />
        </div>
    );
};

export default UserActivityPage;
