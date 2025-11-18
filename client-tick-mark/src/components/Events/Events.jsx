// Events component.
"use client";

import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsFn } from "./actions";
import { useSession } from "next-auth/react";
import Event from "@/components/Events/Event";

const Events = ({ owner }) => {
    const { data: session, status } = useSession();
    const now = new Date();

    const { data, isLoading, error } = useQuery({
        queryKey: ["events"],
        queryFn: () => fetchEventsFn(),
        onSuccess: () => {},
        onError: () => {},
    });

    let sessionFilter = null;
    if (session) {
        sessionFilter = session?.user?.user?.organization_id;
    }

    if (error)
        return (
            <p className="font-semibold font-gray-600 text-center p-4">
                Error fetching data
            </p>
        );

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center p-4 text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 24 24">
                    <rect width={6} height={14} x={1} y={4} fill="currentColor">
                        <animate id="SVGBoZ3Ab9F" fill="freeze" attributeName="y" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="1;5"></animate>
                        <animate fill="freeze" attributeName="height" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="22;14"></animate>
                        <animate fill="freeze" attributeName="opacity" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="1;0.2"></animate>
                    </rect>
                    <rect width={6} height={14} x={9} y={4} fill="currentColor" opacity={0.4}>
                        <animate fill="freeze" attributeName="y" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="1;5"></animate>
                        <animate fill="freeze" attributeName="height" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="22;14"></animate>
                        <animate fill="freeze" attributeName="opacity" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="1;0.2"></animate>
                    </rect>
                    <rect width={6} height={14} x={17} y={4} fill="currentColor" opacity={0.3}>
                        <animate id="SVG0XJl4OCs" fill="freeze" attributeName="y" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="1;5"></animate>
                        <animate fill="freeze" attributeName="height" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="22;14"></animate>
                        <animate fill="freeze" attributeName="opacity" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="1;0.2"></animate>
                    </rect>
                </svg>
                <p className="text-center font-semibold">Fetching available events</p>
            </div>
        );

    return (
        <div className="carousel carousel-center rounded-box w-full space-x-4 px-2 py-4">
            {data && data.length > 0 ? (
                <>
                    {data
                        .filter((itm) => {
                            const eventEnd = new Date(itm.finish_date);
                            return sessionFilter !== itm.owner_id && eventEnd >= now;
                        })
                        .map((event) => (
                            <Event key={event.event_id} evnt={event} />
                        ))}
                </>
            ) : (
                <div className="flex flex-col justify-center items-center w-full text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width={150} height={150} viewBox="0 0 32 32">
                        <path
                            fill="currentColor"
                            d="M30.48 4.575H32v1.52h-1.52Zm0 10.66h-3.05v1.53h1.52v4.57H25.9v-1.52h-1.52v3.04h4.57v4.58h1.53v-4.58H32v-1.52h-1.52zm0-6.09h-1.53v1.52h-1.52v1.53h1.52v1.52h1.53v-1.52H32v-1.53h-1.52z"
                        ></path>
                        <path
                            fill="currentColor"
                            d="M25.9 16.765h1.53v3.05H25.9Zm-1.52-10.67h1.52v1.53h-1.52Zm-1.52 6.1h1.52v3.04h-1.52Zm-10.67 13.71v-7.62h-1.52v4.57H9.14v1.53H7.62v3.05h1.52v1.52h13.72v-1.52h1.52v-3.05h-1.52v-1.53h-1.53v-4.57h-1.52v7.62zm9.14-10.67h1.53v1.53h-1.53Zm0-4.57h1.53v1.53h-1.53Zm-1.52-7.62h1.52v1.53h-1.52Zm-1.52 13.72h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Z"
                        ></path>
                        <path
                            fill="currentColor"
                            d="M16.76 19.815h1.53v1.52h-1.53Zm-3.05 3.04h4.58v1.53h-4.58Zm0-7.62h4.58v1.53h-4.58Zm0 4.58h1.53v1.52h-1.53Zm0-12.19v1.52h-1.52v1.52h1.52v1.53h1.53v-1.53h1.52v-1.52h-1.52v-1.52zm-1.52 9.14h1.52v1.52h-1.52Zm-3.05-4.57h3.05v1.52H9.14Zm0 3.04h1.53v1.53H9.14Zm0-12.19h1.53v1.53H9.14Zm-1.52 10.67h1.52v1.52H7.62Zm-4.57 1.52v1.53h1.52v4.57H1.52v-1.52H0v3.04h4.57v3.05H6.1v-3.05h1.52v-1.52H6.1v-6.1zm3.05-6.09h1.52v1.52H6.1Z"
                        ></path>
                        <path
                            fill="currentColor"
                            d="M1.52 16.765h1.53v3.05H1.52Zm0-12.19v1.52H0v1.53h1.52v1.52h1.53v-1.52h1.52v-1.53H3.05v-1.52z"
                        ></path>
                    </svg>
                    <p className="font-semibold text-emerald-800 text-center">
                        Failed to fetch data. Refresh
                    </p>
                </div>
            )}
        </div>
    );
};

export default Events;

