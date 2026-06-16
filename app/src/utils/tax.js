import { TAX_RATES } from "@/config";

/**
 * Canadian tax breakdown (TPS 5% + TVQ 9.975%). Amounts are in CENTS, matching
 * the rest of the pricing pipeline. Mirrors the main app's taxCalculator.
 */
export const calculateTaxes = (subtotal) => {
  if (!subtotal || subtotal <= 0) {
    return { subtotal: 0, tps: 0, tvq: 0, totalTax: 0, total: 0 };
  }
  const tps = Math.round(subtotal * TAX_RATES.TPS);
  const tvq = Math.round(subtotal * TAX_RATES.TVQ);
  const totalTax = tps + tvq;
  return {
    subtotal,
    tps,
    tvq,
    totalTax,
    total: Number(subtotal) + Number(totalTax),
  };
};

export const calculateTaxesWithDiscount = (subtotal, discount = 0) => {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  return {
    ...calculateTaxes(discountedSubtotal),
    originalSubtotal: subtotal,
    discount,
    discountedSubtotal,
  };
};
