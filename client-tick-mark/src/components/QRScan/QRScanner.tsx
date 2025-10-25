// QR code scanning page.
"use client";
import { confirmQRcodeFn } from "./actions";
import { QRTicketValidation } from "@types/types";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { HTML5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

// Dynamic import to avoid SSR issues
async function loadHtml5Qrcode() {
    const lib = await import("html5-qrcode");
    return lib;
}

export default function QRScanner() {
    const readerId = "html5qr-reader";
    const html5QrcodeRef = useRef<any | null>(null);
    const [scanning, setScanning] = useState(false);
    const [lastResult, setLastResult] = useState<QRTicketValidation | null>(null);

    useEffect(() => {
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current.stop().catch(() => {});
                html5QrcodeRef.current.clear().catch(() => {});
            }
        };
    }, []);

    const mutation = useMutation({
        mutationKey: ['checkTicket'],
        mutationFn: (lastResult) => confirmQRcodeFn(lastResult),
        onSuccess: (data) => {
            //toast.success()
        },
        onError: (err: Error) => {
            //toast.error("Ticket verification failed")
        }
    });

    async function startScanner() {
        if (scanning) return;
        setLastResult(null);
        setScanning(true);

        const { Html5Qrcode } = await loadHtml5Qrcode();
        const html5Qr = new Html5Qrcode(readerId);

        html5QrcodeRef.current = html5Qr;
        const config = { fps: 10, qrbox: {width: 250, height: 250}, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] };
        try {
            await html5Qr.start(
                { facingMode: "environment" } as any,
                config,
                async (decodedText: string, decodedResult: any) => {
                    let data = JSON.parse(decodedText);
                    // Prevent double reads by stopping scanning immediately
                    try {
                        await html5Qr.stop();
                    } catch (err) {};
                    setScanning(false);

                    // Show temporarily in UI
                    setLastResult({...data});
                    // Send to server action (POST request)
                    try {
                        // Data from scanned qrcode.
                        // Send request to the backend here and retrieve result.
                        const res = await mutation.mutateAsync(data);
                        //const json = JSON.stringify(res);
                        console.log("The simulated response is", res);
                        setLastResult({...res});
                    } catch (e) {
                        setLastResult({
                            ok: false,
                            message: "Error invalid ticket",
                        });
                    }
                },
                (errorMessage: string) => {
                    // optional: fallback when scan fails
                    console.log("Scanning error", errorMessage);
                }
            );
        } catch (err) {
            console.error("Camera start error is", err);
            setScanning(false);
            setLastResult({ok: false, message: "Camera permission denied"})
        }
    }

    function stopScanner() {
        if (!scanning) return;
        const html5Qr = html5QrcodeRef.current;
        if (!html5Qr) return;
        html5Qr.stop().then(() => html5Qr.clear()).catch(() => {}).finally(() => setScanning(false));
    }

    return (
        <div className="flex flex-col items-center space-y-6 py-10">
            <h1 className="text-2xl font-semibold">Scan Ticket QR code</h1>
            <div id={readerId}
                className="rounded-sm border border-gray-300 shadow-inner w-[320px] h-[320px] bg-gray-50 flex items-center justify-center"
            >
                {!scanning && (
                    <span className="text-gray-400 text-sm">Camera feed will appear here</span>
                )}
            </div>
            <div className="flex gap-4 py-4 mt-6">
                <button onClick={startScanner} disabled={scanning}
                    className={`px-5 py-2 rounded-sm text-white font-medium transition ${
                        scanning ? "bg-gray-400 cursor-not-allowed": "bg-emerald-700 hover:bg-indigo-700"
                    }`}
                >
                    { scanning ? "Scanning..." : "Start scanning" }
                </button>
                <button onClick={stopScanner} disabled={!scanning}
                    className={`px-5 py-2 rounded-sm font-medium border transition ${
                        scanning ? "border-rose-500 text-rose-600 hover:bg-rose-50": "border-teal-500 text-teal-800 cursr-not-allowed"
                    }`}
                >
                    Stop scanning
                </button>
            </div>
            {lastResult && (
                <div className={`rounded-sm p-2 text-center w-[320px] shadow-lg ${
                    mutation.isSuccess | mutation.isPending ? "bg-gradient-to-r from-emerald-100 via-emerald-50 via-white-100 to-green-100 text-emerald-800" : "bg-rose-50 border-rose-400 text-rose-700"
                    }`}
                >
                    {mutation.isPending && (
                        <div className="flex flex-col items-center justify-center text-emerald-700">
                            <p className="font-semibold">Running verification</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} viewBox="0 0 24 24">
                                <circle cx={4} cy={12} r={0} fill="currentColor">
                                    <animate fill="freeze" attributeName="r" begin="0;SVGUppsBdVN.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="0;3"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVGqCgsydxJ.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="4;12"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVG3PwDNd6F.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="12;20"></animate>
                                    <animate id="SVG3V8yEdYE" fill="freeze" attributeName="r" begin="SVG6wCQhd9Q.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="3;0"></animate>
                                    <animate id="SVGUppsBdVN" fill="freeze" attributeName="cx" begin="SVG3V8yEdYE.end" dur="0.001s" values="20;4"></animate>
                                </circle>
                                <circle cx={4} cy={12} r={3} fill="currentColor">
                                    <animate fill="freeze" attributeName="cx" begin="0;SVGUppsBdVN.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="4;12"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVGqCgsydxJ.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="12;20"></animate>
                                    <animate id="SVG4PgJdbds" fill="freeze" attributeName="r" begin="SVG3PwDNd6F.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="3;0"></animate>
                                    <animate id="SVG6wCQhd9Q" fill="freeze" attributeName="cx" begin="SVG4PgJdbds.end" dur="0.001s" values="20;4"></animate>
                                    <animate fill="freeze" attributeName="r" begin="SVG6wCQhd9Q.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="0;3"></animate>
                                </circle>
                                <circle cx={12} cy={12} r={3} fill="currentColor">
                                    <animate fill="freeze" attributeName="cx" begin="0;SVGUppsBdVN.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="12;20"></animate>
                                    <animate id="SVG38aCdcdI" fill="freeze" attributeName="r" begin="SVGqCgsydxJ.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="3;0"></animate>
                                    <animate id="SVG3PwDNd6F" fill="freeze" attributeName="cx" begin="SVG38aCdcdI.end" dur="0.001s" values="20;4"></animate>
                                    <animate fill="freeze" attributeName="r" begin="SVG3PwDNd6F.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="0;3"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVG6wCQhd9Q.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="4;12"></animate>
                                </circle>
                                <circle cx={20} cy={12} r={3} fill="currentColor">
                                    <animate id="SVGwaWzveSq" fill="freeze" attributeName="r" begin="0;SVGUppsBdVN.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="3;0"></animate>
                                    <animate id="SVGqCgsydxJ" fill="freeze" attributeName="cx" begin="SVGwaWzveSq.end" dur="0.001s" values="20;4"></animate>
                                    <animate fill="freeze" attributeName="r" begin="SVGqCgsydxJ.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="0;3"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVG3PwDNd6F.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="4;12"></animate>
                                    <animate fill="freeze" attributeName="cx" begin="SVG6wCQhd9Q.end" calcMode="spline" dur="0.5s" keySplines=".36,.6,.31,1" values="12;20"></animate>
                                </circle>
                            </svg>
                        </div>
                    )}
                    {mutation.isSuccess && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="font-semibold">Attendance confirmed</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                <mask id="SVGhM8NHeAh">
                                    <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                                        <path fill="#fff" d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"></path>
                                        <path stroke="#000" strokeDasharray={14} strokeDashoffset={14} d="M8 12l3 3l5 -5">
                                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="14;0"></animate>
                                        </path>
                                    </g>
                                </mask>
                                <rect width={24} height={24} fill="currentColor" mask="url(#SVGhM8NHeAh)"></rect>
                            </svg>
                            {lastResult.entrance_code && (<p>Ticket number is: <span className="font-semibold">{lastResult.entrance_code}</span></p>)}
                            {lastResult.ticket_type && (<p>Ticket type is: <span className="font-semibold">{lastResult.ticket_type}</span></p>)}
                            {lastResult.message &&(<p className="font-semibol">{lastResult.message}</p>)}
                        </div>
                    )}
                    {mutation.isError && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="font-semibold">Error! Invalid, Try again</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                                <mask id="SVG493HxbpH">
                                    <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                                        <path fill="#fff" fillOpacity={0} strokeDasharray={64} strokeDashoffset={64} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                                            <animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.5s" values="0;1"></animate>
                                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate>
                                        </path>
                                        <path stroke="#000" strokeDasharray={8} strokeDashoffset={8} d="M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4">
                                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" values="8;0"></animate>
                                        </path>
                                    </g>
                                </mask>
                                <rect width={24} height={24} fill="currentColor" mask="url(#SVG493HxbpH)"></rect>
                            </svg>                        
                            {lastResult.message &&(<p className="font-semibol">{lastResult.message}</p>)}
                        </div>

                    )}
                </div>
            )}
        </div>
    );
}
