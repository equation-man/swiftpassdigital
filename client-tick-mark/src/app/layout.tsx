import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "react-phone-input-2/lib/style.css";
import NavBar from "@/components/Navigation/NavBar";
import Footer from "@/components/Footer/Footer";
import Provider from "@/lib/queryClient";
import {ReduxProvider} from "@/redux/ReduxProvider";

const outfit = Outfit({
    subset: ["latin"],
    weight: ["400", "500", "700"]
})

export const metadata: Metadata = {
  title: "SwiftPassDigital",
  description: "Ticketing SaaS platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${outfit.className}`}
      >
          <Provider>
              <ReduxProvider>
                <NavBar />
                    {children}
                <Footer />
              </ReduxProvider>
          </Provider>
      </body>
    </html>
  );
}
