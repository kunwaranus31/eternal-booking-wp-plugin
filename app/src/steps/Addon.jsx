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
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
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
                      className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-2 tw-p-3 tw-rounded-xl tw-text-left tw-transition tw-border-2 ${
                        active ? "tw-bg-sand tw-border-white" : "tw-bg-white tw-border-sand"
                      }`}
                    >
                      <div className="tw-flex tw-items-center tw-gap-3 tw-min-w-0">
                        <span className="tw-w-5 tw-h-5 tw-border-2 tw-border-primary tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0">
                          {active && <span className="tw-w-3 tw-h-3 tw-bg-primary tw-rounded-full" />}
                        </span>
                        {firstImage(addon) && (
                          <img
                            src={firstImage(addon)}
                            alt={getField(addon, "name")}
                            className="tw-w-15 tw-h-15 tw-rounded-xl tw-object-cover tw-border-2 tw-border-sand"
                          />
                        )}
                        <h4 className="unna tw-text-primary tw-text-lg tw-leading-tight tw-line-clamp-2">
                          {getField(addon, "name")}
                        </h4>
                      </div>
                      <h3 className="unna tw-text-primary tw-text-2xl tw-font-bold tw-whitespace-nowrap">
                        +${convertToDollars(addon?.price)}
                      </h3>
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
