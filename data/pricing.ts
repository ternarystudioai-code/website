export type BillingCycle = "monthly" | "annual";

// Single source of truth for pricing used by server-side endpoints.
// Mirrors the UI pricing (see `components/pricing-section.tsx`).
// No environment variables involved.
export const USD_TO_IDR = 16000; // single source of truth

export const catalogUSD = {
  Pro: { monthly: 3, annual: 29 },
  Team: { monthly: 9, annual: 79 },
} as const;

export function getPriceIDR(planName: string, cycle: BillingCycle): number {
  const key = (planName || "").trim();
  const row = (catalogUSD as any)[key];
  if (!row) return 0;
  const usd = row[cycle];
  if (typeof usd !== "number" || usd <= 0) return 0;
  return Math.round(usd * USD_TO_IDR);
}

export function getMonthlyPriceIDR(planName: string): number {
  return getPriceIDR(planName, "monthly");
}

export function getAnnualPriceIDR(planName: string): number {
  return getPriceIDR(planName, "annual");
}

export function getUSDPrice(planName: string, cycle: BillingCycle): number {
  const key = (planName || "").trim();
  const row = (catalogUSD as any)[key];
  if (!row) return 0;
  const usd = row[cycle];
  return typeof usd === "number" ? usd : 0;
}
