import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { config } from "@/config";
import { CheckoutProvider } from "@/context/CheckoutContext";
import App from "@/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function mount() {
  const el = document.getElementById(config.rootId);
  if (!el) return; // Shortcode not on this page.

  createRoot(el).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CheckoutProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3500} newestOnTop />
        </CheckoutProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
