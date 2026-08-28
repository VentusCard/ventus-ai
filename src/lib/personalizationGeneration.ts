// Turns an example customer's SIGNALS (not transactions) into the request
// payloads that `generate-next-offers` and `generate-product-cards` already
// accept, and fires both. No enrichment / classification step — the signals
// are the input.

import { supabase } from "@/integrations/supabase/client";
import { getBankPromptContext } from "@/lib/demoBankConfig";
import type { DirectorySignal } from "@/lib/customerDirectoryData";
import type { ExampleCustomer } from "@/lib/personalizationExamples";
import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import type { LifeEvent } from "@/types/lifestyle-signals";

const CONFIDENCE_SCORE: Record<DirectorySignal["confidence"], number> = {
  Strong: 0.88,
  Likely: 0.72,
  Emerging: 0.55,
};

// Illustrative spend weights so the offer prompt can do value math. These are
// demo estimates derived from signal strength, not observed transaction totals.
const SPEND_WEIGHT: Record<DirectorySignal["confidence"], { spend: number; count: number }> = {
  Strong: { spend: 6400, count: 48 },
  Likely: { spend: 3800, count: 26 },
  Emerging: { spend: 1900, count: 12 },
};

export function pillarFor(label: string): string {
  const l = label.toLowerCase();
  if (/travel|flight|trip|hotel/.test(l)) return "Travel & Leisure";
  if (/dining|restaurant|food|coffee|grocery/.test(l)) return "Food & Dining";
  if (/fitness|gym|sport|wellness|racquet|golf|outdoor/.test(l)) return "Sports & Wellness";
  if (/pet|dog|cat/.test(l)) return "Pets";
  if (/home|improvement|furnish|garden/.test(l)) return "Home & Living";
  if (/tech|electronics|software|subscription|stream/.test(l)) return "Technology";
  if (/education|tutor|school|college/.test(l)) return "Education";
  if (/family|childcare|kids/.test(l)) return "Family";
  if (/luxury|fashion|apparel|retail|shopping/.test(l)) return "Shopping & Retail";
  if (/auto|car|vehicle|commute|transit/.test(l)) return "Auto & Transport";
  return "Lifestyle";
}

export function buildPillarRollups(customer: ExampleCustomer) {
  return customer.spendingHabits.map((s) => {
    const w = SPEND_WEIGHT[s.confidence];
    const pillar = pillarFor(s.label);
    return {
      label: s.label,
      pillar,
      totalCount: w.count,
      totalSpend: w.spend,
      categories: [pillar],
      topMerchants: [] as string[],
      evidence: s.evidence,
    };
  });
}

export function buildLifeEvents(customer: ExampleCustomer): LifeEvent[] {
  return customer.lifeEvents.map((e) => ({
    event_name: e.label,
    confidence: CONFIDENCE_SCORE[e.confidence],
    talking_points: [e.evidence],
    evidence: [],
  })) as unknown as LifeEvent[];
}

export function buildFinancialSignals(customer: ExampleCustomer) {
  return customer.financialSignals.map((s) => ({
    label: s.label,
    product_family: pillarFor(s.label),
    evidence: s.evidence,
    confidence: CONFIDENCE_SCORE[s.confidence],
  }));
}

function buildDemographics(customer: ExampleCustomer) {
  const d = (customer.demo?.profile?.demographics ?? {}) as Record<string, string>;
  return {
    ...d,
    segment: customer.segment,
    city: customer.city,
    lifestyle_type: customer.lifestyleType,
    products_held: customer.products.join(", "),
    demographic_signals: customer.demographicSignals.map((s) => s.label).join(", "),
  };
}

export interface PersonalizationGenerationResult {
  offers: RollupOfferGroup[] | null;
  productCards: ProductCard[] | null;
  lifeEvents: LifeEvent[];
}

export interface PersonalizationProgress {
  /** Fired as soon as the product-card call resolves, before offers finish. */
  onProductCards?: (cards: ProductCard[] | null) => void;
  /** Fired as soon as the offers call resolves. */
  onOffers?: (offers: RollupOfferGroup[] | null) => void;
}

/** Which generated payloads the calling surface actually renders. */
export type PersonalizationNeed = "offers" | "cards" | "all";

/** Fires the generation functions the requested surface needs. */
export async function generatePersonalizedExperience(
  customer: ExampleCustomer,
  progress?: PersonalizationProgress,
  need: PersonalizationNeed = "all",
): Promise<PersonalizationGenerationResult> {
  const pillarRollups = buildPillarRollups(customer);
  const lifeEvents = buildLifeEvents(customer);
  const financialSignals = buildFinancialSignals(customer);
  const demographics = buildDemographics(customer);
  const bankContext = getBankPromptContext();

  const riskFlags = customer.riskFlags.map((r) => ({
    category: "habit_shift",
    severity: "low",
    merchant: "",
    amount: 0,
    date: "",
    reason: `${r.label} — ${r.evidence}`,
  }));

  const wantOffers = need === "all" || need === "offers";
  const wantCards = need === "all" || need === "cards";

  const offersPromise = wantOffers
    ? supabase.functions.invoke("generate-next-offers", {
        body: {
          persona: { pillarRollups },
          pillars: pillarRollups.map((r) => ({
            pillar: r.pillar,
            label: r.label,
            count: r.totalCount,
            totalSpend: r.totalSpend,
            topMerchants: [],
            subcategories: [],
          })),
          lifeEvents: lifeEvents.map((e: any) => ({
            event_name: e.event_name,
            confidence: e.confidence,
            evidence_merchants: [],
          })),
          financial_signals: financialSignals,
          demographics,
          months_of_data: 12,
          bankContext,
        },
      })
    : null;

  // The card prompt only reads the first one or two entries of each family.
  const cardsPromise = wantCards
    ? supabase.functions.invoke("generate-product-cards", {
        body: {
          life_events: lifeEvents.slice(0, 2),
          persona_rollups: pillarRollups.slice(0, 2),
          pillars: pillarRollups.slice(0, 3).map((r) => ({
            pillar: r.pillar,
            label: r.label,
            count: r.totalCount,
            totalSpend: r.totalSpend,
            subcategories: [],
          })),
          demographics,
          financial_signals: financialSignals.slice(0, 2),
          risk_flags: riskFlags,
          bankContext,
        },
      })
    : null;

  // Progressive: publish each result the moment its own call resolves.
  const offersTracked = offersPromise
    ? offersPromise
        .then((res) => {
          const value = (!res.error ? (res.data?.rollupOffers ?? null) : null) as RollupOfferGroup[] | null;
          progress?.onOffers?.(value);
          return value;
        })
        .catch((err) => {
          console.error("[PERSONALIZATION] offers failed", err);
          progress?.onOffers?.(null);
          return null;
        })
    : Promise.resolve(null);

  const cardsTracked = cardsPromise
    ? cardsPromise
        .then((res) => {
          const value = (!res.error
            ? (res.data?.cards ?? res.data?.product_cards ?? null)
            : null) as ProductCard[] | null;
          progress?.onProductCards?.(value);
          return value;
        })
        .catch((err) => {
          console.error("[PERSONALIZATION] product cards failed", err);
          progress?.onProductCards?.(null);
          return null;
        })
    : Promise.resolve(null);

  const [offers, productCards] = await Promise.all([offersTracked, cardsTracked]);

  return { offers, productCards, lifeEvents };
}

/** Compact signal digest handed to the consumer chat as demo grounding. */
export function buildChatSignalContext(customer: ExampleCustomer): string {
  const fam = (title: string, list: DirectorySignal[]) =>
    list.length ? `${title}:\n${list.map((s) => `- ${s.label} (${s.confidence}) — ${s.evidence}`).join("\n")}\n` : "";

  return [
    `DEMO MODE: These are illustrative mock-up answers for a product demo. Keep every reply under 60 words, concrete and confident, and never invent exact dollar totals or transaction counts — speak in behavioral terms.`,
    `Customer: ${customer.name} · ${customer.segment} · ${customer.city} · products held: ${customer.products.join(", ")}`,
    fam("Life events", customer.lifeEvents),
    fam("Financial signals", customer.financialSignals),
    fam("Spending habits", customer.spendingHabits),
    fam("Demographic signals", customer.demographicSignals),
    fam("Risk", customer.riskFlags),
  ]
    .filter(Boolean)
    .join("\n");
}
