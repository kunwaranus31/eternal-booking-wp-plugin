import { useEffect, useRef, useState } from "react";
import { useCheckout } from "@/context/CheckoutContext";
import { useVerifyGuestOtp, useInitiateGuestBooking } from "@/hooks";
import { Button, Modal } from "@/components/ui";

const OTP_LENGTH = 6;

/**
 * 6-digit OTP entry. Verifies the guest email via tempId, then calls onSuccess
 * (which advances the wizard to checkout).
 */
export default function OtpModal({ onSuccess }) {
  const { modal, closeModal, guestInfo, tempId, setTempId, setIsOtpVerified } =
    useCheckout();
  const open = modal.type === "otp";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  const { verifyGuestOtp, isVerifyingGuestOtp } = useVerifyGuestOtp();
  const { initiateGuestBooking, isInitiatingBooking } = useInitiateGuestBooking();

  useEffect(() => {
    if (!open) return;
    setOtp("");
    setError("");
    setTimer(60);
    setCanResend(false);
    setTimeout(() => refs.current[0]?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open || canResend) return;
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [open, timer, canResend]);

  const setDigit = (i, value) => {
    const num = value.replace(/\D/g, "");
    if (!num && value !== "") return;
    const arr = otp.padEnd(OTP_LENGTH).split("");
    arr[i] = num;
    const next = arr.join("").replace(/\s/g, "").substring(0, OTP_LENGTH);
    setOtp(next);
    setError("");
    if (num && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    setOtp(pasted.substring(0, OTP_LENGTH));
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return;
    try {
      await verifyGuestOtp({ tempId, otp });
      setIsOtpVerified(true);
      closeModal();
      onSuccess?.();
    } catch (e) {
      setError(e?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const res = await initiateGuestBooking({
        guestInfo: {
          name: guestInfo?.fullName,
          email: guestInfo?.email,
          phone: guestInfo?.phone,
        },
      });
      setTempId(res?.data?.tempId);
      setCanResend(false);
      setTimer(60);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <Modal open={open} onClose={closeModal} size="md" showClose={false}>
      <div className="tw-p-5 phone:tw-p-6 tw-space-y-5">
        <h3 className="tw-text-2xl unna tw-text-center tw-text-primary">
          Verify your email
        </h3>
        <p className="tw-text-center urbanist tw-text-sm tw-text-brown tw-break-words">
          Enter the 6-digit code we sent to {guestInfo?.email}.
        </p>

        <div className="tw-flex tw-justify-center tw-gap-1.5 phone:tw-gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              disabled={isVerifyingGuestOtp}
              className={`tw-w-9 phone:tw-w-11 tw-h-12 tw-text-center tw-text-xl phone:tw-text-2xl tw-font-bold tw-border-2 tw-rounded-xl tw-outline-none focus:tw-border-primary ${
                error ? "tw-border-red" : "tw-border-sand"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="tw-text-red tw-text-sm tw-text-center animate-shake">{error}</p>
        )}

        <div className="tw-text-center urbanist tw-text-sm">
          {isInitiatingBooking ? (
            <span className="tw-text-brown">Sending...</span>
          ) : canResend ? (
            <button onClick={handleResend} className="tw-text-primary tw-font-medium">
              Resend code
            </button>
          ) : (
            <span className="tw-text-brown">
              Resend in 00:{timer < 10 ? `0${timer}` : timer}
            </span>
          )}
        </div>

        <div className="tw-flex tw-gap-3 tw-pt-1">
          <Button variant="outline" className="tw-w-full" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="brown"
            className="tw-w-full"
            disabled={otp.length !== OTP_LENGTH}
            loading={isVerifyingGuestOtp}
            onClick={handleVerify}
          >
            Verify
          </Button>
        </div>
      </div>
    </Modal>
  );
}
