/**
 * Resolve a possibly-translated field to plain English text.
 *
 * The backend may store a field as a plain string OR as a localized object
 * like { en: "...", fr: "..." }. Since this widget is English-only we just want
 * a readable string in either case.
 */
export const getField = (item, field, fallback = "") => {
  if (!item) return fallback;
  const value = item[field];
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.en || value.fr || Object.values(value)[0] || fallback;
  }
  return String(value);
};

/** First image location of a service/package, with a safe fallback. */
export const firstImage = (item, fallback = "") =>
  item?.images?.[0]?.location || fallback;

/** "four-hand" → true (two instructors), else false. */
export const isFourHand = (type) => type === "four-hand";
