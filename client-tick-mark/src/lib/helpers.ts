// Helper or utility funcions.
import { DateTime } from "luxon";

export function formatDateTime(
    isoString: string,
    timeZone: string="Africa/Nairobi",
    format: string="MMM dd, yyyy . h:mm a"
): string{
    const dt = DateTime.fromISO(isoString, { zone: "utc" }).setZone(timeZone); //parse as UTC.
    return dt.toFormat(format);
}
