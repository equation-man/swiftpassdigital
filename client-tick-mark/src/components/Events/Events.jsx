// Events component.
"use client";

import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsFn } from "./actions";
import { useSession } from "next-auth/react";
import Image from "next/image";
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

    let filtered = null;
    if (data) {
        filtered = data.filter((itm) => {
            const eventEnd = new Date(itm.finish_date);
            return sessionFilter !== itm.owner_id && eventEnd >= now;
        })
    }

    return (
        <div className="carousel carousel-center rounded-box w-full space-x-4 px-2 py-4">
            {data && filtered?.length > 0 ? (
                <>
                    {filtered?.map((event) => (
                            <Event key={event.event_id} evnt={event} />
                        ))}
                </>
            ) : (
                <div className="flex flex-col justify-center items-center w-full text-emerald-700 py-5">
                    <Image
                        src="/Easter-bunny.svg"
                        alt="Easter bunny no event image"
                        width={200}
                        height={200}
                        className="h-auto w-32"
                    />
                    <p className="font-semibold text-emerald-800 text-center py-2">
                        No data available. Refresh
                    </p>
                </div>
            )}
        </div>
    );
};

export default Events;

