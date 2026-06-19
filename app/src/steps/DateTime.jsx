import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetAvailableSlots, useGetAvailableDates } from "@/hooks";
import { to24h } from "@/utils/helpers";
import { BackButton, BrownPanel } from "@/components/ui";
import { TimeSlotSkeleton } from "@/components/Skeleton";
import ServiceSummary from "@/components/ServiceSummary";

export default function DateTime() {
  const { service, date, setDateTime, setInstructor, goTo, back } = useCheckout();
  const { getAvailableSlots, availableSlots, isLoading } = useGetAvailableSlots();
  const { availableDates, isLoading: datesLoading } = useGetAvailableDates();

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
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Select Date & Time
      </h1>

      <BrownPanel className="tw-mt-6">
        <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-6">
          <div className="tw-w-full laptop:tw-w-1/2">
            <ServiceSummary service={service} />
          </div>

          <div className="tw-w-full laptop:tw-w-1/2 tw-bg-white/50 tw-rounded-2xl tw-p-4">
            <h3 className="tw-text-2xl unna tw-text-primary tw-mb-3">Select Date</h3>
            <Calendar
              value={selectedDate}
              onChange={handlePickDate}
              availableDates={availableDates}
              loading={datesLoading}
            />

            {selectedDate && (
              <div className="tw-mt-5">
                <h3 className="tw-text-2xl unna tw-text-primary tw-mb-3">
                  Select Time
                </h3>
                {isLoading ? (
                  <TimeSlotSkeleton count={6} />
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
                  <p className="urbanist tw-text-primary/80">
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

/* ── Calendar driven by the backend's available dates ──
   Only dates returned by /booking/available-dates are green & selectable;
   every other day is hidden (invisible), and month navigation is bounded by
   the first/last available date. */
function Calendar({ value, onChange, availableDates = [], loading }) {
  // Normalise to a YYYY-MM-DD lookup set (handles plain dates or ISO strings).
  const availableSet = useMemo(
    () => new Set((availableDates || []).map((d) => moment(d).format("YYYY-MM-DD"))),
    [availableDates]
  );
  const sorted = useMemo(() => [...availableSet].sort(), [availableSet]);
  const firstIso = sorted[0];
  const lastIso = sorted[sorted.length - 1];

  const [cursor, setCursor] = useState(() =>
    moment(firstIso || undefined).startOf("month")
  );

  // Jump to the first available month once the dates arrive.
  useEffect(() => {
    if (firstIso) setCursor(moment(firstIso).startOf("month"));
  }, [firstIso]);

  if (loading) {
    return (
      <div className="tw-bg-white tw-rounded-xl tw-p-3">
        <div className="tw-h-64 tw-bg-gray-medium/20 tw-rounded-lg tw-animate-pulse" />
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="tw-bg-white tw-rounded-xl tw-p-4 tw-text-center">
        <p className="urbanist tw-text-primary/80">No available dates right now.</p>
      </div>
    );
  }

  const prevDisabled = cursor.clone().isSameOrBefore(moment(firstIso), "month");
  const nextDisabled = cursor.clone().isSameOrAfter(moment(lastIso), "month");

  const startDay = cursor.clone().startOf("month").startOf("week");
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(startDay.clone().add(i, "days"));
  }

  return (
    <div className="tw-bg-white tw-rounded-xl tw-p-3 tw-text-primary">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
        <button
          disabled={prevDisabled}
          onClick={() => setCursor(cursor.clone().subtract(1, "month").startOf("month"))}
          className="tw-p-1 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
        >
          <ChevronLeft className="tw-w-5 tw-h-5" />
        </button>
        <span className="unna tw-text-lg">{cursor.format("MMMM YYYY")}</span>
        <button
          disabled={nextDisabled}
          onClick={() => setCursor(cursor.clone().add(1, "month").startOf("month"))}
          className="tw-p-1 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
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
          const iso = d.format("YYYY-MM-DD");
          const inMonth = d.month() === cursor.month();
          // A day is selectable only if the backend lists it (and it belongs to
          // the visible month). Everything else is hidden.
          const available = inMonth && availableSet.has(iso);
          const isSelected = value === iso;
          return (
            <button
              key={iso}
              disabled={!available}
              onClick={() => available && onChange(iso)}
              className={`tw-h-9 tw-rounded-full tw-text-sm tw-transition ${
                !available
                  ? "tw-invisible"
                  : isSelected
                  ? "tw-bg-sand tw-text-primary tw-font-bold"
                  : "tw-bg-green/15 hover:tw-bg-sand/60 tw-text-primary tw-cursor-pointer"
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
