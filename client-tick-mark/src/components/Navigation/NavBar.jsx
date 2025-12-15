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
                    <Link href="https://wa.me/254737668196?text=Hello%20I%20need%20some%20help%20your%20service%20Swiftpassdigital" className="text-emerald-600" target="_blank" rel="noopener noreferrer">
						<svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
							<path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"></path>
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
