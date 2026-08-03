// Ventus enterprise design tokens — the "governed console" language shared by
// the product demo and the marketing surfaces. One source so the home page and
// the POC read as the same product: navy authority, mono for machine truth,
// truth chips that never let a simulated number pass as a measured one.

export const NAVY = "#012169"; // institutional authority (BofA-compatible)
export const RED = "#E31837"; // risk/hold states + brand marks only — never decoration
export const GREEN = "#0B6B43"; // Merrill + verified/live states
export const BLUE = "#0073CF"; // consumer accent + interactive emphasis
export const AMBER = "#b45309"; // illustrative/simulated — the honesty color
export const DARK = "#071225"; // console surfaces (dark bands, prepared panels)

// Motion tokens: one append animation everywhere a record is written, so the
// ledger "feel" is consistent across surfaces. Keyframes live in index.css.
export const APPEND_ANIMATION = "ventus-append 0.35s ease backwards";
export const appendDelay = (index: number, stepMs = 90) => `ventus-append 0.4s ease ${index * stepMs}ms backwards`;

export type TruthTone = "live" | "demo" | "illustrative" | "pending";

export const TRUTH_TONE_CLASSES: Record<TruthTone, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  demo: "border-slate-200 bg-slate-100 text-slate-500",
  illustrative: "border-amber-200 bg-amber-50 text-amber-800",
  pending: "border-slate-200 bg-white text-slate-400",
};
