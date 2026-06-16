import { CheckCircle2, Download } from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";
import { bookingApi } from "@/api/bookingApi";
import { convertToDollars, addMinutes, formatDate } from "@/utils/helpers";
import { getField, isFourHand } from "@/utils/format";
import { Button } from "@/components/ui";

export default function Voucher() {
  const {
    flowType,
    service,
    userPackages,
    packageType,
    date,
    time,
    instructor,
    addons,
    bookingResult,
    resetCheckout,
  } = useCheckout();

  const isPackage = flowType === "package";
  const appointment = bookingResult?.appointment;
  const booking = bookingResult?.booking;
  const pricing = booking?.pricing;
  const summaryService = isPackage ? userPackages?.service : service;

  const handleDownload = () => {
    if (!appointment?._id) return;
    window.open(bookingApi.voucherUrl(appointment._id), "_blank");
  };

  const rows = isPackage
    ? [
        { title: "Reference", text: booking?.refId || appointment?.refId || "-" },
        { title: "Package", text: getField(packageType, "name") },
        { title: "Service", text: getField(summaryService, "name") },
        { title: "Sessions", text: `${packageType?.noOfSessions} sessions` },
        { title: "Total", text: pricing?.total ? `$${convertToDollars(pricing.total)}` : "-" },
      ]
    : [
        { title: "Booking No.", text: appointment?.refId || "-" },
        { title: "Duration", text: `${service?.duration} minutes` },
        { title: "Hand type", text: isFourHand(service?.type) ? "Four-hand" : "Two-hand" },
        {
          title: instructor?.length > 1 ? "Instructors" : "Instructor",
          text: instructor?.map((i) => i?.name).join(", ") || "-",
        },
        { title: "Date", text: formatDate(date) },
        { title: "Time", text: addMinutes(time) },
        {
          title: "Add-on",
          text:
            addons?.length > 0
              ? addons.map((a) => `${getField(a, "name")} (+$${convertToDollars(a?.price)})`).join(", ")
              : "None",
        },
        {
          title: "Total",
          text: pricing?.total ? `$${convertToDollars(pricing.total)}` : "-",
        },
      ];

  return (
    <div className="tw-max-w-lg tw-mx-auto tw-bg-white tw-border tw-border-sand tw-rounded-2xl tw-p-6 tw-text-center tw-shadow-sm">
      <CheckCircle2 className="tw-mx-auto tw-w-14 tw-h-14 tw-text-green-600" />
      <h2 className="tw-text-2xl unna tw-mt-2 tw-text-primary">
        {isPackage ? "Package Purchased!" : "Payment Successful!"}
      </h2>
      <p className="urbanist tw-text-sm tw-text-brown tw-mt-1">
        A confirmation has been sent to your email.
      </p>
      <p className="urbanist tw-text-lg tw-font-medium tw-text-primary tw-mt-2 tw-capitalize">
        {getField(summaryService, "name")}
      </p>

      <div className="tw-text-left tw-mt-4 tw-max-h-72 tw-overflow-auto tw-divide-y tw-divide-sand">
        {rows.map((r, i) => (
          <div key={i} className="tw-flex tw-justify-between tw-py-2">
            <span className="urbanist tw-text-sm tw-text-brown">{r.title}</span>
            <span className="urbanist tw-text-sm tw-font-medium tw-text-primary tw-text-right tw-max-w-[60%]">
              {r.text}
            </span>
          </div>
        ))}
      </div>

      {appointment?._id && (
        <Button
          variant="primary"
          icon={Download}
          className="tw-w-full tw-mt-5"
          onClick={handleDownload}
        >
          Download Voucher
        </Button>
      )}
      <Button variant="text" className="tw-mt-3 tw-mx-auto" onClick={resetCheckout}>
        Back to start
      </Button>
    </div>
  );
}
