/**
 * Guest-flow subset of the Eternel API endpoints (mirrors the main app).
 */
export const endpoints = {
  service: {
    getServices: (params = {}) =>
      params.public ? `/service?public=${params.public}` : `/service`,
  },
  package: {
    getPackages: (includePrivate) => `/package?includePrivate=${includePrivate}`,
  },
  addon: {
    getAddons: "/addons",
  },
  coupon: {
    apply: "/coupon/apply",
  },
  booking: {
    getAvailableSlots: "/booking/available-slots",
    getAvailableInstructors: "/booking/available-instructors-for-slot",
    getAvailableDates: (serviceId) =>
      serviceId
        ? `/booking/available-dates?serviceId=${encodeURIComponent(serviceId)}`
        : "/booking/available-dates",
    createBooking: "/booking",
    initiateGuest: "/booking/initiate-guest",
    verifyGuest: "/booking/verify-guest",
    addGuestPaymentMethod: "/booking/add-payment-method",
    getGuestPaymentMethods: (email) =>
      `/booking/guest/payment-methods?email=${encodeURIComponent(email)}`,
    deleteGuestPaymentMethod: "/booking/payment-method",
  },
  appointment: {
    voucher: (id) => `/appointment/${id}/voucher`,
  },
};
