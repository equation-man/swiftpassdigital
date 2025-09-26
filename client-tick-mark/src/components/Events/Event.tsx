// Event component.
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Event } from "@/types/types";
import { formatDateTime } from "@/lib/helpers";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";

type Props = {
    evnt: Event;
};

const Event = ({ evnt }: Props) => {
    const router = useRouter();
    const showEvent = async (event) => {
        event.preventDefault();
        router.push(`/event/${evnt.event_id}`);
    }

    return (
        <div className="carousel-item">
            <div className="card bg-base-100 w-70 shadow-sm rounded-sm">
              <figure>
                <img
                  src="/football.jpg"
                  alt="football" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{evnt.title}</h2>
                <div className="text-gray-600">
                    <p className="text-xs">#{evnt.event_tag}</p>
                </div>
                <p>{evnt.description}</p>
                <div className="card-actions justify-between items-center">
                    <div className="text-emerald-600">
                        <p className="flex flex-row items-center text-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 1024 1024">
                                <path fill="currentColor" d="M800 416a288 288 0 1 0-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416M512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312-117.312 330.688-352 544"></path>
                                <path fill="currentColor" d="M512 512a96 96 0 1 0 0-192a96 96 0 0 0 0 192m0 64a160 160 0 1 1 0-320a160 160 0 0 1 0 320"></path>
                            </svg>
                            {evnt.venue}
                        </p>
                        <div>
                            <p className="text-xs"><span className="text-gray-700 font-medium">From</span> <ClientOnly><EventDate iso={evnt.start_date} /></ClientOnly></p>
                            <p className="text-xs"><span className="text-gray-700 font-medium">To</span> <ClientOnly><EventDate iso={evnt.start_date} /></ClientOnly></p>
                        </div>
                    </div>
                </div>
                <button onClick={showEvent} className="px-4 py-1 bg-emerald-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
              </div>
            </div>
        </div>
    );
}
export default Event;
