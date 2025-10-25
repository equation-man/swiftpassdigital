/// QR Code scanning page.
"use client";
import QRScanner from "@/components/QRScan/QRScanner";

export default function ScanPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center">
            <QRScanner />
        </main>
    );
}
