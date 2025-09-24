// Event date time.
"use client";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

type EventDateProps = {
    iso: string;
    zone?: string;
}

export function EventDate({ iso, zone }: EventDateProps) {
    const [formatted, setFormatted] = useState("");

    useEffect(() => {
        const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(
            zone || DateTime.local().zoneName
        );

        // Custom sports display
        setFormatted(dt.toFormat("MMM dd, yyyy . h:mm a"));
    }, [iso, zone]);

    if (!formatted) return null;
    return <span>{formatted}</span>
}

export function ClientOnly({ children }: { children: React.ReactNone }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    
    if (!mounted) return null; // or a loading skeleton
    return <>{children}</>;
}
