import { Loader2, ChevronLeft, X } from "lucide-react";

/* ── Button ──────────────────────────────────────────── */
const VARIANTS = {
  primary: "tw-bg-sand tw-text-primary hover:tw-opacity-90 tw-border tw-border-brown",
  brown: "tw-bg-brown tw-text-white hover:tw-bg-brown-dark",
  outline: "tw-bg-transparent tw-text-primary tw-border tw-border-brown hover:tw-bg-brown/10",
  ghostWhite: "tw-bg-white/20 tw-text-white tw-border tw-border-white hover:tw-bg-white/30",
  text: "tw-bg-transparent tw-text-primary tw-underline hover:tw-opacity-80",
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
    className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-full tw-px-5 tw-py-2.5 tw-font-medium tw-transition tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {loading && <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />}
    {!loading && Icon && <Icon className="tw-w-4 tw-h-4" />}
    {children}
  </button>
);

/* ── Spinner ─────────────────────────────────────────── */
export const Spinner = ({ className = "" }) => (
  <Loader2 className={`tw-animate-spin tw-text-brown ${className}`} />
);

export const Loading = ({ label = "Loading..." }) => (
  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-py-16 tw-text-brown">
    <Spinner className="tw-w-8 tw-h-8" />
    <p className="urbanist">{label}</p>
  </div>
);

/* ── Back button ─────────────────────────────────────── */
export const BackButton = ({ onClick, label = "Back" }) => (
  <button
    onClick={onClick}
    className="tw-inline-flex tw-items-center tw-gap-1 tw-text-brown hover:tw-text-primary tw-mb-2 urbanist"
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
      <div
        className="tw-absolute tw-inset-0 tw-bg-black/50"
        onClick={onClose}
      />
      <div
        className={`tw-relative tw-w-full ${sizes[size]} tw-bg-white tw-rounded-2xl tw-shadow-xl tw-max-h-[90vh] tw-overflow-auto`}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="tw-absolute tw-top-3 tw-right-3 tw-text-brown hover:tw-text-primary tw-z-10"
          >
            <X className="tw-w-5 tw-h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

/* ── Labeled text input ──────────────────────────────── */
export const Field = ({ label, error, touched, className = "", ...props }) => (
  <div className={`tw-w-full ${className}`}>
    {label && (
      <label className="tw-block tw-mb-1 tw-text-sm urbanist tw-text-white">
        {label}
      </label>
    )}
    <input
      className="tw-w-full tw-rounded-lg tw-bg-white tw-border tw-border-white tw-px-4 tw-py-3 tw-text-primary tw-outline-none focus:tw-ring-2 focus:tw-ring-sand"
      {...props}
    />
    {touched && error && (
      <p className="tw-text-red tw-text-sm tw-mt-1">{error}</p>
    )}
  </div>
);

/* ── Info row (label + value) ────────────────────────── */
export const InfoRow = ({ title, text, fullWidth = false }) => (
  <div className={`tw-py-1 ${fullWidth ? "tw-col-span-2" : ""}`}>
    <p className="tw-text-sand tw-text-sm urbanist">{title}</p>
    <p className="tw-text-white urbanist tw-font-medium tw-break-words">{text}</p>
  </div>
);

/* ── Brown panel wrapper ─────────────────────────────── */
export const BrownPanel = ({ className = "", children }) => (
  <div
    className={`tw-bg-primary tw-rounded-2xl tw-p-5 laptop:tw-p-8 ${className}`}
  >
    {children}
  </div>
);

export const InnerBrownBox = ({ className = "", children }) => (
  <div className={`tw-bg-white/10 tw-rounded-xl tw-p-4 tw-mt-3 ${className}`}>
    {children}
  </div>
);
