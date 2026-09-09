// Canonical book size for the analytics demo. Every population number shown
// anywhere in the Intelligence Database (signal families, sub-signals, segment
// headers, portfolio tiles) must be derived from these constants so the figures
// stay proportionate to one another.

export const BOOK_CUSTOMERS = 68_200_000;
export const ENRICHMENT_RATE = 0.999;

export const ENRICHED_PROFILES = Math.round(BOOK_CUSTOMERS * ENRICHMENT_RATE);

/** Convert a share of the enriched population into an absolute headcount. */
export function populationFor(share: number): number {
  return Math.round(ENRICHED_PROFILES * share);
}

/** Convert an absolute headcount into a share of the whole book (0-1). */
export function shareOf(population: number): number {
  return BOOK_CUSTOMERS > 0 ? population / BOOK_CUSTOMERS : 0;
}

/** Scale a count taken from the sampled directory up to book scale. */
export function scaleSample(count: number, sampleSize: number): number {
  if (sampleSize <= 0) return 0;
  return Math.round((count / sampleSize) * BOOK_CUSTOMERS);
}

export function fmtCount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return Math.round(n).toLocaleString();
}
