// Helper or utility funcions.
// Make sure you have luxon installed: npm install luxon
import { DateTime } from "luxon";

export function formatDateTime(isoString, timeZone = "Africa/Nairobi", format = "MMM dd, yyyy . h:mm a") {
    const dt = DateTime.fromISO(isoString, { zone: "utc" }).setZone(timeZone);
    return dt.toFormat(format);
}

export function dateTimeToUtc(inputDate) {
    // Convert to date object.
    const localDate = new Date(inputDate);
    // Convert to UTC ISO string.
    return localDate.toISOString();
}

export function formatCurrency(value, currency = "en-KE", style = { style: "currency", currency: "KES" }) {
    return new Intl.NumberFormat(currency, style).format(value);
}

export function toDateTimeLocal(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        "T" +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes())
    );
};

export function discountDurationRemaining(end_date) {
  const now = new Date();
  const end = new Date(end_date);
  // Difference in milliseconds
  const diffMs = end - now;
  if (diffMs <= 0) return 0;
  // Convert ms to days.
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function amountDivideBy100(value) {
  // Converting the currency number from its smallest unit to normal units
  return (value / 100).toFixed(2)
}

export function discountCalc(percentage_amount, total_amount) {
  const percent_price = (100 - +percentage_amount).toFixed(2);
  return ((percent_price * +total_amount) / 100).toFixed(2);
}
