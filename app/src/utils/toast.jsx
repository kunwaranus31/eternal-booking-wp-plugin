import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

/**
 * Self-contained toast system.
 *
 * react-toastify relies on its own external stylesheet, which doesn't survive
 * reliably inside WordPress (CSS inlining / theme conflicts), so toasts rendered
 * invisibly. This replacement uses only our own `tw-` utilities — which are
 * always loaded with the plugin — so notifications show up everywhere.
 *
 * Drop-in API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`.
 */
let listeners = [];
let counter = 0;

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

const STYLES = {
  success: { Icon: CheckCircle2, accent: "tw-border-l-green-600", icon: "tw-text-green-600" },
  error: { Icon: XCircle, accent: "tw-border-l-red", icon: "tw-text-red" },
  info: { Icon: Info, accent: "tw-border-l-primary", icon: "tw-text-primary" },
};

function ToastItem({ toast: t, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const { Icon, accent, icon } = STYLES[t.type] || STYLES.info;

  return (
    <div
      className={`tw-pointer-events-auto tw-flex tw-items-start tw-gap-3 tw-w-80 tw-max-w-[90vw] tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-sand tw-border-l-4 ${accent} tw-px-4 tw-py-3`}
      role="alert"
    >
      <Icon className={`tw-w-5 tw-h-5 tw-shrink-0 tw-mt-0.5 ${icon}`} />
      <p className="urbanist tw-text-sm tw-text-primary tw-flex-1 tw-break-words">
        {t.message}
      </p>
      <button
        onClick={onClose}
        className="tw-shrink-0 tw-text-grey/60 hover:tw-text-primary tw-transition-colors"
        aria-label="Dismiss"
      >
        <X className="tw-w-4 tw-h-4" />
      </button>
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
    const listener = (t) => setItems((prev) => [...prev, t]);
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
