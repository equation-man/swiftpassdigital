/// Navigation bar.
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

const NavBar = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleRouteToDashboard = () => {
        if (!!session) {
            router.push(`/organizations/${session.user.organization_id}`)
        } else {
            router.push("/login")
        }
    }

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
                    <Link href="/" className="text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                                <path d="M6.133 21C4.955 21 4 20.02 4 18.81v-8.802c0-.665.295-1.295.8-1.71l5.867-4.818a2.09 2.09 0 0 1 2.666 0l5.866 4.818c.506.415.801 1.045.801 1.71v8.802c0 1.21-.955 2.19-2.133 2.19z"></path>
                                <path d="M9.5 21v-5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V21"></path>
                            </g>
                        </svg>
                    </Link>
                    <button
                        onClick={handleRouteToDashboard}
                        className="rounded-sm text-white bg-emerald-800 text-xs px-4 py-2 hover:cursor-pointer"
                    >
                        Dashboard
                    </button>
                    {session && <LogoutButton />}
                </div>
            </div>
        </main>
    );
};

export default NavBar;
