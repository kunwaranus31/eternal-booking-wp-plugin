import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/utils/toast";
import { bookingApi } from "@/api/bookingApi";

/* ── Catalogue queries ───────────────────────────────── */
export function useGetServices() {
  const query = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await bookingApi.getServices();
      return res?.data?.data;
    },
  });
  return {
    services: query.data,
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useGetPackages() {
  const query = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await bookingApi.getPackages();
      return res?.data?.data;
    },
  });
  return {
    packages: query.data,
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useGetAddons() {
  const query = useQuery({
    queryKey: ["addons"],
    queryFn: async () => {
      const res = await bookingApi.getAddons();
      return res?.data?.data;
    },
  });
  return { addons: query.data, isLoading: query.isPending };
}

export function useGetGuestPaymentMethods(email) {
  const query = useQuery({
    queryKey: ["guestPaymentMethods", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await bookingApi.getGuestPaymentMethods(email);
      return res?.data?.data;
    },
  });
  return {
    guestPaymentMethods: query.data,
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}

/* ── Availability mutations ──────────────────────────── */
export function useGetAvailableSlots() {
  const mutation = useMutation({
    mutationFn: async ({ serviceId, date }) => {
      if (!serviceId || !date) throw new Error("serviceId and date are required");
      const res = await bookingApi.getAvailableSlots({ serviceId, date });
      if (!res?.data?.success) throw new Error("Failed to fetch available slots");
      return res.data.data; // slots array
    },
    retry: false,
  });
  return {
    getAvailableSlots: mutation.mutateAsync,
    availableSlots: mutation.data,
    isLoading: mutation.isPending,
  };
}

export function useGetAvailableInstructors() {
  const mutation = useMutation({
    mutationFn: async ({ serviceId, date, startTime }) => {
      if (!serviceId || !date || !startTime)
        throw new Error("serviceId, date and startTime are required");
      const res = await bookingApi.getAvailableInstructors({
        serviceId,
        date,
        startTime,
      });
      if (!res?.data?.success)
        throw new Error("Failed to fetch available instructors");
      return res.data.data?.availableInstructors;
    },
    retry: false,
  });
  return {
    getAvailableInstructors: mutation.mutateAsync,
    availableInstructors: mutation.data,
    isLoading: mutation.isPending,
  };
}

/* ── Coupon ──────────────────────────────────────────── */
export function useApplyCoupon() {
  const mutation = useMutation({
    mutationFn: async (payload) => await bookingApi.applyCoupon(payload),
    onSuccess: (data) => {
      if (data?.data?.success) {
        toast.success(data?.data?.message || "Coupon applied successfully!");
      } else {
        toast.error(data?.data?.message || "Failed to apply coupon");
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Error applying coupon"
      );
    },
    retry: false,
  });
  return {
    applyCoupon: mutation.mutateAsync,
    isLoading: mutation.isPending,
    data: mutation.data?.data,
  };
}

/* ── Guest OTP ───────────────────────────────────────── */
export function useInitiateGuestBooking() {
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingApi.initiateGuest(payload);
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Failed to initiate guest booking");
      return res.data;
    },
    onError: (err) => toast.error(err?.message || "Guest booking initiation failed"),
    onSuccess: (data) => {
      if (data?.message !== "Account Already Exists") {
        toast.success(data?.message || "OTP sent!");
      }
    },
    retry: false,
  });
  return {
    initiateGuestBooking: mutation.mutateAsync,
    isInitiatingBooking: mutation.isPending,
  };
}

export function useVerifyGuestOtp() {
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingApi.verifyGuest(payload);
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "OTP verification failed");
      return res.data;
    },
    onError: (err) => toast.error(err?.message || "OTP verification failed"),
    onSuccess: (data) => toast.success(data?.message || "OTP verified!"),
    retry: false,
  });
  return {
    verifyGuestOtp: mutation.mutateAsync,
    isVerifyingGuestOtp: mutation.isPending,
  };
}

/* ── Guest payment methods ───────────────────────────── */
export function useAddGuestPaymentMethod() {
  const mutation = useMutation({
    mutationFn: async (body) => {
      const res = await bookingApi.addGuestPaymentMethod(body);
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Failed to add card");
      return res.data;
    },
    onError: (err) => toast.error(err?.message || "Failed to add card"),
    onSuccess: () => toast.success("Card added"),
    retry: false,
  });
  return {
    addGuestPaymentMethod: mutation.mutateAsync,
    isAdding: mutation.isPending,
  };
}

export function useDeleteGuestPaymentMethod() {
  const mutation = useMutation({
    mutationFn: async (body) => {
      const res = await bookingApi.deleteGuestPaymentMethod(body);
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Failed to delete card");
      return res.data;
    },
    onError: (err) => toast.error(err?.message || "Failed to delete card"),
    onSuccess: () => toast.success("Card removed"),
    retry: false,
  });
  return {
    deleteGuestPaymentMethod: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}

/* ── Create booking ──────────────────────────────────── */
export function useCreateBooking() {
  const mutation = useMutation({
    mutationFn: async (body) => {
      const res = await bookingApi.createBooking(body);
      if (!res?.data?.success) throw new Error("Failed to create booking");
      toast.success(res?.data?.message || "Booking created successfully");
      return res.data.data; // { booking, appointment }
    },
    onError: (err) => toast.error(err?.message || "Booking creation failed"),
    retry: false,
  });
  return {
    createBooking: mutation.mutateAsync,
    isCreatingBooking: mutation.isPending,
  };
}
