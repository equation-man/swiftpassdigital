/// Navigation bar.
"use client";
import React from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

const NavBar = () => {
    const { data: session, status } = useSession();

    return (
        <main>
            {/*HEADER*/}
            <div className="flex flex-row items-center justify-between p-2">
                <div>
                    <Link href="/">
                        <h1 className="text-emerald-800 font-bold text-lg">
                            SwiftPass<span className="text-emerald-500">Digital</span> 
                        </h1>
                    </Link>
                </div>
                <div className="flex flex-row items-center gap-x-1">
                    <button className="rounded-sm text-white bg-emerald-800 text-xs px-4 py-2">
                        <Link href="/organizations">
                            Create Event
                        </Link>
                    </button>
                    {session && <LogoutButton />}
                </div>
            </div>
        </main>
    );
};

export default NavBar;
