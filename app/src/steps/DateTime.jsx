import { useEffect, useState } from "react";
import moment from "moment";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetAvailableSlots } from "@/hooks";
import { to24h } from "@/utils/helpers";
import { BackButton, BrownPanel, Spinner } from "@/components/ui";
import ServiceSummary from "@/components/ServiceSummary";

export default function DateTime() {
  const { service, date, setDateTime, setInstructor, goTo, back } = useCheckout();
  const { getAvailableSlots, availableSlots, isLoading } = useGetAvailableSlots();

  const [selectedDate, setSelectedDate] = useState(date || "");

  useEffect(() => {
    if (service?._id && selectedDate) {
      getAvailableSlots({ serviceId: service._id, date: selectedDate });
    }
  }, [service?._id, selectedDate]);

  const handlePickDate = (d) => setSelectedDate(d);

  const handlePickSlot = (slot) => {
    setDateTime(selectedDate, to24h(slot?.start));
    setInstructor(null);
    goTo(STEPS.INSTRUCTOR);
  };

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Select Date & Time
      </h1>

      <BrownPanel className="tw-mt-6">
        <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-6">
          <div className="tw-w-full laptop:tw-w-1/2">
            <ServiceSummary service={service} />
          </div>

          <div className="tw-w-full laptop:tw-w-1/2 tw-bg-white/10 tw-rounded-2xl tw-p-4">
            <h3 className="tw-text-2xl unna tw-text-white tw-mb-3">Select Date</h3>
            <Calendar value={selectedDate} onChange={handlePickDate} />

            {selectedDate && (
              <div className="tw-mt-5">
                <h3 className="tw-text-2xl unna tw-text-white tw-mb-3">
                  Select Time
                </h3>
                {isLoading ? (
                  <div className="tw-flex tw-justify-center tw-py-6">
                    <Spinner className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                ) : availableSlots?.length > 0 ? (
                  <div className="tw-grid tw-grid-cols-2 laptop:tw-grid-cols-3 tw-gap-2">
                    {availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickSlot(slot)}
                        className="tw-py-2 tw-px-3 tw-rounded-full tw-bg-white tw-text-primary urbanist hover:tw-bg-sand tw-transition"
                      >
                        {slot?.start}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="urbanist tw-text-white/80">
                    No available slots for this date.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </BrownPanel>
    </div>
  );
}

/* ── Minimal month calendar (future dates only) ──────── */
function Calendar({ value, onChange }) {
  const today = moment().startOf("day");
  const [cursor, setCursor] = useState(
    value ? moment(value, "YYYY-MM-DD").startOf("month") : moment().startOf("month")
  );

  const startOfMonth = cursor.clone().startOf("month");
  const startDay = startOfMonth.clone().startOf("week");
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(startDay.clone().add(i, "days"));
  }

  const canGoPrev = cursor.clone().subtract(1, "month").endOf("month").isSameOrAfter(today);

  return (
    <div className="tw-bg-white tw-rounded-xl tw-p-3 tw-text-primary">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
        <button
          disabled={!canGoPrev}
          onClick={() => setCursor(cursor.clone().subtract(1, "month"))}
          className="tw-p-1 disabled:tw-opacity-30"
        >
          <ChevronLeft className="tw-w-5 tw-h-5" />
        </button>
        <span className="unna tw-text-lg">{cursor.format("MMMM YYYY")}</span>
        <button
          onClick={() => setCursor(cursor.clone().add(1, "month"))}
          className="tw-p-1"
        >
          <ChevronRight className="tw-w-5 tw-h-5" />
        </button>
      </div>
      <div className="tw-grid tw-grid-cols-7 tw-text-center tw-text-xs tw-text-brown tw-mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="tw-grid tw-grid-cols-7 tw-gap-1">
        {days.map((d) => {
          const inMonth = d.month() === cursor.month();
          const isPast = d.isBefore(today);
          const iso = d.format("YYYY-MM-DD");
          const isSelected = value === iso;
          const disabled = isPast || !inMonth;
          return (
            <button
              key={iso}
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`tw-h-9 tw-rounded-lg tw-text-sm tw-transition ${
                isSelected
                  ? "tw-bg-primary tw-text-white"
                  : disabled
                  ? "tw-text-brown/30"
                  : "hover:tw-bg-sand tw-text-primary"
              }`}
            >
              {d.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
