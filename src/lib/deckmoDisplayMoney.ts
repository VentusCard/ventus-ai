/**
 * Deck display rounding: nearest $100 under $10K (minimum $100 for any non-zero
 * amount), nearest $1,000 from $10K, and one-decimal millions from $1M.
 * Calculations stay in exact cents; round only when rendering.
 */
export function roundDisplayDollars(cents: number): number {
  const dollars = Math.abs(cents) / 100;
  if (dollars === 0) return 0;
  if (dollars >= 1_000_000) return Math.round(dollars / 100_000) * 100_000;
  if (dollars >= 10_000) return Math.round(dollars / 1_000) * 1_000;
  return Math.max(100, Math.round(dollars / 100) * 100);
}

export function formatRoundedMoney(cents: number): string {
  const dollars = roundDisplayDollars(cents);
  const sign = cents < 0 ? "−" : "";
  if (dollars >= 1_000_000) return `${sign}$${(dollars / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return `${sign}$${dollars.toLocaleString("en-US")}`;
}
