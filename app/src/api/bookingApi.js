import { client } from "./client";
import { endpoints } from "./endpoints";
import { config } from "@/config";

/**
 * Thin wrappers around the guest booking endpoints. Each returns the raw axios
 * response; hooks unwrap response.data.data and surface errors.
 */
export const bookingApi = {
  // Catalogue
  getServices: () => client.get(endpoints.service.getServices({ public: true })),
  getPackages: () => client.get(endpoints.package.getPackages(false)),
  getAddons: () => client.get(endpoints.addon.getAddons),

  // Availability
  getAvailableDates: (serviceId) =>
    client.get(endpoints.booking.getAvailableDates(serviceId)),
  getAvailableSlots: (body) => client.post(endpoints.booking.getAvailableSlots, body),
  getAvailableInstructors: (body) =>
    client.post(endpoints.booking.getAvailableInstructors, body),

  // Coupon
  applyCoupon: (body) => client.post(endpoints.coupon.apply, body),

  // Guest OTP
  initiateGuest: (body) => client.post(endpoints.booking.initiateGuest, body),
  verifyGuest: (body) => client.post(endpoints.booking.verifyGuest, body),

  // Guest payment methods
  getGuestPaymentMethods: (email) =>
    client.get(endpoints.booking.getGuestPaymentMethods(email)),
  addGuestPaymentMethod: (body) =>
    client.post(endpoints.booking.addGuestPaymentMethod, body),
  deleteGuestPaymentMethod: (body) =>
    client.delete(endpoints.booking.deleteGuestPaymentMethod, { data: body }),

  // Booking
  createBooking: (body) => client.post(endpoints.booking.createBooking, body),

  // Voucher (absolute URL — opened in a new tab)
  voucherUrl: (appointmentId) =>
    `${config.apiBaseUrl}${endpoints.appointment.voucher(appointmentId)}`,
};
