import { useCheckout, STEPS } from "@/context/CheckoutContext";
import Listing from "@/steps/Listing";
import ServicePage from "@/steps/ServicePage";
import PackagePage from "@/steps/PackagePage";
import BookSlot from "@/steps/BookSlot";
import DateTime from "@/steps/DateTime";
import Instructor from "@/steps/Instructor";
import Addon from "@/steps/Addon";
import SelectPackage from "@/steps/SelectPackage";
import ConfirmPackage from "@/steps/ConfirmPackage";
import BookingDetails from "@/steps/BookingDetails";
import Checkout from "@/steps/Checkout";
import Voucher from "@/steps/Voucher";

const STEP_COMPONENTS = {
  [STEPS.LISTING]: Listing,
  [STEPS.SERVICE]: ServicePage,
  [STEPS.PACKAGE]: PackagePage,
  [STEPS.BOOK_SLOT]: BookSlot,
  [STEPS.DATE_TIME]: DateTime,
  [STEPS.INSTRUCTOR]: Instructor,
  [STEPS.ADDON]: Addon,
  [STEPS.SELECT_PACKAGE]: SelectPackage,
  [STEPS.CONFIRM_PACKAGE]: ConfirmPackage,
  [STEPS.BOOKING_DETAILS]: BookingDetails,
  [STEPS.CHECKOUT]: Checkout,
  [STEPS.VOUCHER]: Voucher,
};

export default function App() {
  const { step } = useCheckout();
  const Current = STEP_COMPONENTS[step] || Listing;

  return (
    <div className="tw-w-full tw-bg-white tw-text-primary tw-overflow-x-hidden">
      <div className="tw-mx-auto tw-max-w-6xl tw-px-3 tablet:tw-px-4 tw-py-6 tablet:tw-py-8 animate-fade-in">
        <Current />
      </div>
    </div>
  );
}
