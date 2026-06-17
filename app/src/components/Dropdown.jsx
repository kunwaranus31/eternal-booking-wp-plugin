import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Custom dropdown (no native <select>) so it looks identical on every device —
 * mirrors the main app's ServiceDropdown: white box, rotating chevron, animated
 * option list. Designed to sit on the brown panel (white label above).
 */
export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  title,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside.
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="tw-w-full" ref={ref}>
      {title && (
        <p className="urbanist tw-text-lg tw-text-white tw-mb-1">{title}</p>
      )}

      {/* Header */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="tw-bg-white tw-px-4 tw-py-3 tw-rounded-md tw-border tw-border-gray-medium tw-flex tw-justify-between tw-items-center tw-gap-2 tw-cursor-pointer"
      >
        <span
          className={`urbanist tw-text-sm tw-font-medium ${
            selectedLabel ? "tw-text-primary" : "tw-text-grey/60"
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`tw-w-5 tw-h-5 tw-text-primary tw-shrink-0 tw-transition-transform tw-duration-300 ${
            open ? "tw-rotate-180" : ""
          }`}
        />
      </div>

      {/* Options */}
      <div
        className={`tw-overflow-hidden tw-transition-all tw-duration-300 tw-ease-in-out ${
          open ? "tw-max-h-72 tw-opacity-100 tw-mt-2" : "tw-max-h-0 tw-opacity-0"
        }`}
      >
        <div className="tw-bg-white tw-rounded-md tw-border tw-border-gray-medium tw-p-1 tw-shadow-sm">
          {options.map((opt, i) => (
            <p
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`tw-cursor-pointer tw-px-3 tw-py-2 tw-rounded urbanist tw-text-primary tw-transition-colors hover:tw-bg-sand/40 ${
                value === opt.value ? "tw-bg-sand/50 tw-font-semibold" : ""
              } ${i !== options.length - 1 ? "tw-border-b tw-border-gray" : ""}`}
            >
              {opt.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
