import { _images } from "../assets";

/**
 * Canadian phone input matching the main app's ShopInput tel field:
 *  - shows the Canada flag + a "+1" prefix
 *  - formats the entered digits as (XXX) XXX-XXXX
 *  - stores the value as "+1XXXXXXXXXX" (or "" when empty)
 */
const formatCanadianPhone = (digits) => {
  const d = digits.slice(0, 10);
  const area = d.slice(0, 3);
  const middle = d.slice(3, 6);
  const last = d.slice(6, 10);
  if (d.length <= 3) return area;
  if (d.length <= 6) return `(${area}) ${middle}`;
  return `(${area}) ${middle}-${last}`;
};

export default function PhoneInput({ label, required, value, onChange, error, touched }) {
  const digits = (value || "").replace(/^\+1/, "").replace(/\D/g, "");

  const handle = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(d ? `+1${d}` : "");
  };

  return (
    <div className="tw-w-full">
      {label && (
        <label className="tw-text-lg urbanist tw-font-semibold tw-text-primary">
          {label}
          {required && <span className="tw-text-red tw-ml-1">*</span>}
        </label>
      )}
      <div className="tw-w-full tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-md tw-bg-white tw-border tw-border-[#f0dcae] tw-mt-2">
        <img src={_images.canadaFlag} alt="CA" className="tw-w-6 tw-h-4 tw-object-contain" />
        <span className="tw-text-lg tw-text-black">+1</span>
        <span className="tw-h-5 tw-w-px tw-bg-black/20" />
        <input
          type="tel"
          inputMode="numeric"
          value={formatCanadianPhone(digits)}
          onChange={handle}
          placeholder="(514) 123-4567"
          className="tw-w-full tw-text-lg tw-bg-transparent tw-text-black tw-outline-none"
        />
      </div>
      {touched && error && (
        <p className="tw-text-red tw-text-xs tw-mt-1 tw-ml-1 tw-font-medium">{error}</p>
      )}
    </div>
  );
}
