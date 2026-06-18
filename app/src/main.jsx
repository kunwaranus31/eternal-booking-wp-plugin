import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastHost } from "@/utils/toast";
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

  // Optional: a single-service shortcode passes the service id as a data attribute.
  const serviceId = el.dataset.serviceId || el.getAttribute("data-service-id") || null;

  createRoot(el).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CheckoutProvider initialServiceId={serviceId}>
          <App />
          <ToastHost />
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
