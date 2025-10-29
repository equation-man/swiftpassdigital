// Events component.
"use client";
import { toast } from "react-hot-toast";
import {useQuery} from "@tanstack/react-query";
import { fetchEventsFn } from "./actions";
import { useSession } from "next-auth/react";
import Event from "@/components/Events/Event";

type Props = {
    owner: T;
}
// pass user object.
const Events = ({ owner }: Props) => {
    const { data: session, status } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: () => fetchEventsFn(),
        onSuccess: () => {
        },
        onError: () => {
        },
    });

    let sessionFilter = null;
    if (session) {
        sessionFilter = session?.user.organization_id
    }
    console.log("The events return data is", session);

    if (error) return <p className="font-semibold font-gray-600">Error loading data</p>

    return (
        <div className="carousel carousel-center rounded-box w-full space-x-4 px-2">
            {data ? (
                <>
                    {data.filter(itm => sessionFilter !== itm.owner_id).map((event) => <Event key={event.event_id} evnt={event}/>)}
                </>
            ):(
                <p className="font-semibold font-gray-600">Error loading data...</p>
            )}
        </div>
    );
};

export default Events;
