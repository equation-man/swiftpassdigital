// Helper or utility funcions.
import { DateTime } from "luxon";
export function formatDateTime(isoString, timeZone = "Africa/Nairobi", format = "MMM dd, yyyy . h:mm a") {
    const dt = DateTime.fromISO(isoString, { zone: "utc" }).setZone(timeZone); //parse as UTC.
    return dt.toFormat(format);
}
export function dateTimeToUtc(inputDate) {
    // Convert to date object.
    const localDate = new Date(inputDate);
    // Convert to UTC ISO string.
    return localDate.toISOString();
}
export function formatCurrency(value, currency = "en-KE", style = { style: 'currency', currency: 'KES' }) {
    const formattedVal = new Intl.NumberFormat(currency, style).format(value);
    return formattedVal;
}
