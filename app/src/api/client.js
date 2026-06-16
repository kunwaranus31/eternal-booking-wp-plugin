import axios from "axios";
import { config } from "@/config";

/**
 * Single axios instance pointed at the configured API base URL.
 * The guest booking flow needs no auth token, so this stays minimal.
 */
export const client = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { Accept: "application/json" },
  timeout: 60 * 1000,
});
