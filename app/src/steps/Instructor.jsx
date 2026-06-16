import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetAvailableInstructors } from "@/hooks";
import { isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, Spinner } from "@/components/ui";
import ServiceSummary from "@/components/ServiceSummary";

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
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Select Instructor{required > 1 ? "s" : ""}
      </h1>

      <BrownPanel className="tw-mt-6">
        <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-6">
          <div className="tw-w-full laptop:tw-w-1/2">
            <ServiceSummary service={service} date={date} time={time} />
          </div>

          <div className="tw-w-full laptop:tw-w-1/2 tw-bg-white/10 tw-rounded-2xl tw-p-4">
            <h3 className="tw-text-2xl unna tw-text-white tw-mb-1">
              Available {required > 1 ? "Instructors" : "Instructor"}
            </h3>
            <p className="urbanist tw-text-sand tw-text-sm tw-mb-3">
              Select {required} {required > 1 ? "instructors" : "instructor"}.
            </p>

            {isLoading ? (
              <div className="tw-flex tw-justify-center tw-py-8">
                <Spinner className="tw-w-6 tw-h-6 tw-text-white" />
              </div>
            ) : availableInstructors?.length > 0 ? (
              <div className="tw-space-y-2 tw-max-h-96 tw-overflow-auto">
                {availableInstructors.map((inst) => {
                  const active = selected.find((i) => i?._id === inst?._id);
                  return (
                    <button
                      key={inst?._id}
                      onClick={() => toggle(inst)}
                      className={`tw-w-full tw-flex tw-items-center tw-gap-3 tw-p-3 tw-rounded-xl tw-border tw-transition tw-text-left ${
                        active
                          ? "tw-bg-sand tw-border-sand tw-text-primary"
                          : "tw-bg-white tw-border-white tw-text-primary hover:tw-bg-sand/40"
                      }`}
                    >
                      <img
                        src={inst?.image?.location || inst?.profileImage?.location}
                        alt={inst?.name}
                        className="tw-w-12 tw-h-12 tw-rounded-full tw-object-cover tw-bg-sand"
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                      />
                      <span className="urbanist tw-font-medium tw-flex-1">
                        {inst?.name}
                      </span>
                      {active && <Check className="tw-w-5 tw-h-5" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="urbanist tw-text-white/80">
                No instructors available for this slot.
              </p>
            )}

            <Button
              variant="primary"
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
