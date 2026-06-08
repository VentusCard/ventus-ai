import { getProductFlow } from "./productAutomatedFlows";
import { findAssetSignal } from "./lifestyleAssetSignals";

export interface ImageryBrief {
  query: string;
  keywords: string[];
  mood: string;
  composition: string;
  avoid: string[];
}

type Mood =
  | "Editorial calm"
  | "Quiet luxury"
  | "Warm domestic"
  | "Architectural minimal"
  | "Outdoor leisure"
  | "Considered craft";

interface SignalFragment {
  keywords: string[]; // atomic stock tags
  mood: Mood;
  composition?: string;
  avoid?: string[];
}

// Map asset-signal IDs to imagery fragments. IDs come from
// src/lib/lifestyleAssetSignals.ts (ASSET_SIGNALS_BY_PRODUCT).
const SIGNAL_FRAGMENTS: Record<string, SignalFragment> = {
  // Wealth Management
  "wm-private-banking": { keywords: ["marble lobby", "brass detail", "muted palette"], mood: "Quiet luxury", composition: "Architectural detail, single object focus" },
  "wm-country-club": { keywords: ["manicured lawn", "golden hour", "low fence line"], mood: "Outdoor leisure", composition: "Wide horizon, no faces" },
  "wm-private-aviation": { keywords: ["tarmac", "private hangar", "overcast"], mood: "Architectural minimal", composition: "Geometric, distant subject" },
  "wm-watch-collector": { keywords: ["watch macro", "leather", "patina"], mood: "Considered craft", composition: "Tight macro, shallow depth" },
  "wm-charter-yacht": { keywords: ["coastal marina", "teak deck", "morning light"], mood: "Outdoor leisure" },
  "wm-philanthropy": { keywords: ["letterpress", "fountain pen", "ledger"], mood: "Considered craft", composition: "Overhead flat lay" },
  "wm-equity-comp": { keywords: ["modern office", "glass facade", "dusk"], mood: "Architectural minimal" },
  "wm-second-home": { keywords: ["lakeside cabin", "porch light", "twilight"], mood: "Warm domestic" },
  "wm-fine-art": { keywords: ["gallery wall", "soft spotlight", "frame edge"], mood: "Editorial calm" },
  "wm-family-office": { keywords: ["library", "leather chair", "side lamp"], mood: "Quiet luxury" },

  // 529
  "529-newborn": { keywords: ["nursery detail", "soft cotton", "morning window"], mood: "Warm domestic", avoid: ["identifiable infants"] },
  "529-pediatric": { keywords: ["sunlit kitchen", "small shoes", "neutral toys"], mood: "Warm domestic" },
  "529-daycare": { keywords: ["wooden blocks", "natural light", "soft palette"], mood: "Warm domestic" },
  "529-private-school": { keywords: ["uniform blazer", "hardcover books", "campus light"], mood: "Editorial calm" },
  "529-tutoring": { keywords: ["study desk", "notebook", "warm lamp"], mood: "Warm domestic" },
  "529-grandparent-gift": { keywords: ["handwritten note", "envelope", "wood table"], mood: "Considered craft" },
  "529-college-tour": { keywords: ["ivy archway", "campus quad", "autumn light"], mood: "Editorial calm" },
  "529-youth-activities": { keywords: ["sports bag", "morning car", "neutral palette"], mood: "Warm domestic" },

  // HELOC
  "heloc-renovation": { keywords: ["construction plans", "wood beam", "drop cloth"], mood: "Considered craft" },
  "heloc-pool-solar": { keywords: ["backyard pool", "solar panel", "midday sun"], mood: "Outdoor leisure" },
  "heloc-designer": { keywords: ["fabric swatches", "marble counter", "brass tap"], mood: "Quiet luxury" },
  "heloc-appliances": { keywords: ["chef kitchen", "stainless steel", "natural light"], mood: "Architectural minimal" },
  "heloc-property-tax": { keywords: ["suburban porch", "morning light", "neat hedges"], mood: "Warm domestic" },
  "heloc-long-tenure": { keywords: ["established home", "mature trees", "front walk"], mood: "Warm domestic" },
  "heloc-landscaping": { keywords: ["garden bed", "stone path", "soft shadows"], mood: "Outdoor leisure" },

  // Auto
  "auto-dealer-visits": { keywords: ["showroom floor", "polished hood", "studio light"], mood: "Architectural minimal" },
  "auto-lease-end": { keywords: ["empty driveway", "garage door", "evening light"], mood: "Editorial calm" },
  "auto-insurance-shop": { keywords: ["car key", "wood table", "documents"], mood: "Considered craft", composition: "Overhead flat lay" },
  "auto-ev-charging": { keywords: ["charging port", "neon glow", "blue hour"], mood: "Architectural minimal" },
  "auto-performance": { keywords: ["coupe profile", "asphalt", "dusk reflection"], mood: "Editorial calm" },
  "auto-relocation": { keywords: ["moving boxes", "empty room", "window light"], mood: "Warm domestic" },

  // Mortgage
  "mort-above-rent": { keywords: ["city apartment", "afternoon light", "open window"], mood: "Editorial calm" },
  "mort-preapproval": { keywords: ["laptop", "coffee", "kitchen counter"], mood: "Warm domestic" },
  "mort-downpayment": { keywords: ["savings jar", "wood desk", "soft window light"], mood: "Considered craft" },
  "mort-wedding": { keywords: ["ring band", "linen", "soft daylight"], mood: "Quiet luxury" },
  "mort-relocation": { keywords: ["taped boxes", "tile floor", "open door"], mood: "Warm domestic" },
  "mort-rate-search": { keywords: ["phone screen mock", "neutral desk", "morning"], mood: "Editorial calm" },

  // Personal loan
  "pl-bnpl": { keywords: ["shopping bag", "phone", "tabletop"], mood: "Editorial calm" },
  "pl-util-creep": { keywords: ["card on desk", "warm lamp", "ledger"], mood: "Considered craft" },
  "pl-medical": { keywords: ["calm clinic interior", "soft tone", "empty chair"], mood: "Editorial calm", avoid: ["medical distress imagery"] },
  "pl-wedding": { keywords: ["venue chairs", "linen", "garden setup"], mood: "Outdoor leisure" },
  "pl-move": { keywords: ["empty apartment", "boxes", "afternoon"], mood: "Warm domestic" },
  "pl-cash-advance": { keywords: ["wallet", "wood desk", "morning"], mood: "Considered craft" },

  // HYSA
  "hys-idle-whale": { keywords: ["vault detail", "brass", "muted gradient"], mood: "Quiet luxury" },
  "hys-outbound-yield": { keywords: ["phone screen", "minimal desk", "neutral"], mood: "Architectural minimal" },
  "hys-bonus": { keywords: ["envelope", "wood desk", "single object"], mood: "Considered craft" },
  "hys-tax-refund": { keywords: ["calendar", "pen", "morning window"], mood: "Editorial calm" },
  "hys-maturing-cd": { keywords: ["paper certificate", "wood", "soft daylight"], mood: "Considered craft" },
  "hys-inheritance": { keywords: ["library", "leather book", "side lamp"], mood: "Quiet luxury" },

  // Travel
  "tc-multi-airline": { keywords: ["window seat", "wing", "blue hour"], mood: "Editorial calm" },
  "tc-hotel-diverse": { keywords: ["hotel hallway", "warm sconce", "single door"], mood: "Quiet luxury" },
  "tc-fx": { keywords: ["foreign currency", "passport", "wood table"], mood: "Considered craft", composition: "Overhead flat lay" },
  "tc-luxury-hotel": { keywords: ["resort terrace", "linen lounger", "ocean horizon"], mood: "Quiet luxury" },
  "tc-cruise": { keywords: ["ship rail", "wake", "open sea"], mood: "Outdoor leisure" },
  "tc-lounge-adjacent": { keywords: ["airport window", "tarmac at dusk", "muted"], mood: "Editorial calm" },
  "tc-fx-cost": { keywords: ["receipts", "card", "wood desk"], mood: "Considered craft" },

  // SBL
  "sbl-square-stripe": { keywords: ["card reader", "counter", "morning"], mood: "Warm domestic" },
  "sbl-vendor-cluster": { keywords: ["warehouse shelf", "boxes", "soft top light"], mood: "Architectural minimal" },
  "sbl-payroll": { keywords: ["laptop", "wood desk", "side window"], mood: "Editorial calm" },
  "sbl-saas-stack": { keywords: ["clean workspace", "monitor mock", "neutral"], mood: "Architectural minimal" },
  "sbl-commercial-lease": { keywords: ["storefront", "early morning", "open sign"], mood: "Warm domestic" },
  "sbl-inventory": { keywords: ["pallet", "warehouse floor", "muted light"], mood: "Architectural minimal" },

  // Life insurance
  "li-newborn": { keywords: ["nursery detail", "soft cotton", "morning"], mood: "Warm domestic", avoid: ["identifiable infants"] },
  "li-new-mortgage": { keywords: ["new key", "front door", "morning light"], mood: "Warm domestic" },
  "li-single-earner": { keywords: ["kitchen table", "two place settings", "warm light"], mood: "Warm domestic" },
  "li-estate-attorney": { keywords: ["leather folder", "fountain pen", "wood desk"], mood: "Considered craft" },
  "li-long-term-care": { keywords: ["garden bench", "soft afternoon", "neutral palette"], mood: "Outdoor leisure" },
  "li-recently-wed": { keywords: ["ring band", "linen", "soft daylight"], mood: "Quiet luxury" },
};

const PRODUCT_DEFAULTS: Record<string, SignalFragment> = {
  "wealth-management": { keywords: ["library", "brass detail", "muted palette"], mood: "Quiet luxury" },
  "529-plan": { keywords: ["hardcover books", "warm desk lamp", "neutral palette"], mood: "Warm domestic" },
  "heloc": { keywords: ["wood beam", "renovation detail", "afternoon light"], mood: "Considered craft" },
  "auto-loan": { keywords: ["car key", "polished surface", "studio light"], mood: "Architectural minimal" },
  "mortgage": { keywords: ["front door", "morning light", "neutral facade"], mood: "Warm domestic" },
  "personal-loan": { keywords: ["wood desk", "calm interior", "single object"], mood: "Editorial calm" },
  "high-yield-savings": { keywords: ["minimal desk", "single object", "muted tones"], mood: "Architectural minimal" },
  "travel-card": { keywords: ["window seat", "passport", "blue hour"], mood: "Editorial calm" },
  "small-business-loan": { keywords: ["counter", "card reader", "morning light"], mood: "Warm domestic" },
  "life-insurance": { keywords: ["kitchen table", "warm light", "neutral palette"], mood: "Warm domestic" },
};

const DEFAULT_AVOID = ["logos", "identifiable faces", "stock-cliché handshake"];

interface BuildInput {
  productId: string;
  personaLabel: string;
  signalIds: string[];
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function buildImageryBrief({ productId, personaLabel, signalIds }: BuildInput): ImageryBrief {
  const product = getProductFlow(productId);

  const fragments: SignalFragment[] = [];
  for (const sid of signalIds) {
    const frag = SIGNAL_FRAGMENTS[sid];
    if (frag) fragments.push(frag);
  }
  if (fragments.length === 0) {
    fragments.push(PRODUCT_DEFAULTS[productId] ?? { keywords: ["neutral interior", "single object", "soft daylight"], mood: "Editorial calm" });
  }

  // Aggregate keywords (cap to 6)
  const keywords = dedupe(fragments.flatMap((f) => f.keywords)).slice(0, 6);

  // Pick mood from first signal (most specific); fallback already handled
  const mood = fragments[0].mood;

  // Composition: first explicit composition, else mood-derived default
  const composition =
    fragments.find((f) => f.composition)?.composition ??
    (mood === "Quiet luxury" || mood === "Considered craft"
      ? "Tight crop, single object, shallow depth"
      : mood === "Architectural minimal"
      ? "Geometric, off-center subject, generous negative space"
      : mood === "Outdoor leisure"
      ? "Wide horizon, low subject, ambient light"
      : "Editorial wide, off-center, ambient light");

  const avoid = dedupe([...DEFAULT_AVOID, ...fragments.flatMap((f) => f.avoid ?? [])]);

  // Build a tight stock-search query (5–8 weighted terms)
  const queryTerms = dedupe([
    keywords[0],
    keywords[1],
    keywords[2],
    mood.toLowerCase(),
    "no people",
  ].filter(Boolean) as string[]);
  const query = queryTerms.join(", ");

  // Keep personaLabel + product available implicitly via keywords; no need to bloat query.
  void personaLabel;
  void product;

  return { query, keywords, mood, composition, avoid };
}

export function formatImageryBriefForClipboard(brief: ImageryBrief, productName: string, personaLabel: string): string {
  return [
    `Stock image brief`,
    `Product: ${productName}`,
    `Microsegment: ${personaLabel}`,
    `Query: ${brief.query}`,
    `Keywords: ${brief.keywords.join(", ")}`,
    `Mood: ${brief.mood}`,
    `Composition: ${brief.composition}`,
    `Avoid: ${brief.avoid.join(", ")}`,
  ].join("\n");
}

// Re-export for callers that need just the label resolver
export { findAssetSignal };
