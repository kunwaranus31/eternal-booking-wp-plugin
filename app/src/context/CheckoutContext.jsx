import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Step identifiers for the wizard. We use an explicit step state machine instead
 * of a router so the whole flow lives inside one WordPress page (no URL changes,
 * no theme routing conflicts).
 */
export const STEPS = {
  LISTING: "listing",
  BOOK_SLOT: "book-slot", // experience: session + summary
  DATE_TIME: "date-time",
  INSTRUCTOR: "instructor",
  ADDON: "addon",
  SELECT_PACKAGE: "select-package",
  CONFIRM_PACKAGE: "confirm-package",
  BOOKING_DETAILS: "booking-details", // guest form + OTP
  CHECKOUT: "checkout",
  VOUCHER: "voucher",
};

const STORAGE_KEY = "eternel_booking_state";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

const initialState = {
  service: null,
  userPackages: null, // { service, packages[] }
  packageType: null, // selected package within a group
  session: null, // "Single Session" | "Multiple Session"
  date: "",
  time: "",
  instructor: null, // array of instructor objects
  addons: null, // array of addon objects
  guestInfo: null, // { fullName, email, phone }
  isOtpVerified: false,
  tempId: "",
  totalAmount: "", // cents
  flowType: null, // "experience" | "package"
  bookingResult: null, // { booking, appointment } returned by createBooking
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    if (parsed._timestamp && Date.now() - parsed._timestamp > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    }
    const { _timestamp, ...rest } = parsed;
    return { ...initialState, ...rest };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialState;
  }
};

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const [state, setState] = useState(loadState);

  // Step stack (for back navigation). Always starts at listing on load.
  const [stack, setStack] = useState([STEPS.LISTING]);
  const step = stack[stack.length - 1];

  // Lightweight modal state (replaces the separate ModalContext).
  const [modal, setModal] = useState({ type: null, data: null });

  // Persist booking data (not the step) so a refresh keeps selections briefly.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, _timestamp: Date.now() })
    );
  }, [state]);

  const patch = useCallback((p) => setState((prev) => ({ ...prev, ...p })), []);

  // ── Navigation ───────────────────────────────────────
  const goTo = useCallback((next) => {
    setStack((prev) => [...prev, next]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const resetTo = useCallback((root = STEPS.LISTING) => {
    setStack([root]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  // ── Modal ────────────────────────────────────────────
  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  // ── Reset whole flow ─────────────────────────────────
  const resetCheckout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setStack([STEPS.LISTING]);
    setModal({ type: null, data: null });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      // setters
      setService: (service) => patch({ service }),
      setUserPackages: (userPackages) => patch({ userPackages }),
      setPackageType: (packageType) => patch({ packageType }),
      setSession: (session) => patch({ session }),
      setDateTime: (date, time) => patch({ date, time }),
      setInstructor: (instructor) => patch({ instructor }),
      setAddons: (addons) => patch({ addons }),
      setGuestInfo: (guestInfo) => patch({ guestInfo }),
      setIsOtpVerified: (isOtpVerified) => patch({ isOtpVerified }),
      setTempId: (tempId) => patch({ tempId }),
      setTotalAmount: (totalAmount) => patch({ totalAmount }),
      setFlowType: (flowType) => patch({ flowType }),
      setBookingResult: (bookingResult) => patch({ bookingResult }),
      resetCheckout,
      // navigation
      step,
      goTo,
      back,
      resetTo,
      canGoBack: stack.length > 1,
      // modal
      modal,
      openModal,
      closeModal,
    }),
    [state, step, stack.length, modal, patch, goTo, back, resetTo, resetCheckout, openModal, closeModal]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
};
