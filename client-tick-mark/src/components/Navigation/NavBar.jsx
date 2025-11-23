/// Navigation bar.
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

const NavBar = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleRouteToDashboard = () => {
        if (!!session) {
            router.push(`/organizations/${session.user.user.organization_id}`)
        } else {
            router.push("/login")
        }
    }

    return (
        <main>
            {/*HEADER*/}
            <div className="flex flex-row items-center justify-between p-2">
                <div>
                    <Link href="/" className="flex flex-row items-center">
                        <Image
                            src="/logo-files/transp-swiftpass-logo.png"
                            width={40}
                            height={40}
                            alt="SwiftPassDigital logo"
                        />
                        <h1 className="text-emerald-800 font-bold text-sm md:text-lg">
                            SwiftPass<span className="text-emerald-500">Digital</span> 
                        </h1>
                    </Link>
                </div>
                <div className="flex flex-row items-center gap-x-1">
                    <Link href="mailto:bigtechguyz@gmail.com?subject=SwiftPassDigital Technical Support Center" className="text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M29 9v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9m26 0a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2m26 0l-11.862 8.212a2 2 0 0 1-2.276 0L3 9"></path>
                        </svg>                        
                    </Link>
                    <Link href="/" className="text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                                <path d="M6.133 21C4.955 21 4 20.02 4 18.81v-8.802c0-.665.295-1.295.8-1.71l5.867-4.818a2.09 2.09 0 0 1 2.666 0l5.866 4.818c.506.415.801 1.045.801 1.71v8.802c0 1.21-.955 2.19-2.133 2.19z"></path>
                                <path d="M9.5 21v-5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V21"></path>
                            </g>
                        </svg>
                    </Link>
                    {/*Routing to the dashboard*/}
                    <button
                        onClick={handleRouteToDashboard}
                        className="rounded-sm text-emerald-800 hover:cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm0 8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm1-17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"></path>
                        </svg>                        
                    </button>
                    {status === "authenticated" && (<LogoutButton />)}
                </div>
            </div>
        </main>
    );
};

export default NavBar;
