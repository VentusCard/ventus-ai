// One-off: regenerate the cached demo snapshot for Ricky J (c1) by calling the
// deployed generation edge functions with the same payload the app sends.
import { EXAMPLE_CUSTOMERS } from "../src/lib/personalizationExamples";
import { pillarFor } from "../src/lib/personalizationGeneration";

const URL = "https://qopysdercrqgwcrawndl.supabase.co/functions/v1";
const ANON = process.env.ANON_KEY!;

const CONFIDENCE_SCORE: Record<string, number> = { Strong: 0.88, Likely: 0.72, Emerging: 0.55 };
const SPEND_WEIGHT: Record<string, { spend: number; count: number }> = {
  Strong: { spend: 6400, count: 48 },
  Likely: { spend: 3800, count: 26 },
  Emerging: { spend: 1900, count: 12 },
};

const c = EXAMPLE_CUSTOMERS.find((x) => x.id === "c1")!;

const pillarRollups = c.spendingHabits.map((s) => {
  const w = SPEND_WEIGHT[s.confidence];
  const pillar = pillarFor(s.label);
  return { label: s.label, pillar, totalCount: w.count, totalSpend: w.spend, categories: [pillar], topMerchants: [] as string[], evidence: s.evidence };
});
const lifeEvents = c.lifeEvents.map((e) => ({ event_name: e.label, confidence: CONFIDENCE_SCORE[e.confidence], evidence_merchants: [] as string[] }));
const financialSignals = c.financialSignals.map((s) => ({ label: s.label, product_family: pillarFor(s.label), evidence: s.evidence, confidence: CONFIDENCE_SCORE[s.confidence] }));
const demographics = {
  ...((c.demo?.profile?.demographics ?? {}) as Record<string, string>),
  segment: c.segment,
  city: c.city,
  lifestyle_type: c.lifestyleType,
  products_held: c.products.join(", "),
  demographic_signals: c.demographicSignals.map((s) => s.label).join(", "),
};
const bankContext = { bankName: "Our Bank" };

async function call(fn: string, body: unknown) {
  const res = await fetch(`${URL}/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

const offersBody = {
  persona: { pillarRollups },
  pillars: pillarRollups.map((r) => ({ pillar: r.pillar, label: r.label, count: r.totalCount, totalSpend: r.totalSpend, topMerchants: [], subcategories: [] })),
  lifeEvents,
  financial_signals: financialSignals,
  demographics,
  months_of_data: 12,
  bankContext,
};

const cardsBody = {
  life_events: c.lifeEvents.map((e) => ({ event_name: e.label, confidence: CONFIDENCE_SCORE[e.confidence], talking_points: [e.evidence], evidence: [] })).slice(0, 2),
  persona_rollups: pillarRollups.slice(0, 2),
  pillars: pillarRollups.slice(0, 3).map((r) => ({ pillar: r.pillar, label: r.label, count: r.totalCount, totalSpend: r.totalSpend, subcategories: [] })),
  demographics,
  financial_signals: financialSignals.slice(0, 2),
  risk_flags: c.riskFlags.map((r) => ({ category: "habit_shift", severity: "low", merchant: "", amount: 0, date: "", reason: `${r.label} — ${r.evidence}` })),
  bankContext,
};

const [offersRes, cardsRes] = await Promise.all([call("generate-next-offers", offersBody), call("generate-product-cards", cardsBody)]);
const out = {
  offers: offersRes.rollupOffers ?? null,
  productCards: cardsRes.cards ?? cardsRes.product_cards ?? null,
};
console.log("groups:", (out.offers || []).map((g: any) => `${g.rollup} (${g.deals?.length ?? 0})`).join(" | "));
await Bun.write("/tmp/c1-snapshot.json", JSON.stringify(out, null, 2));
