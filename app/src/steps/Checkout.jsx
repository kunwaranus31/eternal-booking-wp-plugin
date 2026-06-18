import { useEffect, useMemo, useState } from "react";
import { toast } from "@/utils/toast";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useApplyCoupon, useCreateBooking } from "@/hooks";
import {
  convertToDollars,
  addMinutes,
  formatDate,
  calculateAddonsPrice,
} from "@/utils/helpers";
import { calculateTaxes, calculateTaxesWithDiscount } from "@/utils/tax";
import { getField, isFourHand } from "@/utils/format";
import { Button, BackButton, BrownPanel, InfoRow, Field } from "@/components/ui";
import GuestPaymentMethod from "@/components/GuestPaymentMethod";
import ProcessingModal from "@/components/ProcessingModal";
import { Modal } from "@/components/ui";

export default function Checkout() {
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
    isOtpVerified,
    setTotalAmount,
    setBookingResult,
    resetTo,
    goTo,
    back,
  } = useCheckout();

  const isPackage = flowType === "package";
  const summaryService = isPackage ? userPackages?.service : service;

  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { applyCoupon, isLoading: isApplyingCoupon } = useApplyCoupon();
  const { createBooking, isCreatingBooking } = useCreateBooking();

  // Guard: must have verified email to reach checkout.
  useEffect(() => {
    if (!isOtpVerified) resetTo(STEPS.LISTING);
  }, [isOtpVerified]);

  /* ── Pricing (all in cents) ─────────────────────────── */
  const addonsTotal = calculateAddonsPrice(addons);
  const subtotal = isPackage
    ? packageType?.price || 0
    : (service?.price || 0) + addonsTotal;

  const discount = appliedCoupon?.discountAmount || 0;
  const taxCalc =
    discount > 0
      ? calculateTaxesWithDiscount(subtotal, discount)
      : calculateTaxes(subtotal);
  const total = taxCalc.total;

  useEffect(() => {
    setTotalAmount(total);
  }, [total]);

  /* ── Coupon ─────────────────────────────────────────── */
  const handleApplyCoupon = async () => {
    if (!promoCode) {
      toast.error("Please enter a promo code.");
      return;
    }
    const bookingDetails = isPackage
      ? { type: "package", amount: packageType?.price, packageId: packageType?._id }
      : {
          type: "service",
          amount: (service?.price || 0) + addonsTotal - discount,
          serviceId: service?._id,
        };
    try {
      const res = await applyCoupon({
        code: promoCode,
        bookingDetails,
        guestEmail: guestInfo?.email,
      });
      if (res?.data?.success) setAppliedCoupon(res?.data?.data);
    } catch {
      /* toast handled in hook */
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    toast.success("Coupon removed");
  };

  /* ── Pay ────────────────────────────────────────────── */
  const handlePay = async () => {
    setShowConfirm(false);
    const guest = {
      name: guestInfo?.fullName || "",
      phone: guestInfo?.phone || "",
      email: guestInfo?.email || "",
    };

    const payload = isPackage
      ? {
          type: "package",
          userType: "guest",
          guestInfo: guest,
          packageId: packageType?._id,
          payment: { amount: packageType?.price },
          paymentMethodId: selectedMethod || undefined,
          couponCode: promoCode || undefined,
        }
      : {
          type: "service",
          userType: "guest",
          guestInfo: guest,
          serviceId: service?._id,
          date,
          time,
          addons: addons?.map((a) => a?._id) || [],
          payment: { amount: total },
          instructorIds: instructor?.map((i) => i?._id) || [],
          paymentMethodId: selectedMethod || undefined,
          notes: note || undefined,
          couponCode: promoCode || undefined,
        };

    try {
      const res = await createBooking(payload);
      if (!res?.booking) throw new Error("Failed to create booking");
      setBookingResult(res);
      goTo(STEPS.VOUCHER);
    } catch {
      /* toast handled in hook */
    }
  };

  /* ── Summary rows ───────────────────────────────────── */
  const fourHand = isFourHand(summaryService?.type);
  const rows = useMemo(() => {
    if (isPackage) {
      return [
        { title: "Package", text: getField(packageType, "name") },
        { title: "Service", text: getField(summaryService, "name") },
        { title: "Hand type", text: fourHand ? "Four-hand" : "Two-hand" },
        { title: "Sessions", text: `${packageType?.noOfSessions} sessions` },
        { title: "Duration", text: `${summaryService?.duration} mins` },
        { title: "Bonus", text: getField(packageType, "bonus", "-") },
      ];
    }
    return [
      { title: "Service", text: getField(service, "name") },
      { title: "Duration", text: `${service?.duration} minutes` },
      { title: "Hand type", text: fourHand ? "Four-hand" : "Two-hand" },
      { title: "Date", text: formatDate(date) },
      { title: "Time", text: addMinutes(time) },
      {
        title: instructor?.length > 1 ? "Instructors" : "Instructor",
        text: instructor?.map((i) => i?.name).join(", ") || "-",
      },
      {
        title: "Add-on",
        text:
          addons?.length > 0
            ? addons.map((a) => `${getField(a, "name")} (+$${convertToDollars(a?.price)})`).join(", ")
            : "None",
      },
    ];
  }, [isPackage, packageType, summaryService, service, date, time, instructor, addons, fourHand]);

  const guestRows = [
    { title: "Name", text: guestInfo?.fullName || "-" },
    { title: "Email", text: guestInfo?.email || "-" },
    { title: "Phone", text: guestInfo?.phone || "-" },
  ];

  return (
    <div>
      <BackButton onClick={back} />
      <h1 className="tw-text-3xl tablet:tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Complete Your Booking
      </h1>
      <p className="tw-text-center urbanist tw-text-brown tw-mt-1">
        Review your details and pay securely.
      </p>

      <BrownPanel className="tw-mt-6 tw-mx-auto tw-max-w-2xl tw-text-white">
        <h2 className="tw-text-2xl unna tw-border-b tw-border-white/30 tw-pb-2 tw-text-white">
          Booking Summary
        </h2>
        <div className="laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-4 tw-pb-3 tw-border-b tw-border-white/30">
          {rows.map((r, i) => (
            <InfoRow key={i} title={r.title} text={r.text} fullWidth={i === rows.length - 1} />
          ))}

          {/* Coupon */}
          <div className="tw-col-span-2 tw-mt-3">
            {!appliedCoupon ? (
              <div className="tw-flex tw-gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  maxLength={15}
                  className="tw-flex-1 tw-rounded-lg tw-bg-white tw-text-primary tw-px-4 tw-py-2.5 tw-outline-none"
                />
                <Button variant="secondary" loading={isApplyingCoupon} onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
            ) : (
              <div className="tw-flex tw-items-center tw-justify-between tw-bg-sand tw-text-primary tw-rounded-lg tw-px-4 tw-py-2.5">
                <div>
                  <p className="tw-font-bold unna">{promoCode}</p>
                  <p className="tw-text-sm urbanist">
                    {appliedCoupon?.type === "percentage"
                      ? `${appliedCoupon?.discountValue}% off`
                      : `$${convertToDollars(discount)} off`}
                  </p>
                </div>
                <Button variant="brown" onClick={removeCoupon}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="tw-mt-3 tw-space-y-1">
          <PriceRow label="Price" value={convertToDollars(isPackage ? packageType?.price : service?.price)} />
          {addons?.length > 0 && (
            <PriceRow label="Add-ons" value={convertToDollars(addonsTotal)} />
          )}
          {discount > 0 && (
            <PriceRow label="Discount" value={`-${convertToDollars(discount)}`} />
          )}
          <PriceRow label="Subtotal" value={convertToDollars(taxCalc.subtotal)} />
          <PriceRow label="TPS (5%)" value={convertToDollars(taxCalc.tps)} />
          <PriceRow label="TVQ (9.975%)" value={convertToDollars(taxCalc.tvq)} />
          <div className="tw-flex tw-justify-between tw-pt-2 tw-border-t tw-border-white/30 tw-mt-2">
            <span className="unna tw-text-xl">Total</span>
            <span className="unna tw-text-xl tw-font-bold">${convertToDollars(total)}</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-white/30">
          <h3 className="tw-text-xl unna tw-text-sand tw-mb-2">Contact Information</h3>
          <div className="laptop:tw-grid laptop:tw-grid-cols-2 tw-gap-x-4">
            {guestRows.map((r, i) => (
              <InfoRow key={i} title={r.title} text={r.text} fullWidth={i === guestRows.length - 1} />
            ))}
          </div>
        </div>

        {/* Optional note (service only) */}
        {!isPackage && (
          <div className="tw-mt-3">
            <Field
              label="Note (optional)"
              placeholder="Anything we should know?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
            />
          </div>
        )}

        {/* Payment */}
        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-white/30">
          <h3 className="tw-text-xl unna tw-text-sand tw-mb-2">Payment Method</h3>
          <GuestPaymentMethod
            guestEmail={guestInfo?.email}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        </div>

        <Button
          variant="secondary"
          className="tw-w-full tw-mt-5 unna tw-text-xl"
          disabled={!selectedMethod || isCreatingBooking}
          loading={isCreatingBooking}
          onClick={() => setShowConfirm(true)}
        >
          Pay ${convertToDollars(total)}
        </Button>
      </BrownPanel>

      {/* Confirm modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} size="sm" showClose={false}>
        <div className="tw-p-6 tw-text-center tw-text-primary">
          <h4 className="tw-text-xl unna tw-mb-2">Confirm payment</h4>
          <p className="urbanist tw-text-sm tw-text-brown tw-mb-5">
            You're about to pay ${convertToDollars(total)} for this booking.
          </p>
          <div className="tw-flex tw-flex-col phone:tw-flex-row tw-gap-3">
            <Button variant="outline" className="tw-w-full" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="brown" className="tw-w-full" onClick={handlePay}>
              Confirm & Pay
            </Button>
          </div>
        </div>
      </Modal>

      <ProcessingModal open={isCreatingBooking} />
    </div>
  );
}

const PriceRow = ({ label, value }) => (
  <div className="tw-flex tw-justify-between">
    <span className="unna tw-text-lg">{label}</span>
    <span className="unna tw-text-lg tw-font-bold">${value}</span>
  </div>
);
