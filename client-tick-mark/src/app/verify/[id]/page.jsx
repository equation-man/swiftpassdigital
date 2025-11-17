// Transaction verification page
"use client";

import Link from "next/link";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { fetchOrderFn } from "../actions";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/helpers";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";

const SuccessStatus = ({ order }) => {
    return (
        <div>
            <div className="text-emerald-500 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width={74} height={74} viewBox="0 0 24 24">
                    <mask id="SVGkzXYXbbR">
                        <g fill="none" stroke="#fff" strokeDasharray={24} strokeDashoffset={24} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                            <path d="M2 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0" />
                            </path>
                            <path stroke="#000" strokeWidth={6} d="M7.5 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0" />
                            </path>
                            <path d="M7.5 13.5l4 4l10.75 -10.75">
                                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0" />
                            </path>
                        </g>
                    </mask>
                    <rect width={24} height={24} fill="currentColor" mask="url(#SVGkzXYXbbR)" />
                </svg>
            </div>

            <h1 className="text-emerald-800 text-center px-4">
                Transaction completed successfully. Ticket processed and sent to the email you provided, attached with QR code.
            </h1>

            <div>
                <p className="text-center text-sm text-emerald-600">
                    <ClientOnly>
                        <EventDate iso={order.added_at} />
                    </ClientOnly>
                </p>
                {/*<p className="text-center text-sm">Amount: {formatCurrency(Number(order.ticket_price))}</p>*/}
                <p className="text-center text-sm">Status: {order.ticket_status}</p>
                <p className="text-center text-sm">
                    Entrance Code: <span className="font-bold">{order.entrance_code}</span>
                </p>
            </div>
        </div>
    );
};

const PaymentStatusPage = () => {
    const searchParams = useSearchParams();
    const ticketId = useParams();
    const router = useRouter();

    const params = {
        ticket_id: ticketId.id,
        trxref: searchParams.get("trxref"),
        reference: searchParams.get("reference"),
        email: searchParams.get("email"),
        phone: searchParams.get("phone"),
        event_id: searchParams.get("event_id"),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ["paymentStatus"],
        queryFn: () => fetchOrderFn(params),
    });

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} viewBox="0 0 24 24">
                    <rect width={6} height={14} x={1} y={4} fill="currentColor">
                        <animate id="SVG9ovaHbIP" fill="freeze" attributeName="opacity" begin="0;SVGa89dAd4w.end-0.25s" dur="0.75s" values="1;0.2" />
                    </rect>
                    <rect width={6} height={14} x={9} y={4} fill="currentColor" opacity={0.4}>
                        <animate fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.15s" dur="0.75s" values="1;0.2" />
                    </rect>
                    <rect width={6} height={14} x={17} y={4} fill="currentColor" opacity={0.3}>
                        <animate id="SVGa89dAd4w" fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.3s" dur="0.75s" values="1;0.2" />
                    </rect>
                </svg>
                <div>
                    <p className="text-center">Good things take time! Hang tight as we process your ticket...</p>
                </div>
            </div>
        );

    if (isError) {
        router.push("/verify/failed");
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {data && <SuccessStatus order={data} />}
        </div>
    );
};

export default PaymentStatusPage;

