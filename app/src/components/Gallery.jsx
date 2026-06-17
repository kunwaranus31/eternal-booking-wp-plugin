import { useState, useEffect } from "react";
import { getField } from "@/utils/format";

/**
 * Image gallery — large active image + clickable thumbnails. Mirrors the main
 * app's Gallery: click a thumbnail to swap the main image.
 */
export default function Gallery({ service }) {
  const images = service?.images || [];
  const [active, setActive] = useState(images[0]?.location);

  // Reset active image when the service changes.
  useEffect(() => {
    setActive(images[0]?.location);
  }, [service?._id]);

  if (!images.length) {
    return (
      <div className="tw-w-full tw-h-72 laptop:tw-h-96 tw-rounded-2xl tw-bg-sand/40 tw-border tw-border-sand" />
    );
  }

  return (
    <div className="tw-w-full tw-flex tw-flex-col tw-gap-3">
      {/* Main image */}
      <img
        key={active}
        src={active}
        alt={getField(service, "name")}
        className="tw-w-full tw-h-72 laptop:tw-h-96 tw-object-cover tw-rounded-2xl tw-border tw-border-sand animate-fade-in"
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="tw-grid tw-grid-cols-4 phone:tw-grid-cols-5 tw-gap-2">
          {images.map((img, i) => {
            const isActive = active === img?.location;
            return (
              <img
                key={i}
                src={img?.location}
                alt={img?.name || `thumbnail ${i + 1}`}
                onClick={() => setActive(img?.location)}
                className={`tw-w-full tw-h-16 phone:tw-h-20 tw-object-cover tw-rounded-xl tw-cursor-pointer tw-transition tw-border-2 ${
                  isActive ? "tw-border-primary" : "tw-border-sand hover:tw-border-primary/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
