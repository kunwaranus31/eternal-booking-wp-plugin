import { Spinner, Modal } from "@/components/ui";

/** Blocking spinner shown while the booking + charge is being created. */
export default function ProcessingModal({ open }) {
  return (
    <Modal open={open} onClose={() => {}} size="sm" showClose={false}>
      <div className="tw-p-8 tw-flex tw-flex-col tw-items-center tw-gap-4 tw-text-primary">
        <Spinner className="tw-w-10 tw-h-10" />
        <h4 className="tw-text-xl unna">Processing your booking...</h4>
        <p className="urbanist tw-text-sm tw-text-brown tw-text-center">
          Please don't close this window while we confirm your payment.
        </p>
      </div>
    </Modal>
  );
}
