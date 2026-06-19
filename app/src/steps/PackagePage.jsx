import { useMemo } from "react";
import { Hand, Clock } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetPackages } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button } from "@/components/ui";
import { CardSkeleton } from "@/components/Skeleton";

/**
 * Single-package landing — shown when the shortcode carries a package id
 * ([eternel_booking package="<id>"]). The id is the package group's service id
 * (groups are 1:1 with a service). "Book Now" drops into the package flow
 * (Choose Your Package → ...).
 */
export default function PackagePage() {
  const { forcedPackageId, setUserPackages, setFlowType, setPackageType, goTo } =
    useCheckout();
  const { packages, isLoading } = useGetPackages();

  const group = useMemo(
    () =>
      packages?.find(
        (g) => g?._id === forcedPackageId || g?.service?._id === forcedPackageId
      ) || null,
    [packages, forcedPackageId]
  );

  if (isLoading)
    return (
      <div className="tw-max-w-md tw-mx-auto">
        <CardSkeleton />
      </div>
    );
  if (!group)
    return (
      <div className="tw-text-center tw-py-16 tw-text-grey urbanist">
        This package is not available right now.
      </div>
    );

  const service = group?.service;
  const fourHand = isFourHand(service?.type);

  const handleBook = () => {
    setUserPackages(group);
    setFlowType("package");
    setPackageType(null);
    goTo(STEPS.SELECT_PACKAGE);
  };

  return (
    <div>
      <h1 className="unna tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl tw-text-center tw-text-primary">
        Book Your Package
      </h1>

      <div className="tw-mt-8 tw-mx-auto tw-max-w-md">
        <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm">
          <img
            src={firstImage(service)}
            alt={getField(service, "name")}
            className="tw-w-full tw-h-56 tw-object-cover"
          />
          <div className="tw-flex tw-flex-col tw-p-6">
            <h2 className="tw-text-2xl unna tw-text-primary tw-capitalize">
              {getField(service, "name")}
            </h2>
            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-2">
              <Tag icon={Hand}>{fourHand ? "Four-hand" : "Two-hand"}</Tag>
              <Tag icon={Clock}>{service?.duration} mins</Tag>
            </div>

            <p className="urbanist tw-text-xl unna tw-text-primary tw-mt-4">
              Types of Packages
            </p>
            <div className="eb-scroll tw-mt-2 tw-space-y-1 tw-max-h-48 tw-overflow-auto tw-pr-4">
              {group?.packages?.map((pkg, i) => (
                <div
                  key={pkg?._id}
                  className={`tw-flex tw-justify-between tw-items-start tw-gap-3 tw-py-2 ${
                    i < group.packages.length - 1
                      ? "tw-border-b tw-border-sand"
                      : ""
                  }`}
                >
                  <div className="tw-flex tw-gap-2">
                    <span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-primary tw-mt-2 tw-shrink-0" />
                    <div>
                      <p className="urbanist tw-font-bold tw-text-primary tw-break-all">
                        {getField(pkg, "name")}
                      </p>
                      <p className="urbanist tw-text-sm tw-text-grey">
                        {pkg?.noOfSessions} sessions
                      </p>
                    </div>
                  </div>
                  <span className="unna tw-text-lg tw-text-primary tw-whitespace-nowrap">
                    ${convertToDollars(pkg?.price)}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              className="tw-mt-6 tw-w-full unna tw-text-lg"
              onClick={handleBook}
            >
              Book Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Tag = ({ icon: Icon, children }) => (
  <span className="tw-bg-sand/40 tw-text-primary tw-text-xs tw-font-semibold urbanist tw-px-3 tw-py-1 tw-rounded-full tw-inline-flex tw-items-center tw-gap-1.5">
    {Icon && <Icon className="tw-w-3.5 tw-h-3.5" />}
    {children}
  </span>
);
