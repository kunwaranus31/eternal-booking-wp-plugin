import { Clock, Hand, Users } from "lucide-react";
import { convertToDollars, addMinutes, formatDate } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { InfoRow } from "@/components/ui";

/**
 * Left-hand summary used across the date/instructor/addon steps: service image,
 * name, price and a set of info rows. Optionally shows the chosen date/time,
 * instructors and addons as the user progresses.
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

  const rows = [
    { icon: Clock, title: "Duration", text: `${service?.duration} minutes` },
    {
      icon: Hand,
      title: "Hand type",
      text: fourHand ? "Four-hand service" : "Two-hand service",
    },
    {
      icon: Users,
      title: "Instructors",
      text: fourHand ? "Two instructors" : "One instructor",
    },
  ];

  return (
    <div className="tw-w-full">
      <img
        src={firstImage(service)}
        alt={getField(service, "name")}
        className="tw-rounded-xl tw-border tw-border-sand tw-w-full tw-h-56 tw-object-cover"
      />
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-mt-3">
        <h2 className="tw-text-2xl unna tw-text-white tw-capitalize tw-line-clamp-2">
          {getField(service, "name", "No service selected")}
        </h2>
        {showPrice && (
          <span className="tw-text-4xl unna tw-text-sand tw-whitespace-nowrap">
            ${price || "--"}
          </span>
        )}
      </div>

      <div className="tw-mt-3 tw-space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="tw-flex tw-items-center tw-gap-2 tw-text-white">
            <r.icon className="tw-w-4 tw-h-4 tw-text-sand" />
            <span className="urbanist tw-text-sm">{r.text}</span>
          </div>
        ))}
      </div>

      {(date || instructor?.length || addons?.length) && (
        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-white/30 laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-4">
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
            />
          )}
          {addons?.length > 0 && (
            <InfoRow
              title="Add-on"
              text={addons
                .map(
                  (a) => `${getField(a, "name")} (+$${convertToDollars(a?.price)})`
                )
                .join(", ")}
            />
          )}
        </div>
      )}
    </div>
  );
}
