/**
 * Pulse skeletons shown while API data loads — mirrors the main app's booking
 * flow (gray placeholder blocks with `animate-pulse`). Uses the plugin's own
 * gray token so it works regardless of the trimmed Tailwind palette.
 */

const Block = ({ className = "" }) => (
  <div className={`tw-bg-gray-medium/30 tw-rounded ${className}`} />
);

/* List rows — instructors / add-ons / saved cards. */
export function RowSkeleton({ count = 4, image = true, isAddon }) {
  return (
    <div className="tw-space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-white tw-border-2 tw-border-sand tw-animate-pulse"
        >
          <span className="tw-w-5 tw-h-5 tw-rounded-full tw-bg-gray-medium/30 tw-shrink-0" />
          {image && (
            <span className="tw-w-14 tw-h-14 tw-rounded-xl tw-bg-gray-medium/30 tw-shrink-0" />
          )}
          <div className="tw-flex-1 tw-space-y-2">
            <Block className="tw-h-4 tw-w-1/2" />
            {!isAddon && <Block className="tw-h-3 tw-w-1/3" />}
          </div>
          {isAddon && <Block className="tw-h-5 tw-w-10 tw-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

/* Time-slot chips grid. */
export function TimeSlotSkeleton({ count = 6 }) {
  return (
    <div className="tw-grid tw-grid-cols-2 laptop:tw-grid-cols-3 tw-gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="tw-h-9 tw-bg-gray-medium/30 tw-animate-pulse" />
      ))}
    </div>
  );
}

/* Listing service / package card. */
export function CardSkeleton() {
  return (
    <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm tw-animate-pulse">
      <div className="tw-w-full tw-h-48 tw-bg-gray-medium/30" />
      <div className="tw-p-5 tw-space-y-3">
        <div className="tw-flex tw-justify-between tw-gap-2">
          <Block className="tw-h-6 tw-w-1/2" />
          <Block className="tw-h-6 tw-w-16" />
        </div>
        <Block className="tw-h-3 tw-w-full" />
        <Block className="tw-h-3 tw-w-2/3" />
        <div className="tw-flex tw-gap-2">
          <Block className="tw-h-6 tw-w-20 tw-rounded-full" />
          <Block className="tw-h-6 tw-w-28 tw-rounded-full" />
        </div>
        <Block className="tw-h-10 tw-w-full tw-rounded-full tw-mt-2" />
      </div>
    </div>
  );
}

/* Grid of card skeletons (experiences / packages listing). */
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="tw-grid tw-gap-6 s_phone:tw-grid-cols-1 tablet:tw-grid-cols-2 laptop:tw-grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
