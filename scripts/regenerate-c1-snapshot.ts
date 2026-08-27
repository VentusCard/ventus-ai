import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import type { DirectorySignal } from "@/lib/customerDirectoryData";
import type { ExampleCustomer } from "@/lib/personalizationExamples";
import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import type { LifeEvent } from "@/types/lifestyle-signals";

const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
const PROJECT_REF = "qopysdercrqgwcrawndl";

const CONFIDENCE_SCORE: Record<DirectorySignal["confidence"], number> = {
  Strong: 0.88,
  Likely: 0.72,
  Emerging: 0.55,
};

const SPEND_WEIGHT: Record<DirectorySignal["confidence"], { spend: number; count: number }> = {
  Strong: { spend: 6400, count: 48 },
  Likely: { spend: 3800, count: 26 },
  Emerging: { spend: 1900, count: 12 },
};

function pillarFor(label: string): string {
  const l = label.toLowerCase();
  if (/travel|flight|trip|hotel/.test(l)) return "Travel & Leisure";
  if (/dining|restaurant|food|coffee|grocery/.test(l)) return "Food & Dining";
  if (/fitness|gym|sport|wellness|racquet|golf|outdoor|tennis/.test(l)) return "Sports & Wellness";
  if (/pet|dog|cat/.test(l)) return "Pets";
  if (/home|improvement|furnish|garden|house/.test(l)) return "Home & Living";
  if (/tech|electronics|software|subscription|stream/.test(l)) return "Technology";
  if (/education|tutor|school|college/.test(l)) return "Education";
  if (/family|childcare|kids/.test(l)) return "Family";
  if (/luxury|fashion|apparel|retail|shopping/.test(l)) return "Shopping & Retail";
  if (/auto|car|vehicle|commute|transit/.test(l)) return "Auto & Transport";
  return "Lifestyle";
}

function buildPillarRollups(customer: ExampleCustomer) {
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

function buildLifeEvents(customer: ExampleCustomer): LifeEvent[] {
  return customer.lifeEvents.map((e) => ({
    event_name: e.label,
    confidence: CONFIDENCE_SCORE[e.confidence],
    talking_points: [e.evidence],
    evidence: [],
  })) as unknown as LifeEvent[];
}

function buildFinancialSignals(customer: ExampleCustomer) {
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

async function invoke<T>(name: string, body: unknown): Promise<T | null> {
  const res = await fetch(`https://${PROJECT_REF}.supabase.co/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`${name} failed:`, res.status, await res.text());
    return null;
  }
  const data = await res.json();
  console.log(`${name} response keys:`, Object.keys(data));
  return data as T;
}

async function main() {
  const customer = EXAMPLE_CUSTOMERS.find((c) => c.id === "c1");
  if (!customer) throw new Error("c1 not found");

  const pillarRollups = buildPillarRollups(customer);
  const lifeEvents = buildLifeEvents(customer);
  const financialSignals = buildFinancialSignals(customer);
  const demographics = buildDemographics(customer);
  const bankContext = null;

  const riskFlags = customer.riskFlags.map((r) => ({
    category: "habit_shift",
    severity: "low",
    merchant: "",
    amount: 0,
    date: "",
    reason: `${r.label} — ${r.evidence}`,
  }));

  const offersBody = {
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
  };

  const cardsBody = {
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
  };

  const offersRes = await invoke<{ rollupOffers?: RollupOfferGroup[] }>("generate-next-offers", offersBody);
  const cardsRes = await invoke<{ cards?: ProductCard[]; product_cards?: ProductCard[] }>("generate-product-cards", cardsBody);

  const snapshot = {
    offers: offersRes?.rollupOffers ?? null,
    productCards: cardsRes?.cards ?? cardsRes?.product_cards ?? null,
  };

  console.log(JSON.stringify({ c1: snapshot }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
