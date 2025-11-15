// Transaction error page.
"use client";

import Link from "next/link";

const PaymentErrorStatusPage = () => {
    return (
        <div>
            <div className="text-rose-500 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width={54} height={54} viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                        <path
                            strokeDasharray={64}
                            strokeDashoffset={64}
                            d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                        >
                            <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                dur="0.6s"
                                values="64;0"
                            />
                        </path>
                        <path
                            strokeDasharray={8}
                            strokeDashoffset={8}
                            d="M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4"
                        >
                            <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                begin="0.6s"
                                dur="0.2s"
                                values="8;0"
                            />
                        </path>
                    </g>
                </svg>
            </div>

            <h1 className="text-emerald-800 text-center text-rose-600 px-4 text-sm">
                Ticket processing failed! If you're seeing this but your payment was processed successfully, email support{" "}
                <Link
                    href="mailto:bigtechguyz@gmail.com?subject=Ticket%20processing%20failure"
                    className="underline hover:pointer"
                    target="blank"
                >
                    here.
                </Link>
            </h1>

            <h3 className="text-center text-rose-500 font-semibold">Possible causes</h3>

            <div className="flex justify-center">
                <ul className="list-disc list-inside text-sm">
                    <li>Network or internet connectivity issues.</li>
                    <li>Payments processing failure.</li>
                    <li>The payment processing took too long.</li>
                    <li>Ticket has already been generated for this payment.</li>
                </ul>
            </div>
        </div>
    );
};

export default PaymentErrorStatusPage;

