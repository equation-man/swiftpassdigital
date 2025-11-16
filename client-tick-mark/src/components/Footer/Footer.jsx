/// Footer
"use client";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="p-5 flex flex-col items-center justify-center text-sm">
            <div className="flex flex-row items-center justify-center">
                <ul className="inline-flex space-x-1 underline">
                    <li><Link href="/terms-of-service">Terms Of Service</Link> |</li>
                    <li><Link href="/payments-policy">Payment Policy</Link> |</li>
                    <li><Link href="/how-it-works">How It Works</Link></li>
                </ul>
            </div>
            <p className="text-center text-emerald-700">&copy;2025 SwiftPassDigital Software. All rights reserved.</p>
        </div>
    );
}

export default Footer;
