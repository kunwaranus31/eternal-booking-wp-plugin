/**
 * Runtime config injected by the WordPress plugin via wp_localize_script
 * (window.ETERNEL_BOOKING_CONFIG). Falls back to sane dev defaults so the app
 * can also run via `npm run dev` using values from index.html.
 */
const injected =
  (typeof window !== "undefined" && window.ETERNEL_BOOKING_CONFIG) || {};

export const config = {
  apiBaseUrl: injected.apiBaseUrl || "http://localhost:3013",
  stripeKey: injected.stripeKey || "",
  rootId: injected.rootId || "eternel-booking-root",
};

// Canadian taxes used by the existing platform.
export const TAX_RATES = {
  TPS: 0.05, // 5%
  TVQ: 0.09975, // 9.975%
};
