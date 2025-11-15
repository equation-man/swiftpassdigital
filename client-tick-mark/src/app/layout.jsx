// Remove TS-specific type imports
import { Outfit } from "next/font/google";
import "./globals.css";
import "react-phone-input-2/lib/style.css";

import NavBar from "@/components/Navigation/NavBar";
import Footer from "@/components/Footer/Footer";
import Provider from "@/lib/queryClient";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { ReduxProvider } from "@/redux/ReduxProvider";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "700"]
});

// Convert TS metadata to plain JS export
export const metadata = {
    title: "SwiftPassDigital",
    description: "Event management and digital ticketing software platform.",
    icons: {
        icon: "/logo-files/transp-swiftpass-favicon.ico",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light">
            <head>
                {/* Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/*Theme color for android status bar*/}
                <meta name="theme-color" content="#10b981" />

                {/*Required for IOS PWA*/}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />

                {/* IOS app icon */}
                <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
            </head>

            <body className={outfit.className}>
                <SessionProviderWrapper>
                    <Provider>
                        <ReduxProvider>
                            <NavBar />
                            {children}
                            <Footer />
                            {/*PWA and Service Worker*/}
                            <ServiceWorkerRegister />
                            <PwaInstallPrompt />
                        </ReduxProvider>
                    </Provider>
                </SessionProviderWrapper>
            </body>
        </html>
    );
}

