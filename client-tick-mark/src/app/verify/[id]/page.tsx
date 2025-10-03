// Transaction verification page
"use client";
import { useSearchParams, useParams } from "next/navigation";
import { fetchOrderFn } from "../actions";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types/types";
import { formatCurrency } from "@/lib/helpers";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";

type OrderProps = {
    order: Order;
};

const SuccessStatus = ({ order }: OrderProps) => {
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
            <div>
                <p className="text-center text-sm text-emerald-600"><ClientOnly><EventDate iso={order.added_at} /></ClientOnly></p>
                <p className="text-center text-sm">Amount: {formatCurrency(Number(order.ticket_price))}</p>
                <p className="text-center text-sm">Status: {order.ticket_status}</p>
                <p className="text-center text-sm">Entrance Code: <span className="font-bold">{order.entrance_code}</span></p>
            </div>
        </div>
    )
}

const ErrorStatus = () => {
    return (
        <div>
            <div className="text-rose-500 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width={54} height={54} viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                        <path strokeDasharray={64} strokeDashoffset={64} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate>
                        </path>
                        <path strokeDasharray={8} strokeDashoffset={8} d="M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4">
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"></animate>
                        </path>
                    </g>
                </svg>
            </div>
            <h1 className="text-emerald-800 text-center text-rose-500">Transaction was not successful!</h1>
        </div>
    )
}


const PaymentStatusPage = () => {
    const searchParams = useSearchParams();
    const ticketId = useParams();

    const params = {
        ticket_id: ticketId.id,
        trxref: searchParams.get("trxref"),
        reference: searchParams.get("reference"),
        email: searchParams.get("email"),
        phone: searchParams.get("phone")
    };
    const { data, isLoading, error } = useQuery({
        queryKey: ['paymentStatus'],
        queryFn: () => fetchOrderFn(params),
        onSuccess: (data) => {
            console.log("The order fetch result is", data);
        },
        onError: (err) => {
            console.log("The err result when fetching order is", err);
        },
    });
    if (isLoading) return <div className="font-semibold font-gray-600 flex flex-row items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} viewBox="0 0 24 24">
                <rect width={6} height={14} x={1} y={4} fill="currentColor">
                    <animate id="SVG9ovaHbIP" fill="freeze" attributeName="opacity" begin="0;SVGa89dAd4w.end-0.25s" dur="0.75s" values="1;0.2"></animate>
                </rect>
                <rect width={6} height={14} x={9} y={4} fill="currentColor" opacity={0.4}>
                    <animate fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.15s" dur="0.75s" values="1;0.2"></animate>
                </rect>
                <rect width={6} height={14} x={17} y={4} fill="currentColor" opacity={0.3}>
                    <animate id="SVGa89dAd4w" fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.3s" dur="0.75s" values="1;0.2"></animate>
                </rect>
            </svg>
        </div>

    return (
        <div className="flex flex-col items-center justify-center">
            {data ? (
                <SuccessStatus order={data}/>
            ):(
                <ErrorStatus />
            )}
        </div>
    );
};

export default PaymentStatusPage;

