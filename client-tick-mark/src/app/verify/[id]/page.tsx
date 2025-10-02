// Transaction verification page
"use client";
import { useSearchParams } from "next/navigation";

const SuccessStatus = () => {
    return (
        <div>
            <div className="text-emerald-500 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width={74} height={74} viewBox="0 0 24 24">
                    <mask id="SVGkzXYXbbR">
                        <g fill="none" stroke="#fff" strokeDasharray={24} strokeDashoffset={24} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                            <path d="M2 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0"></animate>
                            </path>
                            <path stroke="#000" strokeWidth={6} d="M7.5 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0"></animate>
                            </path>
                            <path d="M7.5 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0"></animate>
                            </path>
                        </g>
                    </mask>
                    <rect width={24} height={24} fill="currentColor" mask="url(#SVGkzXYXbbR)"></rect>
                </svg>
            </div>
            <h1 className="text-emerald-800 text-center">Payment Successful</h1>
        </div>
    )
}


const PaymentStatusPage = () => {
    const searchParams = useSearchParams();
    console.log("The searchParams are", searchParams.get("trxref"), searchParams.get("reference"));
    return (
        <div className="flex flex-col items-center justify-center">
            <SuccessStatus />
        </div>
    );
};

export default PaymentStatusPage;

