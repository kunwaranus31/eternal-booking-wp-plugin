/**
 * Pull a human-readable message out of an API/axios error, checking every
 * shape the backend uses so call sites never have to deep-destructure.
 *
 * Order (most specific → generic):
 *   error.response.data.data.error   (coupon & validation errors)
 *   error.response.data.message
 *   error.response.data.error
 *   error.data.message
 *   error.message
 */
export function getErrorMessage(error, fallback = "Something went wrong") {
  const res = error?.response?.data;
  return (
    res?.data?.error ||
    res?.message ||
    res?.error ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}
