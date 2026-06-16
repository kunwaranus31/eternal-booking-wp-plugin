import { loadStripe } from "@stripe/stripe-js";
import { config } from "@/config";

/**
 * Single Stripe instance from the publishable key configured in WP admin.
 * Resolves to null if no key is set (the payment step surfaces a message).
 */
export const stripePromise = config.stripeKey
  ? loadStripe(config.stripeKey)
  : Promise.resolve(null);
