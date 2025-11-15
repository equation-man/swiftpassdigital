/// QR Code scanning page.
"use client";
import QRScanner from "@/components/QRScan/QRScanner";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";
import { eventInfoFn } from "../../../actions";
export default function ScanPage() {
    const params = useParams();
    const event_id = params.event_id;
    const { data: currentEvent, isLoading: evLoading, error: evError } = useQuery({
        queryKey: ['event', event_id],
        queryFn: () => eventInfoFn(event_id),
        onSuccess: () => {
        },
        onError: () => {
        }
    });
    if (evLoading)
        return <p className="font-semibold text-center p-2">Loading QR Scanner...</p>;
    if (evError)
        return <p className="font-semibold text-center p-2">Failed loading QR Scanner enable access to camera and try again.</p>;
    return (<main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
            <div className="flex flex-col items-center justify-row text-emerald-800 pt-4">
                <h3 className="font-bold text-lg text-center">{currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.title}</h3>
                <h4 className="font-semibold text-center">{currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.venue}</h4>
                <p><span className="font-medium text-center">Start:</span> <ClientOnly><EventDate iso={currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.start_date}/></ClientOnly></p>
                <p><span className="font-medium text-center">End:</span> <ClientOnly><EventDate iso={currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.finish_date}/></ClientOnly></p>
            </div>
            <QRScanner />
        </main>);
}
