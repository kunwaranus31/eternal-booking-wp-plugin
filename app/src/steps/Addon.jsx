import { useState } from "react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetAddons } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage } from "@/utils/format";
import { Button, BackButton, BrownPanel, Spinner } from "@/components/ui";
import ServiceSummary from "@/components/ServiceSummary";

export default function Addon() {
  const { service, date, time, instructor, addons, setAddons, goTo, back } =
    useCheckout();
  const { addons: addonList, isLoading } = useGetAddons();

  const [selected, setSelected] = useState(addons?.[0]?._id || null);

  const toggle = (id) => setSelected((prev) => (prev === id ? null : id));

  const handleContinue = () => {
    const chosen = addonList?.find((a) => a?._id === selected);
    setAddons(chosen ? [chosen] : []);
    goTo(STEPS.BOOKING_DETAILS);
  };

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Select Add-on
      </h1>

      <BrownPanel className="tw-mt-6">
        <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-6">
          <div className="tw-w-full laptop:tw-w-1/2">
            <ServiceSummary
              service={service}
              date={date}
              time={time}
              instructor={instructor}
            />
          </div>

          <div className="tw-w-full laptop:tw-w-1/2 tw-bg-white/10 tw-rounded-2xl tw-p-4 tw-flex tw-flex-col">
            <h3 className="tw-text-2xl unna tw-text-white tw-mb-3">Add-on Options</h3>

            <div className="tw-flex-1 tw-space-y-2 tw-max-h-96 tw-overflow-auto">
              {isLoading ? (
                <div className="tw-flex tw-justify-center tw-py-8">
                  <Spinner className="tw-w-6 tw-h-6 tw-text-white" />
                </div>
              ) : !addonList?.length ? (
                <p className="urbanist tw-text-white/80">No add-ons available.</p>
              ) : (
                addonList.map((addon) => {
                  const active = selected === addon?._id;
                  return (
                    <button
                      key={addon?._id}
                      onClick={() => toggle(addon?._id)}
                      className={`tw-w-full tw-flex tw-items-center tw-gap-3 tw-p-3 tw-rounded-xl tw-border tw-transition tw-text-left ${
                        active
                          ? "tw-bg-sand tw-border-sand tw-text-primary"
                          : "tw-bg-white tw-border-white tw-text-primary hover:tw-bg-sand/40"
                      }`}
                    >
                      <span
                        className={`tw-w-5 tw-h-5 tw-rounded-full tw-border-2 tw-shrink-0 ${
                          active ? "tw-bg-primary tw-border-primary" : "tw-border-brown"
                        }`}
                      />
                      {firstImage(addon) && (
                        <img
                          src={firstImage(addon)}
                          alt={getField(addon, "name")}
                          className="tw-w-12 tw-h-12 tw-rounded-lg tw-object-cover"
                        />
                      )}
                      <span className="urbanist tw-font-medium tw-flex-1">
                        {getField(addon, "name")}
                      </span>
                      <span className="urbanist tw-font-semibold">
                        +${convertToDollars(addon?.price)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <Button
              variant="primary"
              className="tw-w-full tw-mt-5"
              onClick={handleContinue}
            >
              {selected ? "Continue" : "Skip"}
            </Button>
          </div>
        </div>
      </BrownPanel>
    </div>
  );
}
