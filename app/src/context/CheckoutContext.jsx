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
  SERVICE: "service", // single-service landing card (shortcode service="<id>")
  PACKAGE: "package", // single-package landing card (shortcode package="<id>")
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

const STEP_VALUES = new Set(Object.values(STEPS));

// Read the whole persisted blob (booking data + step stack) once, honouring TTL.
const loadPersisted = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed._timestamp && Date.now() - parsed._timestamp > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
};

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({
  children,
  initialServiceId = null,
  initialPackageId = null,
}) => {
  // Read persisted blob once (lazy init so localStorage is touched a single time).
  const [persisted] = useState(loadPersisted);

  const [state, setState] = useState(() => {
    if (!persisted) return initialState;
    const { _timestamp, _stack, ...rest } = persisted;
    return { ...initialState, ...rest };
  });

  // A single-service / single-package shortcode starts the flow on that landing
  // card instead of the full LISTING. This is the "home" step for reset/back.
  const rootStep = initialPackageId
    ? STEPS.PACKAGE
    : initialServiceId
    ? STEPS.SERVICE
    : STEPS.LISTING;

  // Step stack (for back navigation). Restore from storage so a refresh keeps
  // the user on the same step — but only if the saved stack belongs to this
  // entry point (same root) and contains only known steps.
  const [stack, setStack] = useState(() => {
    const saved = persisted?._stack;
    if (Array.isArray(saved)) {
      const cleaned = saved.filter((s) => STEP_VALUES.has(s));
      if (cleaned.length && cleaned[0] === rootStep) return cleaned;
    }
    return [rootStep];
  });
  const step = stack[stack.length - 1];

  // Lightweight modal state (replaces the separate ModalContext).
  const [modal, setModal] = useState({ type: null, data: null });

  // Persist booking data AND the step stack so a refresh restores both.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, _stack: stack, _timestamp: Date.now() })
      );
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [state, stack]);

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

  const resetTo = useCallback((root = rootStep) => {
    setStack([root]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [rootStep]);

  // ── Modal ────────────────────────────────────────────
  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  // ── Reset whole flow ─────────────────────────────────
  const resetCheckout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setStack([rootStep]);
    setModal({ type: null, data: null });
  }, [rootStep]);

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
      // single-service / single-package mode
      forcedServiceId: initialServiceId,
      forcedPackageId: initialPackageId,
      rootStep,
      // modal
      modal,
      openModal,
      closeModal,
    }),
    [state, step, stack.length, modal, patch, goTo, back, resetTo, resetCheckout, openModal, closeModal, initialServiceId, initialPackageId, rootStep]
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
