// QR code scanning page.
"use client";

import { confirmQRcodeFn } from "./actions";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Dynamic import to avoid SSR issues
async function loadHtml5Qrcode() {
    const lib = await import("html5-qrcode");
    return lib;
}

export default function QRScanner() {
    const readerId = "html5qr-reader";
    const html5QrcodeRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const params = useParams();
    const org_id = params.org_id;

    useEffect(() => {
        return () => {
            const qr = html5QrcodeRef.current;
            if (qr) {
                try {
                    if (qr.isScanning) qr.stop();
                } catch (e) {}
                try {
                    qr.clear();
                } catch (e) {}
            }
        };
    }, []);

    const mutation = useMutation({
        mutationKey: ['checkTicket'],
        mutationFn: (lastResult) => confirmQRcodeFn(lastResult),
        onSuccess: (data) => {},
        onError: (err) => {
            console.log("Error fetching data scanning", err);
        }
    });

    async function startScanner() {
        if (scanning) return;
        setLastResult(null);
        setScanning(true);

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await loadHtml5Qrcode();
        const html5Qr = new Html5Qrcode(readerId);
        html5QrcodeRef.current = html5Qr;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        try {
            await html5Qr.start(
                { facingMode: "environment" },
                config,
                async (decodedText, decodedResult) => {
                    let data;
                    try {
                        data = JSON.parse(decodedText);
                    } catch (e) {
                        data = { ok: false, message: "Invalid QR code" };
                    }

                    try {
                        if (html5Qr.isScanning) await html5Qr.stop();
                    } catch (err) {}

                    setScanning(false);
                    setLastResult({ ...data });

                    try {
                        const res = await mutation.mutateAsync(data);
                        setLastResult({ ...res });
                    } catch (e) {
                        setLastResult({ ok: false, message: "Error invalid ticket" });
                    }
                },
                (errorMessage) => {
                    console.log("Scanning error", errorMessage);
                }
            );
        } catch (err) {
            setScanning(false);
            setLastResult({ ok: false, message: "Camera permission denied" });
        }
    }

    function stopScanner() {
        const html5Qr = html5QrcodeRef.current;
        if (!html5Qr) return;

        try {
            if (html5Qr.isScanning) {
                html5Qr
                    .stop()
                    .then(() => html5Qr.clear())
                    .catch(() => {})
                    .finally(() => setScanning(false));
            } else {
                setScanning(false);
            }
        } catch (e) {
            setScanning(false);
        } finally {
            html5QrcodeRef.current = null;
            setScanning(false);
        }
    }

    return (
        <div className="flex flex-col items-center space-b-6 space-t-3 pb-10 pt-5">
            <h1 className="text-2xl font-semibold">Scan Ticket QR code</h1>
            <div
                id={readerId}
                className="rounded-sm border border-gray-300 shadow-inner w-[320px] h-[320px] bg-gray-50 flex items-center justify-center"
            >
                {!scanning && (
                    <span className="text-gray-400 text-sm">Camera feed will appear here</span>
                )}
            </div>

            <div className="flex gap-4 py-8 mt-8">
                <button
                    onClick={startScanner}
                    disabled={scanning}
                    className={`px-5 py-2 rounded-sm text-white font-medium transition ${
                        scanning ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-indigo-700"
                    }`}
                >
                    {scanning ? "Scanning..." : "Start scanning"}
                </button>

                <button
                    onClick={stopScanner}
                    disabled={!scanning}
                    className={`px-5 py-2 rounded-sm font-medium border transition ${
                        scanning ? "border-rose-500 text-rose-600 hover:bg-rose-50" : "border-teal-500 text-teal-800 cursor-not-allowed"
                    }`}
                >
                    Stop scanning
                </button>
            </div>

            {lastResult && (
                <div
                    className={`rounded-sm p-2 text-center w-[320px] shadow-lg ${
                        mutation.isSuccess || mutation.isPending
                            ? "bg-gradient-to-r from-emerald-100 via-emerald-50 via-white-100 to-green-100 text-emerald-800"
                            : "bg-rose-50 border-rose-400 text-rose-700"
                    }`}
                >
                    {mutation.isPending && <p className="font-semibold">Running verification...</p>}
                    {mutation.isSuccess && (
                        <div>
                            <p className="font-semibold">Attendance confirmed</p>
                            {lastResult.entrance_code && <p>Ticket number: {lastResult.entrance_code}</p>}
                            {lastResult.ticket_type && <p>Ticket type: {lastResult.ticket_type}</p>}
                            {lastResult.message && <p>{lastResult.message}</p>}
                        </div>
                    )}
                    {mutation.isError && (
                        <div>
                            <p className="font-semibold">Error! Invalid, Try again</p>
                            {lastResult.message && <p>{lastResult.message}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

