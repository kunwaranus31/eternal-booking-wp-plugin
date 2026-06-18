import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

/**
 * Self-contained toast system.
 *
 * react-toastify relies on its own external stylesheet, which doesn't survive
 * reliably inside WordPress (CSS inlining / theme conflicts), so toasts rendered
 * invisibly. This replacement reproduces the main app's react-toastify look —
 * sand background, brown text/icon, a brown progress bar, slide-in, pause on
 * hover — using only our own (always-loaded) styles, recoloured to the plugin's
 * own theme tokens.
 *
 * Drop-in API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`.
 */
let listeners = [];
let counter = 0;

const AUTO_CLOSE = 4000;

function emit(type, message) {
  if (!message) return;
  const id = ++counter;
  listeners.forEach((l) => l({ id, type, message: String(message) }));
}

export const toast = {
  success: (m) => emit("success", m),
  error: (m) => emit("error", m),
  info: (m) => emit("info", m),
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

function ToastItem({ toast: t, onClose }) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(AUTO_CLOSE);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Auto-dismiss, pausing the countdown while hovered (like react-toastify).
  useEffect(() => {
    if (paused) {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startRef.current;
      return;
    }
    startRef.current = Date.now();
    timerRef.current = setTimeout(onClose, Math.max(remainingRef.current, 0));
    return () => clearTimeout(timerRef.current);
  }, [paused, onClose]);

  const Icon = ICONS[t.type] || Info;

  return (
    <div
      className="eb-toast tw-pointer-events-auto tw-relative tw-flex tw-items-center tw-gap-3 tw-w-auto tw-max-w-96 tw-bg-sand tw-text-brown tw-rounded-lg tw-shadow-lg tw-overflow-hidden tw-pl-4 tw-pr-3 tw-py-3"
      role="alert"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Icon className="tw-w-7 tw-h-7 tw-shrink-0 tw-mt-0.5 tw-text-brown" />
      <p className="urbanist tw-p-0 tw-text-lg tw-font-semibold tw-text-brown tw-flex-1 tw-break-words">
        {t.message}
      </p>
      <span
        onClick={onClose}
        className="tw-shrink-0 tw-text-brown hover:tw-opacity-70 tw-transition-opacity tw-border-none tw-bg-none tw-cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="tw-w-4 tw-h-4" />
      </span>
      <span
        className="eb-toast-progress"
        style={{
          animationDuration: `${AUTO_CLOSE}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </div>
  );
}

/**
 * Mount once near the app root. Renders fixed in the top-right corner with a
 * very high z-index so it sits above WordPress theme chrome.
 *
 * Portaled to `document.body` so the fixed container escapes any ancestor that
 * establishes a stacking/containing context (e.g. `transform`, `filter`,
 * `overflow`) from the WordPress theme — otherwise the toasts get clipped or
 * pinned mid-page instead of the viewport corner.
 */
export function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const listener = (t) => setItems((prev) => [t, ...prev]); // newest on top
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const remove = (id) => setItems((prev) => prev.filter((t) => t.id !== id));

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="tw-fixed tw-top-4 tw-right-4 tw-z-[99999] tw-flex tw-flex-col tw-gap-2 tw-pointer-events-none">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>,
    document.body
  );
}
