import { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { useAddGuestPaymentMethod } from "@/hooks";
import { Button } from "@/components/ui";

const ELEMENT_OPTIONS = {
  style: {
    base: { color: "#4a3526", fontSize: "16px", "::placeholder": { color: "#a0aec0" } },
    invalid: { color: "#d9534f" },
  },
};

/**
 * Stripe card form for guests. Tokenizes the card client-side and registers it
 * against the guest email via POST /booking/add-payment-method.
 */
export default function AddCardForm({ onClose, guestEmail, onAdded }) {
  const stripe = useStripe();
  const elements = useElements();
  const { addGuestPaymentMethod } = useAddGuestPaymentMethod();

  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState({ number: false, expiry: false, cvc: false });
  const [errors, setErrors] = useState({});

  const isValid = valid.number && valid.expiry && valid.cvc;

  const onElChange = (key) => (e) => {
    setValid((v) => ({ ...v, [key]: e.complete }));
    setErrors((er) => ({ ...er, [key]: e.error?.message || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet.");
      return;
    }
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardNumberElement);
      const { token, error } = await stripe.createToken(cardElement);
      if (error) throw new Error(error.message);
      if (!token?.id) throw new Error("Failed to generate card token");

      const res = await addGuestPaymentMethod({ tokenId: token.id, email: guestEmail });
      if (res?.success) {
        onAdded?.();
        onClose();
      }
    } catch (err) {
      toast.error(err?.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tw-p-6 tw-space-y-4 tw-text-primary">
      <h3 className="tw-text-2xl unna tw-text-center">Add Payment Method</h3>

      <div>
        <label className="tw-block tw-mb-1 urbanist tw-text-sm">Card number</label>
        <div className="tw-p-3 tw-rounded-lg tw-border tw-border-sand">
          <CardNumberElement options={ELEMENT_OPTIONS} onChange={onElChange("number")} />
        </div>
        {errors.number && <p className="tw-text-red tw-text-sm tw-mt-1">{errors.number}</p>}
      </div>

      <div className="tw-flex tw-gap-4">
        <div className="tw-w-full">
          <label className="tw-block tw-mb-1 urbanist tw-text-sm">Expiry</label>
          <div className="tw-p-3 tw-rounded-lg tw-border tw-border-sand">
            <CardExpiryElement options={ELEMENT_OPTIONS} onChange={onElChange("expiry")} />
          </div>
          {errors.expiry && <p className="tw-text-red tw-text-sm tw-mt-1">{errors.expiry}</p>}
        </div>
        <div className="tw-w-full">
          <label className="tw-block tw-mb-1 urbanist tw-text-sm">CVC</label>
          <div className="tw-p-3 tw-rounded-lg tw-border tw-border-sand">
            <CardCvcElement options={ELEMENT_OPTIONS} onChange={onElChange("cvc")} />
          </div>
          {errors.cvc && <p className="tw-text-red tw-text-sm tw-mt-1">{errors.cvc}</p>}
        </div>
      </div>

      <div className="tw-flex tw-flex-col phone:tw-flex-row phone:tw-justify-end tw-gap-3 tw-pt-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="brown" type="submit" disabled={!isValid} loading={loading}>
          Add Card
        </Button>
      </div>
    </form>
  );
}
