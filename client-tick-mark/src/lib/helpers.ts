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

export function dateTimeToUtc(inputDate: string): string{
    // Convert to date object.
    const localDate = new Date(inputDate);
    // Convert to UTC ISO string.
    return localDate.toISOString();
}

type CurrencyStyle = {
    style: string;
    currency: string;
};
export function formatCurrency(value: number, currency: string="en-KE", style: CurrencyStyle={ style: 'currency', currency: 'KES' }): string {
    const formattedVal = new Intl.NumberFormat(currency, style).format(value)
    return formattedVal
}
