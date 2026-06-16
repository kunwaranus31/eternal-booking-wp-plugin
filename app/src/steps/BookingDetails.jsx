import { useState } from "react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useInitiateGuestBooking } from "@/hooks";
import { convertToDollars, addMinutes, formatDate } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, Field, InfoRow } from "@/components/ui";
import OtpModal from "@/components/OtpModal";

export default function BookingDetails() {
  const {
    flowType,
    service,
    userPackages,
    packageType,
    date,
    time,
    instructor,
    addons,
    guestInfo,
    setGuestInfo,
    setIsOtpVerified,
    setTempId,
    openModal,
    goTo,
    back,
  } = useCheckout();

  const isPackage = flowType === "package";
  const summaryService = isPackage ? userPackages?.service : service;

  const { initiateGuestBooking, isInitiatingBooking } = useInitiateGuestBooking();

  const [form, setForm] = useState({
    fullName: guestInfo?.fullName || "",
    email: guestInfo?.email || "",
    phone: guestInfo?.phone || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.fullName))
      e.fullName = "Name can only contain letters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) e.phone = "Phone is required";
    else if (phoneDigits.length !== 10) e.phone = "Phone must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (key) => (ev) => {
    const value = ev.target.value;
    const next = { ...form, [key]: value };
    setForm(next);
    setGuestInfo(next);
  };

  const handleVerify = async () => {
    if (!validate()) return;
    setGuestInfo(form);
    setSubmitting(true);
    try {
      const res = await initiateGuestBooking({
        guestInfo: { name: form.fullName, email: form.email, phone: form.phone },
      });
      if (res?.data?.otpRequired) {
        setTempId(res?.data?.tempId || null);
        openModal("otp");
      } else {
        setIsOtpVerified(true);
        goTo(STEPS.CHECKOUT);
      }
    } catch {
      /* toast handled in hook */
    } finally {
      setSubmitting(false);
    }
  };

  // Summary rows
  const fourHand = isFourHand(summaryService?.type);
  const rows = isPackage
    ? [
        { title: "Package", text: getField(packageType, "name") },
        { title: "Service", text: getField(summaryService, "name") },
        { title: "Sessions", text: `${packageType?.noOfSessions} sessions` },
        { title: "Hand type", text: fourHand ? "Four-hand" : "Two-hand" },
      ]
    : [
        { title: "Service", text: getField(service, "name") },
        { title: "Date & Time", text: `${formatDate(date)}, ${addMinutes(time)}` },
        {
          title: instructor?.length > 1 ? "Instructors" : "Instructor",
          text: instructor?.map((i) => i?.name).join(", ") || "-",
        },
        {
          title: "Add-on",
          text:
            addons?.length > 0
              ? addons
                  .map((a) => `${getField(a, "name")} (+$${convertToDollars(a?.price)})`)
                  .join(", ")
              : "None",
        },
      ];

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Booking Details
      </h1>

      <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-5 tw-mt-6">
        <div className="tw-w-full laptop:tw-w-1/2">
          <img
            src={firstImage(summaryService)}
            alt={getField(summaryService, "name")}
            className="tw-w-full tw-h-72 tw-object-cover tw-rounded-2xl tw-border tw-border-sand"
          />
        </div>

        <BrownPanel className="tw-w-full laptop:tw-w-1/2">
          <h2 className="tw-text-2xl unna tw-text-white tw-border-b tw-border-white/30 tw-pb-2">
            Booking Summary
          </h2>
          <div className="laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-4 tw-mt-2">
            {rows.map((r, i) => (
              <InfoRow key={i} title={r.title} text={r.text} fullWidth={i === rows.length - 1} />
            ))}
          </div>

          <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-white/30">
            <h3 className="tw-text-xl unna tw-text-sand tw-mb-2">Your Details</h3>
            <div className="tw-space-y-3">
              <Field
                label="Full name"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={onChange("fullName")}
                error={errors.fullName}
                touched={!!errors.fullName}
                maxLength={40}
              />
              <div className="tw-flex tw-flex-col laptop:tw-flex-row tw-gap-3">
                <Field
                  label="Email"
                  type="email"
                  placeholder="jane@email.com"
                  value={form.email}
                  onChange={onChange("email")}
                  error={errors.email}
                  touched={!!errors.email}
                />
                <Field
                  label="Phone"
                  type="tel"
                  placeholder="5141234567"
                  value={form.phone}
                  onChange={onChange("phone")}
                  error={errors.phone}
                  touched={!!errors.phone}
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="tw-w-full tw-mt-5"
              loading={submitting || isInitiatingBooking}
              onClick={handleVerify}
            >
              Verify & Continue
            </Button>
          </div>
        </BrownPanel>
      </div>

      <OtpModal onSuccess={() => goTo(STEPS.CHECKOUT)} />
    </div>
  );
}
