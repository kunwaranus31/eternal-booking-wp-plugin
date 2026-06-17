import { useMemo } from "react";
import { Star, Hand, Clock } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetServices } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, Loading } from "@/components/ui";

/**
 * Single-service landing — shown when the shortcode carries a service id
 * ([eternel_booking service="<id>"]). Renders just that one service's card;
 * "Book Now" drops into the normal flow (Book Slot → ...).
 */
export default function ServicePage() {
  const { forcedServiceId, setService, setFlowType, setSession, setPackageType, goTo } =
    useCheckout();
  const { services, isLoading } = useGetServices();

  const service = useMemo(
    () => services?.find((s) => s?._id === forcedServiceId) || null,
    [services, forcedServiceId]
  );

  if (isLoading) return <Loading label="Loading experience..." />;
  if (!service)
    return (
      <div className="tw-text-center tw-py-16 tw-text-grey urbanist">
        This experience is not available right now.
      </div>
    );

  const price = convertToDollars(service?.price);
  const fourHand = isFourHand(service?.type);

  const handleBook = () => {
    setService(service);
    setFlowType("experience");
    setSession(null);
    setPackageType(null);
    goTo(STEPS.BOOK_SLOT);
  };

  return (
    <div>
      <h1 className="unna laptop:tw-text-5xl s_phone:tw-text-4xl tw-text-center tw-text-primary">
        Book Your Experience
      </h1>

      <div className="tw-mt-8 tw-mx-auto tw-max-w-md">
        <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm">
          <div className="tw-relative">
            <img
              src={firstImage(service)}
              alt={getField(service, "name")}
              className="tw-w-full tw-h-56 tw-object-cover"
            />
            <div className="tw-absolute tw-top-2 tw-right-2 tw-bg-black/70 tw-rounded-full tw-px-3 tw-py-1 tw-flex tw-items-center tw-gap-1 tw-border tw-border-white/20">
              <Star className="tw-w-3.5 tw-h-3.5 tw-text-yellow-400" fill="currentColor" />
              <span className="tw-text-white tw-text-xs tw-font-semibold">
                {service?.averageRating ? `${service.averageRating}/5` : "No reviews yet"}
              </span>
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-p-6">
            <div className="tw-flex tw-justify-between tw-gap-2 tw-items-start">
              <h2 className="tw-text-2xl unna tw-text-primary tw-capitalize">
                {getField(service, "name")}
              </h2>
              <span className="tw-text-4xl unna tw-text-primary tw-whitespace-nowrap">
                ${price}
              </span>
            </div>

            <p className="urbanist tw-text-sm tw-text-grey tw-mt-2">
              {getField(service, "description")}
            </p>

            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-4">
              <Tag icon={Clock}>{service?.duration} mins</Tag>
              <Tag icon={Hand}>
                {fourHand ? "Four-hand · 2 instructors" : "Two-hand · 1 instructor"}
              </Tag>
            </div>

            <Button
              variant="secondary"
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
