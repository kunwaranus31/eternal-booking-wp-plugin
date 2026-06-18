import { Loader2, ChevronLeft, X } from "lucide-react";

/* ── Button (rounded-full, brand variants) ───────────── */
const VARIANTS = {
  primary: "tw-bg-primary tw-text-white hover:tw-opacity-70",
  secondary: "tw-bg-sand tw-text-primary hover:tw-opacity-80",
  gradient:
    "tw-bg-gradient-to-b tw-from-[#cf7230] tw-to-[#3c190e] tw-text-white hover:tw-opacity-80",
  outline:
    "tw-bg-black/10 tw-border tw-border-black tw-text-black hover:tw-bg-primary hover:tw-text-white",
  ghostWhite:
    "tw-bg-white/20 tw-text-white tw-border tw-border-white hover:tw-bg-white/30",
  text: "tw-bg-transparent tw-text-primary hover:tw-underline hover:tw-opacity-70",
};

export const Button = ({
  variant = "primary",
  className = "",
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-full tw-px-6 tw-py-2.5 tw-font-medium urbanist tw-transition-colors tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {loading && <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />}
    {!loading && Icon && <Icon className="tw-w-5 tw-h-5" />}
    {children}
  </button>
);

/* ── Spinner / Loading ───────────────────────────────── */
export const Spinner = ({ className = "" }) => (
  <Loader2 className={`tw-animate-spin tw-text-primary ${className}`} />
);

export const Loading = ({ label = "Loading..." }) => (
  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-py-16 tw-text-primary">
    <Spinner className="tw-w-8 tw-h-8" />
    <p className="urbanist">{label}</p>
  </div>
);

/* ── Back button ─────────────────────────────────────── */
export const BackButton = ({ onClick, label = "Back" }) => (
  <button
    onClick={onClick}
    className="tw-inline-flex tw-items-center tw-gap-1 tw-text-primary hover:tw-opacity-70 tw-mb-2 urbanist tw-font-medium"
  >
    <ChevronLeft className="tw-w-5 tw-h-5" />
    {label}
  </button>
);

/* ── Modal (fixed overlay, stays inside widget scope) ─── */
export const Modal = ({ open, onClose, children, size = "md", showClose = true }) => {
  if (!open) return null;
  const sizes = { sm: "tw-max-w-sm", md: "tw-max-w-md", lg: "tw-max-w-2xl" };
  return (
    <div className="tw-fixed tw-inset-0 tw-z-[99999] tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-absolute tw-inset-0 tw-bg-black/50" onClick={onClose} />
      <div
        className={`eb-scroll tw-relative tw-w-full ${sizes[size]} tw-bg-white tw-rounded-2xl tw-shadow-xl tw-max-h-[90vh] tw-overflow-auto`}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="tw-absolute tw-top-3 tw-right-3 tw-text-primary hover:tw-opacity-70 tw-z-10"
          >
            <X className="tw-w-5 tw-h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

/* ── Labeled input (white field on brown panel) ──────── */
export const Field = ({ label, error, touched, required, className = "", ...props }) => (
  <div className="tw-w-full">
    {label && (
      <label className="tw-text-lg urbanist tw-font-semibold tw-text-white">
        {label}
        {required && <span className="tw-text-white tw-ml-1">*</span>}
      </label>
    )}
    <input
      className={`tw-w-full tw-text-lg tw-px-4 tw-py-2 tw-rounded-md tw-text-black tw-bg-white/95 focus:tw-outline-none tw-mt-2 ${className}`}
      {...props}
    />
    {touched && error && (
      <p className="tw-text-red tw-text-xs tw-mt-1 tw-ml-1 tw-font-medium">{error}</p>
    )}
  </div>
);

/* ── Info row (label + value) — matches ServiceInfoBox ─ */
export const InfoRow = ({ title, text, fullWidth = false }) => (
  <div
    className={`tw-p-2 tw-rounded-lg tw-border tw-border-white tw-mt-3 tw-bg-black/20 tw-w-full tw-break-words ${
      fullWidth ? "tw-col-span-2" : ""
    }`}
  >
    <p className="urbanist tw-font-bold tw-text-sand">{title}</p>
    <p className="urbanist tw-text-white">{text}</p>
  </div>
);

/* ── Brown gradient panel — matches ShopBrownWrapper ─── */
export const BrownPanel = ({ className = "", children }) => (
  <div
    className={`tw-bg-gradient-to-br tw-from-[#623b27] tw-to-[#362119] tw-rounded-2xl tw-w-full tw-h-fit tw-p-4 laptop:tw-p-6 ${className}`}
  >
    {children}
  </div>
);

/* ── Pill tag (sand/20) ──────────────────────────────── */
export const Pill = ({ children, className = "" }) => (
  <span
    className={`tw-bg-sand/20 tw-text-white tw-text-sm urbanist tw-px-4 tw-py-1 tw-rounded-full tw-inline-flex tw-items-center tw-gap-2 ${className}`}
  >
    {children}
  </span>
);
