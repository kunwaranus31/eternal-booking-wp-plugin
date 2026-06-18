import { useState } from "react";
import { Clock, Hand, User, Users } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { getField, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, Pill } from "@/components/ui";
import Gallery from "@/components/Gallery";
import PackagesDropdown from "@/components/PackagesDropdown";

/**
 * Package flow: choose which package (session count) within the selected group.
 * Mirrors the main app's "Choose Your Package" screen — gallery on the left and
 * a brown details panel (name → info pills → description → packages dropdown).
 */
export default function SelectPackage() {
  const { userPackages, packageType, setPackageType, goTo, back } = useCheckout();
  const service = userPackages?.service;
  const packages = userPackages?.packages || [];
  const [error, setError] = useState("");

  const fourHand = isFourHand(service?.type);

  const handleSelect = (pkg) => {
    setPackageType(pkg);
    setError("");
  };

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
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Choose Your Package
      </h1>

      <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-5 tw-mt-6">
        {/* Gallery */}
        <div className="tw-w-full laptop:tw-w-1/2">
          <Gallery service={service} />
        </div>

        {/* Details */}
        <BrownPanel className="tw-w-full laptop:tw-w-1/2">
          <h2 className="tw-text-3xl unna tw-text-white tw-capitalize tw-border-b tw-border-white/30 tw-pb-3">
            {getField(service, "name")}
          </h2>

          <div className="tw-flex tw-gap-2 tw-flex-wrap tw-mt-3">
            <Pill>
              <Clock className="tw-w-4 tw-h-4 tw-text-sand" />
              {`${service?.duration} mins`}
            </Pill>
            <Pill>
              <Hand className="tw-w-4 tw-h-4 tw-text-sand" />
              {fourHand ? "Four-hand" : "Two-hand"}
            </Pill>
            <Pill>
              {fourHand ? (
                <Users className="tw-w-4 tw-h-4 tw-text-sand" />
              ) : (
                <User className="tw-w-4 tw-h-4 tw-text-sand" />
              )}
              {fourHand ? "2 instructors" : "1 instructor"}
            </Pill>
          </div>

          <p className="urbanist tw-text-white/90 tw-text-sm tw-mt-3">
            {getField(service, "description", "No description available")}
          </p>

          {/* Packages dropdown */}
          <div className="tw-mt-5">
            {packages.length === 0 ? (
              <p className="urbanist tw-text-white tw-font-medium">
                No packages available for this service.
              </p>
            ) : (
              <PackagesDropdown
                title="Types of Packages"
                placeholder="Choose Package"
                packageType={packageType}
                setPackageType={handleSelect}
                data={packages}
              />
            )}
            {error && <p className="tw-text-red tw-mt-2 urbanist">{error}</p>}
          </div>

          <div className="tw-flex tw-flex-col tablet:tw-flex-row tw-gap-3 tw-mt-6">
            <Button variant="ghostWhite" className="tw-w-full" onClick={back}>
              Back
            </Button>
            <Button
              variant="secondary"
              className="tw-w-full unna tw-text-lg"
              onClick={handleNext}
              disabled={!packageType || packages.length === 0}
            >
              Next
            </Button>
          </div>
        </BrownPanel>
      </div>
    </div>
  );
}
