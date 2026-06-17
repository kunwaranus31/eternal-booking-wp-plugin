import { useMemo, useState } from "react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetPackages } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, Pill } from "@/components/ui";
import Gallery from "@/components/Gallery";
import Dropdown from "@/components/Dropdown";

/**
 * Experience entry step: pick Single Session (→ date/time) or Multiple Session
 * (→ switch to the matching package group → package flow).
 */
export default function BookSlot() {
  const {
    service,
    session,
    setSession,
    setFlowType,
    setUserPackages,
    setPackageType,
    setDateTime,
    setInstructor,
    setAddons,
    goTo,
    back,
  } = useCheckout();
  const { packages } = useGetPackages();
  const [error, setError] = useState("");

  const price = convertToDollars(service?.price);
  const fourHand = isFourHand(service?.type);

  const matchingGroup = useMemo(() => {
    if (!packages || !service) return null;
    return packages.find((g) => g?.service?._id === service?._id) || null;
  }, [packages, service]);

  const handleNext = () => {
    if (!session) {
      setError("Please select a session type.");
      return;
    }
    setError("");
    if (session === "Single Session") {
      // Single (experience) flow — clear any leftover package state so the
      // checkout doesn't process this as a package.
      setFlowType("experience");
      setUserPackages(null);
      setPackageType(null);
      setDateTime("", "");
      goTo(STEPS.DATE_TIME);
    } else {
      // Multiple Session → package flow for this service. Clear any leftover
      // experience-only selections.
      if (!matchingGroup) {
        setError("No packages are available for this experience.");
        return;
      }
      setFlowType("package");
      setUserPackages(matchingGroup);
      setPackageType(null);
      setInstructor(null);
      setAddons(null);
      setDateTime("", "");
      goTo(STEPS.SELECT_PACKAGE);
    }
  };

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Book Your Slot
      </h1>

      <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-5 tw-mt-6">
        {/* Gallery */}
        <div className="tw-w-full laptop:tw-w-1/2">
          <Gallery service={service} />
        </div>

        {/* Details */}
        <BrownPanel className="tw-w-full laptop:tw-w-1/2">
          <div className="tw-flex tw-justify-between tw-items-start tw-gap-4 tw-border-b tw-border-white/30 tw-pb-3">
            <h2 className="tw-text-3xl unna tw-text-white tw-capitalize">
              {getField(service, "name")}
            </h2>
            {service?.price != null && (
              <span className="tw-text-4xl unna tw-text-sand">${price}</span>
            )}
          </div>

          <div className="tw-flex tw-gap-2 tw-flex-wrap tw-mt-3">
            <Pill>{`${service?.duration} mins`}</Pill>
            <Pill>{fourHand ? "Four-hand" : "Two-hand"}</Pill>
            <Pill>{fourHand ? "2 instructors" : "1 instructor"}</Pill>
          </div>

          <p className="urbanist tw-text-white/90 tw-text-sm tw-mt-3">
            {getField(service, "description", "No description available")}
          </p>

          {/* Session dropdown */}
          <div className="tw-mt-5">
            <Dropdown
              title="Choose session"
              placeholder="Choose duration"
              value={session || ""}
              onChange={(val) => {
                setSession(val);
                setError("");
                // Switching session type resets the package selection so the two
                // flows never cross-contaminate.
                setPackageType(null);
                setFlowType(val === "Single Session" ? "experience" : "package");
              }}
              options={[
                { label: "Single Session", value: "Single Session" },
                { label: "Multiple Session (Package)", value: "Multiple Session" },
              ]}
            />
            {error && <p className="tw-text-red tw-mt-2 urbanist">{error}</p>}
          </div>

          <div className="tw-flex tw-flex-col tablet:tw-flex-row tw-gap-3 tw-mt-6">
            <Button variant="ghostWhite" className="tw-w-full" onClick={back}>
              Back
            </Button>
            <Button variant="secondary" className="tw-w-full unna tw-text-lg" onClick={handleNext}>
              {session === "Multiple Session" ? "Buy Package" : "Book Now"}
            </Button>
          </div>
        </BrownPanel>
      </div>
    </div>
  );
}
