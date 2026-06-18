import { convertToDollars, addMinutes, formatDate } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { InfoRow } from "@/components/ui";

/**
 * Left-hand summary used across the date/instructor/addon steps — mirrors the
 * main app's ShopBrownWrapper left column: image, name, price + info rows.
 */
export default function ServiceSummary({
  service,
  showPrice = true,
  date,
  time,
  instructor,
  addons,
}) {
  const price = convertToDollars(service?.price);
  const fourHand = isFourHand(service?.type);

  return (
    <div className="tw-w-full">
      <img
        src={firstImage(service)}
        alt={getField(service, "name")}
        className="tw-rounded-xl tw-border tw-border-sand tw-w-full s_phone:tw-h-60 laptop:tw-h-70 tw-object-cover"
      />
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-mt-3">
        <h2 className="tw-text-2xl laptop:tw-text-3xl unna tw-text-primary tw-capitalize tw-line-clamp-2">
          {getField(service, "name", "No service selected")}
        </h2>
        {showPrice && (
          <span className="tw-text-4xl laptop:tw-text-5xl unna tw-text-secondary tw-whitespace-nowrap">
            ${price || "--"}
          </span>
        )}
      </div>

      <div className="laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-3">
        <InfoRow title="Duration" text={`${service?.duration} minutes`} />
        <InfoRow
          title="Hand type"
          text={fourHand ? "4 hand - Two instructors" : "2 hand - One instructor"}
        />
        {/* <InfoRow
          title={fourHand ? "Instructors" : "Instructor"}
          text={fourHand ? "Two instructors" : "One instructor"}
          fullWidth
        /> */}

        {date && (
          <InfoRow
            title="Date & Time"
            text={`${formatDate(date)}${time ? `, ${addMinutes(time)}` : ""}`}
            fullWidth
          />
        )}
        {instructor?.length > 0 && (
          <InfoRow
            title={instructor.length > 1 ? "Instructors" : "Instructor"}
            text={instructor.map((i) => i?.name).join(", ")}
            fullWidth
          />
        )}
        {addons?.length > 0 && (
          <InfoRow
            title="Add-on"
            text={addons
              .map((a) => `${getField(a, "name")} (+$${convertToDollars(a?.price)})`)
              .join(", ")}
            fullWidth
          />
        )}
      </div>
    </div>
  );
}
