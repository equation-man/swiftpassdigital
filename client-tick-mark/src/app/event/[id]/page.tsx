// Individual event.
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { eventInfoFn } from "../actions";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";

const EventInfo = () => {
    const params=useParams<{ event_id: string}>(); // typed params
    const ev_id = params.id;

    const { data, isLoading, error } = useQuery({
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
        <div className="p-2 flex flex-row items-center justify-center">
            <div className="card bg-base-100 image-full w-96 shadow-sm rounded-sm">
              <figure>
                <img
                  src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                  alt="Shoes" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{data.title}</h2>
                <p className="text-xs text-emerald-200 font-medium">#{data.event_tag}</p>
                <p>{data.description}</p>
                <div>
                    <p className="text-xs"><span className="text-gray-100 font-bold text-emerald-200">From</span> <ClientOnly><EventDate iso={data.start_date} /></ClientOnly></p>
                    <p className="text-xs"><span className="text-gray-100 font-bold text-emerald-200">To</span> <ClientOnly><EventDate iso={data.start_date} /></ClientOnly></p>
                </div>
                <div>
                    <p className="flex flex-row items-center text-green-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 1024 1024">
                            <path fill="currentColor" d="M800 416a288 288 0 1 0-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416M512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312-117.312 330.688-352 544"></path>
                            <path fill="currentColor" d="M512 512a96 96 0 1 0 0-192a96 96 0 0 0 0 192m0 64a160 160 0 1 1 0-320a160 160 0 0 1 0 320"></path>
                        </svg>
                        {data.venue}
                    </p>
                </div>
                <div className="card-actions justify-end">
                    <button className="px-4 py-2 bg-emerald-600 font-semibold rounded-sm hover:cursor-pointer text-white">Purchase</button>
                </div>
              </div>
            </div>
        </div>
    );
};

export default EventInfo;
