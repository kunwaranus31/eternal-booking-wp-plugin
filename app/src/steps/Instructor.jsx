import { useEffect, useState } from "react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetAvailableInstructors } from "@/hooks";
import { getField, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, Spinner } from "@/components/ui";
import ServiceSummary from "@/components/ServiceSummary";
import { _images } from "../assets";

export default function Instructor() {
  const { service, date, time, instructor, setInstructor, setAddons, goTo, back } =
    useCheckout();
  const { getAvailableInstructors, availableInstructors, isLoading } =
    useGetAvailableInstructors();

  const fourHand = isFourHand(service?.type);
  const required = fourHand ? 2 : 1;
  const [selected, setSelected] = useState(instructor || []);

  useEffect(() => {
    if (service?._id && date && time) {
      getAvailableInstructors({ serviceId: service._id, date, startTime: time });
    }
  }, [service?._id, date, time]);

  const toggle = (inst) => {
    setSelected((prev) => {
      const exists = prev.find((i) => i?._id === inst?._id);
      if (exists) return prev.filter((i) => i?._id !== inst?._id);
      if (prev.length >= required) {
        // replace oldest when single, or block when full for four-hand
        return required === 1 ? [inst] : [...prev.slice(1), inst];
      }
      return [...prev, inst];
    });
  };

  const handleContinue = () => {
    setInstructor(selected);
    setAddons(null);
    goTo(STEPS.ADDON);
  };

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Select Instructor{required > 1 ? "s" : ""}
      </h1>

      <BrownPanel className="tw-mt-6">
        <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-6">
          <div className="tw-w-full laptop:tw-w-1/2">
            <ServiceSummary service={service} date={date} time={time} />
          </div>

          <div className="tw-w-full laptop:tw-w-1/2 tw-bg-white/50 tw-rounded-2xl tw-p-4">
            <h3 className="tw-text-2xl unna tw-text-primary tw-mb-1">
              Available {required > 1 ? "Instructors" : "Instructor"}
            </h3>
            <p className="urbanist tw-text-secondary tw-text-sm tw-mb-3">
              Select {required} {required > 1 ? "instructors" : "instructor"}.
            </p>

            {isLoading ? (
              <div className="tw-flex tw-justify-center tw-py-8">
                <Spinner className="tw-w-6 tw-h-6 tw-text-primary" />
              </div>
            ) : availableInstructors?.length > 0 ? (
              <div className="eb-scroll tw-space-y-2 tw-max-h-96 tw-overflow-auto tw-pr-1">
                {availableInstructors.map((inst) => {
                  const active = selected.find((i) => i?._id === inst?._id);
                  return (
                    <button
                      key={inst?._id}
                      onClick={() => toggle(inst)}
                      className={`tw-w-full tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-xl tw-text-left tw-transition tw-border-2 ${
                        active ? "tw-bg-sand tw-border-primary" : "tw-bg-white tw-border-sand"
                      }`}
                    >
                      <span className="tw-w-5 tw-h-5 tw-border-2 tw-border-primary tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0">
                        {active && <span className="tw-w-3 tw-h-3 tw-bg-primary tw-rounded-full" />}
                      </span>
                      <img
                        src={inst?.profilePicture?.location || _images?.instructor}
                        alt={inst?.name}
                        className="tw-w-14 tw-h-14 tw-rounded-xl tw-object-cover tw-border-2 tw-border-sand tw-bg-sand"
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                      />
                      <div className="tw-min-w-0">
                        <h4 className="unna tw-text-primary tw-text-xl tw-leading-tight">
                          {inst?.name}
                        </h4>
                        {getField(inst, "headline") && (
                          <p className="urbanist tw-text-sm tw-text-grey tw-font-semibold">
                            {getField(inst, "headline")}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="urbanist tw-text-primary/80">
                No instructors available for this slot.
              </p>
            )}

            <Button
              variant="secondary"
              className="tw-w-full tw-mt-5"
              disabled={selected.length !== required}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </BrownPanel>
    </div>
  );
}
