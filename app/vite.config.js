import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

/**
 * Builds the booking widget into ../build as a SINGLE, self-executing (IIFE) JS
 * file + single CSS file with stable names. IIFE (not ESM) is important: the
 * WordPress plugin enqueues this as a CLASSIC <script> via wp_enqueue_script,
 * so it must run without type="module".
 */
export default defineConfig({
  plugins: [react()],
  // Lib mode does NOT auto-replace process.env.* the way app mode does, so React
  // & friends crash with "process is not defined" in the browser. Replace them
  // at build time. NODE_ENV=production also drops React's dev-only code paths.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: resolve(__dirname, "../build"),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/main.jsx"),
      name: "EternelBooking",
      formats: ["iife"],
      fileName: () => "eternel-booking.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "eternel-booking.[ext]",
      },
    },
  },
});
