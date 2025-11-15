// Events component.
"use client";

import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { myEventsFn } from "@/app/organizations/actions";
import Event from "@/components/Events/Event";

const MyEvents = ({ owner }) => {
    const params = useParams();
    const owner_id = params.id; // plain JS — no TS typing

    const { data, isLoading, error } = useQuery({
        queryKey: ["MyEvents"],
        queryFn: () => myEventsFn(owner_id),
        onSuccess: () => {},
        onError: () => {},
    });

    if (error)
        return (
            <p className="font-semibold font-gray-600">
                Failed loading data
            </p>
        );

    return (
        <div className="carousel carousel-center rounded-box w-full space-x-4 px-2">
            {data ? (
                <>
                    {data.map((event) => (
                        <Event key={event.event_id} evnt={event} />
                    ))}
                </>
            ) : (
                <p className="font-semibold font-gray-600">
                    Failed loading data
                </p>
            )}
        </div>
    );
};

export default MyEvents;

