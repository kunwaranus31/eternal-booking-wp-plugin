import { useState } from "react";
import { Check } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel } from "@/components/ui";

/**
 * Package flow: choose which package (session count) within the selected group.
 */
export default function SelectPackage() {
  const { userPackages, packageType, setPackageType, goTo, back } = useCheckout();
  const service = userPackages?.service;
  const packages = userPackages?.packages || [];
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!packageType) {
      setError("Please select a package.");
      return;
    }
    goTo(STEPS.CONFIRM_PACKAGE);
  };

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Choose Your Package
      </h1>

      <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-5 tw-mt-6">
        <div className="tw-w-full laptop:tw-w-1/2">
          <img
            src={firstImage(service)}
            alt={getField(service, "name")}
            className="tw-w-full tw-h-72 tw-object-cover tw-rounded-2xl tw-border tw-border-sand"
          />
          <h2 className="tw-text-2xl unna tw-mt-3 tw-capitalize tw-text-primary">
            {getField(service, "name")}
          </h2>
          <p className="urbanist tw-text-sm tw-text-brown">
            {service?.duration} mins · {isFourHand(service?.type) ? "Four-hand" : "Two-hand"}
          </p>
        </div>

        <BrownPanel className="tw-w-full laptop:tw-w-1/2">
          <h3 className="tw-text-2xl unna tw-text-white tw-mb-3">Types of Packages</h3>
          <div className="tw-space-y-2 tw-max-h-96 tw-overflow-auto">
            {packages.map((pkg) => {
              const active = packageType?._id === pkg?._id;
              return (
                <button
                  key={pkg?._id}
                  onClick={() => {
                    setPackageType(pkg);
                    setError("");
                  }}
                  className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-3 tw-p-3 tw-rounded-xl tw-border tw-text-left tw-transition ${
                    active
                      ? "tw-bg-sand tw-border-sand tw-text-primary"
                      : "tw-bg-white tw-border-white tw-text-primary hover:tw-bg-sand/40"
                  }`}
                >
                  <div>
                    <p className="urbanist tw-font-semibold">{getField(pkg, "name")}</p>
                    <p className="urbanist tw-text-sm tw-text-brown">
                      {pkg?.noOfSessions} sessions
                      {getField(pkg, "bonus") ? ` · Bonus: ${getField(pkg, "bonus")}` : ""}
                    </p>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="unna tw-text-xl">${convertToDollars(pkg?.price)}</span>
                    {active && <Check className="tw-w-5 tw-h-5" />}
                  </div>
                </button>
              );
            })}
          </div>
          {error && <p className="tw-text-red tw-mt-2 urbanist">{error}</p>}

          <div className="tw-flex tw-gap-4 tw-mt-6">
            <Button variant="ghostWhite" className="tw-w-full" onClick={back}>
              Back
            </Button>
            <Button variant="primary" className="tw-w-full" onClick={handleNext}>
              Next
            </Button>
          </div>
        </BrownPanel>
      </div>
    </div>
  );
}
