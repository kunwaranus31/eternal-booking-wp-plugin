import { useState } from "react";
import { Info } from "lucide-react";

/**
 * Small info icon that reveals a description on hover (desktop) or tap (mobile).
 * Mirrors the main app's addon tooltip. If there's no description, just the icon
 * is shown (no popover).
 */
export default function InfoTooltip({ title, description, openUp = false }) {
  const [show, setShow] = useState(false);
  const has = !!description;

  return (
    <span
      className="tw-relative tw-shrink-0 tw-inline-flex"
      onMouseEnter={() => has && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info
        className="tw-w-5 tw-h-5 tw-text-primary/70 hover:tw-text-primary tw-cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (has) setShow((s) => !s);
        }}
      />
      {show && has && (
        <span
          onClick={(e) => e.stopPropagation()}
          className={`tw-absolute tw-z-[70] tw-right-0 tw-w-52 tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-sand tw-p-3 tw-text-left ${
            openUp ? "tw-bottom-full tw-mb-2" : "tw-top-full tw-mt-2"
          }`}
        >
          {title && (
            <span className="tw-block unna tw-font-bold tw-text-primary tw-mb-1">
              {title}
            </span>
          )}
          <span className="tw-block urbanist tw-text-sm tw-text-grey tw-break-words">
            {description}
          </span>
        </span>
      )}
    </span>
  );
}
