import { useState } from "react";
import { CreditCard, Trash2, Plus } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/stripe";
import { useGetGuestPaymentMethods, useDeleteGuestPaymentMethod } from "@/hooks";
import { Button, Modal, Spinner } from "@/components/ui";
import AddCardForm from "@/components/AddCardForm";

/**
 * Saved guest cards (by email) + add/delete. Selection is lifted to the parent
 * checkout via selectedMethod/setSelectedMethod.
 */
export default function GuestPaymentMethod({ guestEmail, selectedMethod, setSelectedMethod }) {
  const { guestPaymentMethods, isLoading, refetch } = useGetGuestPaymentMethods(guestEmail);
  const { deleteGuestPaymentMethod, isDeleting } = useDeleteGuestPaymentMethod();

  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cards = guestPaymentMethods?.map((pm) => ({
    id: pm?.id,
    last4: pm?.card?.last4,
    brand: pm?.card?.brand,
  }));

  const handleDelete = async () => {
    try {
      await deleteGuestPaymentMethod({ email: guestEmail, paymentMethodId: confirmDelete });
      if (selectedMethod === confirmDelete) setSelectedMethod("");
      setConfirmDelete(null);
      refetch();
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="tw-bg-white tw-rounded-xl tw-p-4 tw-text-primary">
      <h4 className="tw-text-lg unna tw-mb-3">Select payment method</h4>

      {isLoading ? (
        <div className="tw-flex tw-justify-center tw-py-6">
          <Spinner className="tw-w-6 tw-h-6" />
        </div>
      ) : !cards?.length ? (
        <div className="tw-text-center tw-py-4 tw-text-brown">
          <CreditCard className="tw-mx-auto tw-w-12 tw-h-12 tw-mb-2" />
          <p className="urbanist">No saved cards yet.</p>
        </div>
      ) : (
        <div className="tw-space-y-2 tw-max-h-56 tw-overflow-auto">
          {cards.map((card) => {
            const active = selectedMethod === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedMethod(card.id)}
                className={`tw-flex tw-items-center tw-justify-between tw-p-3 tw-rounded-lg tw-border tw-cursor-pointer tw-transition ${
                  active ? "tw-border-primary tw-bg-sand/40" : "tw-border-sand hover:tw-bg-sand/20"
                }`}
              >
                <div className="tw-flex tw-items-center tw-gap-2">
                  <CreditCard className="tw-w-5 tw-h-5 tw-text-brown" />
                  <span className="urbanist tw-font-medium">
                    {card.brand?.toUpperCase()} •••• {card.last4}
                  </span>
                </div>
                <div className="tw-flex tw-items-center tw-gap-3">
                  <input
                    type="radio"
                    name="guestPaymentMethod"
                    checked={active}
                    onChange={() => setSelectedMethod(card.id)}
                    className="tw-accent-primary"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(card.id);
                    }}
                    disabled={isDeleting}
                    className="tw-text-brown hover:tw-text-red"
                  >
                    <Trash2 className="tw-w-4 tw-h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="tw-mt-4 tw-flex tw-items-center tw-gap-2 tw-text-primary urbanist hover:tw-underline"
      >
        <Plus className="tw-w-4 tw-h-4" /> Add new payment method
      </button>

      {/* Add card modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} size="md">
        <Elements stripe={stripePromise}>
          <AddCardForm
            guestEmail={guestEmail}
            onClose={() => setShowAdd(false)}
            onAdded={refetch}
          />
        </Elements>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} size="sm" showClose={false}>
        <div className="tw-p-6 tw-text-center tw-text-primary">
          <h4 className="tw-text-xl unna tw-mb-2">Remove card?</h4>
          <p className="urbanist tw-text-sm tw-text-brown tw-mb-5">
            This payment method will be removed from your saved cards.
          </p>
          <div className="tw-flex tw-gap-3">
            <Button variant="outline" className="tw-w-full" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="brown" className="tw-w-full" loading={isDeleting} onClick={handleDelete}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
