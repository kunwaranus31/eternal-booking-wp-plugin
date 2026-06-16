import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, InfoRow } from "@/components/ui";

/**
 * Package flow: review the chosen package before entering guest details.
 * (No date/time/instructor here — package sessions are scheduled later.)
 */
export default function ConfirmPackage() {
  const { userPackages, packageType, goTo, back } = useCheckout();
  const service = userPackages?.service;
  const fourHand = isFourHand(service?.type);

  const details = [
    { title: "Package", text: getField(packageType, "name") },
    { title: "Service", text: getField(service, "name") },
    { title: "Hand type", text: fourHand ? "Four-hand service" : "Two-hand service" },
    {
      title: "Instructors",
      text: fourHand ? "Two instructors" : "One instructor",
    },
    { title: "Duration", text: `${service?.duration} mins` },
    { title: "Sessions", text: `${packageType?.noOfSessions} sessions` },
    { title: "Bonus", text: getField(packageType, "bonus", "-") },
  ];

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Confirm Your Plan
      </h1>

      <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-5 tw-mt-6">
        <div className="tw-w-full laptop:tw-w-1/2">
          <img
            src={firstImage(service)}
            alt={getField(service, "name")}
            className="tw-w-full tw-h-72 tw-object-cover tw-rounded-2xl tw-border tw-border-sand"
          />
        </div>

        <BrownPanel className="tw-w-full laptop:tw-w-1/2">
          <div className="tw-flex tw-justify-between tw-items-center tw-border-b tw-border-white/30 tw-pb-3">
            <h2 className="tw-text-2xl unna tw-text-white">
              {getField(packageType, "name")}
            </h2>
            <span className="tw-text-4xl unna tw-text-sand">
              ${convertToDollars(packageType?.price)}
            </span>
          </div>

          <div className="laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-4 tw-mt-3">
            {details.map((d, i) => (
              <InfoRow key={i} title={d.title} text={d.text} />
            ))}
          </div>

          <div className="tw-flex tw-gap-4 tw-mt-6">
            <Button variant="ghostWhite" className="tw-w-full" onClick={back}>
              Back
            </Button>
            <Button
              variant="primary"
              className="tw-w-full"
              onClick={() => goTo(STEPS.BOOKING_DETAILS)}
            >
              Buy Package
            </Button>
          </div>
        </BrownPanel>
      </div>
    </div>
  );
}
