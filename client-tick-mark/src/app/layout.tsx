import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/Navigation/NavBar";

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
        <NavBar />
        {children}
      </body>
    </html>
  );
}
