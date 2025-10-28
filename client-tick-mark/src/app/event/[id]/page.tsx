// Individual event.
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { eventInfoFn, ticketInfoFn } from "../actions";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";
import { updatePaymentModalState } from "@/redux/reducers/generalReducer";
import { Ticket } from "@/types/types";
import { formatCurrency } from "@/lib/helpers";
import { useSession } from "next-auth/react";
import { Event } from "@/types/types";
import TicketPaymentModal from "@/components/Events/EventModals";

type TicketProps = {
    ticketDetails: Ticket;
    ticketIdViewFn: (value: string) => void,
};


const Info = ({ ticketDetails, ticketIdViewFn }: TicketProps ) => {
    const dispatch = useDispatch();
    const handleTicketPurchase = (e: React.MouseEvent<HTMLButtonElement>, state: boolean) => {
        e.preventDefault();
        ticketIdViewFn(ticketDetails.ticket_id);
        dispatch(updatePaymentModalState(state))
    }

    return (
        <div className="card bg-base-100 image-full w-96 shadow-sm rounded-sm">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{formatCurrency(Number(ticketDetails.base_price))}</h2>
            <p className="text-xs text-emerald-200 font-medium">{ticketDetails.ticket_class} {ticketDetails.ticket_type}</p>
            <p>{ticketDetails.description}</p>
            <div>
                <p className="text-xs"><span className="text-gray-100 font-bold text-emerald-200">From</span> <ClientOnly><EventDate iso={ticketDetails.start_time} /></ClientOnly></p>
                <p className="text-xs"><span className="text-gray-100 font-bold text-emerald-200">To</span> <ClientOnly><EventDate iso={ticketDetails.finish_time} /></ClientOnly></p>
            </div>
            <div className="card-actions justify-end">
            </div>
            <button
                onClick={e => handleTicketPurchase(e, true)}
                className="px-4 py-2 bg-emerald-600 font-semibold rounded-sm hover:cursor-pointer text-white"
            >
                Purchase Ticket
            </button>
          </div>
        </div>
    );
};

const EventInfo = () => {
    const [currentTicketId, setCurrentTicketId] = useState<string>();
    const { data: session, status } = useSession();
    const handleShowTicketPaymentModal = (value: string) => {
        setCurrentTicketId(value)
    }
    const params=useParams<{ id: string}>(); // typed params
    const router=useRouter();
    const ev_id = params.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ['tickets', ev_id],
        queryFn: () => ticketInfoFn(ev_id),
        onSuccess: (data) => {
            console.log("Success", data)
        },
        onError: (err) => {
            console.log("Error", err)
        }
    });

    const { data: currentEvent, isLoading: evLoading, error: evError } = useQuery<Event>({
        queryKey: ['event', ev_id],
        queryFn: () => eventInfoFn(ev_id),
        onSuccess: () => {
        },
        onError: () => {
        }
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

    if (error) return <p className="font-semibold font-gray-600 text-center">Error loading data</p>

    return (
        <div className="p-2">
            <div className="grid grid-col items-center justify-center mt-8">
                <div className="py-3 flex flex-col justify-center items-center">
                    <h1 className="text-emrald-800 text-2xl font-bold text-center">{currentEvent?.title}</h1>
                    <h3 className="text-gray-600 font-bold text-lg">tickets</h3>
                    {session?.user && (
                        <div>
                            {session?.user.organization_id === currentEvent?.owner_id && (
                                <button
                                    onClick={() => router.push(`/qrscan/${currentEvent.owner_id}/event/${currentEvent.event_id}`)}
                                    className="bg-emerald-700 text-emerald-50 p-1 hover:cursor-pointer rounded-xs text-sm"
                                >
                                    Scan ticket
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {data ? (
                    <div className="flex flex-col gap-y-4 justify-center items-center">
                        {data.map((ticket) => <Info key={ticket.ticket_id} ticketDetails={ticket} ticketIdViewFn={handleShowTicketPaymentModal}/>)}
                    </div>
                ):(
                    <div>
                        <p className="text-center">No data</p>
                    </div>
                )}
            </div>
            {/* MODALS */}
            <TicketPaymentModal ticketId={currentTicketId} eventDetails={currentEvent}/>
        </div>
    );
};

export default EventInfo;
