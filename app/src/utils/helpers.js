import moment from "moment";

/**
 * Convert a price stored in CENTS to a display dollar string.
 * Mirrors the main app: integers show without decimals, otherwise 2 dp.
 */
export function convertToDollars(priceInCents) {
  if (
    isNaN(priceInCents) ||
    priceInCents == null ||
    priceInCents < 0 ||
    !Number.isInteger(priceInCents)
  ) {
    return null;
  }
  const dollars = priceInCents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
  return dollars % 1 === 0 ? formatted.split(".")[0] : formatted;
}

/**
 * "02:30 PM" + 90 mins → "02:30 PM - 04:00 PM"
 */
export const addMinutes = (timeStr, minutesToAdd = 90) => {
  if (!timeStr) return "";
  const start = moment(timeStr, ["hh:mm A", "HH:mm"]);
  const end = start.clone().add(minutesToAdd, "minutes");
  return `${start.format("hh:mm A")} - ${end.format("hh:mm A")}`;
};

/** "10:00 AM" → "10:00" (24h, for API payloads) */
export const to24h = (time) => {
  if (!time) return "";
  const parsed = moment(time, ["hh:mm A", "HH:mm", "HH:mm:ss"]);
  return parsed.isValid() ? parsed.format("HH:mm") : "";
};

/** Sum addon prices (cents). Matches main app behaviour. */
export const calculateAddonsPrice = (addons) =>
  addons?.length > 0
    ? addons.reduce((total, item) => Number(item.price || 0), 0)
    : 0;

export const formatDate = (date) =>
  date ? moment(date, ["YYYY-MM-DD", moment.ISO_8601]).format("MMM D, YYYY") : "";
