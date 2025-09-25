// Events component.
"use client";
import React from "react";
import Event from "@/components/Events/Event";
import { toast } from "react-hot-toast";
import {useQuery} from "@tanstack/react-query";
import { fetchEventsFn } from "./actions";

const Events = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: () => fetchEventsFn(),
        onSuccess: () => {
        },
        onError: () => {
        },
    });

    if (error) return <p className="font-semibold font-gray-600">Error loading data</p>

    return (
        <div className="carousel carousel-center rounded-box w-full space-x-4 px-2">
            {data ? (
                <>
                    {data.map((event) => <Event key={event.event_id} evnt={event}/>)}
                </>
            ):(
                <p className="font-semibold font-gray-600">Error loading data...</p>
            )}
        </div>
    );
};

export default Events;
