/**
 * One-off: generates the committed personalization snapshot for the default
 * demo bank. Run with: bun scripts/genPersonalizationSnapshots.ts
 */
import { EXAMPLE_CUSTOMERS } from "../src/lib/personalizationExamples";
import {
  buildPillarRollups,
  buildLifeEvents,
  buildFinancialSignals,
} from "../src/lib/personalizationGeneration";

const URL = process.env.SUPA_URL!;
const KEY = process.env.SUPA_KEY!;

async function invoke(name: string, body: unknown) {
  const res = await fetch(`${URL}/functions/v1/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} ${res.status} ${await res.text()}`);
  return res.json();
}

function demographicsFor(customer: any) {
  const d = (customer.demo?.profile?.demographics ?? {}) as Record<string, string>;
  return {
    ...d,
    segment: customer.segment,
    city: customer.city,
    lifestyle_type: customer.lifestyleType,
    products_held: customer.products.join(", "),
    demographic_signals: customer.demographicSignals.map((s: any) => s.label).join(", "),
  };
}

const out: Record<string, unknown> = {};

for (const customer of EXAMPLE_CUSTOMERS) {
  const pillarRollups = buildPillarRollups(customer);
  const lifeEvents = buildLifeEvents(customer) as any[];
  const financialSignals = buildFinancialSignals(customer);
  const demographics = demographicsFor(customer);
  const riskFlags = customer.riskFlags.map((r) => ({
    category: "habit_shift",
    severity: "low",
    merchant: "",
    amount: 0,
    date: "",
    reason: `${r.label} — ${r.evidence}`,
  }));

  const [offersRes, cardsRes] = await Promise.all([
    invoke("generate-next-offers", {
      persona: { pillarRollups },
      pillars: pillarRollups.map((r) => ({
        pillar: r.pillar,
        label: r.label,
        count: r.totalCount,
        totalSpend: r.totalSpend,
        topMerchants: [],
        subcategories: [],
      })),
      lifeEvents: lifeEvents.map((e) => ({
        event_name: e.event_name,
        confidence: e.confidence,
        evidence_merchants: [],
      })),
      financial_signals: financialSignals,
      demographics,
      months_of_data: 12,
      bankContext: null,
    }),
    invoke("generate-product-cards", {
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
      bankContext: null,
    }),
  ]);

  out[customer.id] = {
    offers: offersRes?.rollupOffers ?? null,
    productCards: cardsRes?.cards ?? cardsRes?.product_cards ?? null,
  };
  console.error(
    `${customer.id}: offers=${out[customer.id]?.["offers" as never] ? (offersRes.rollupOffers?.length ?? 0) : 0} cards=${(cardsRes?.cards ?? cardsRes?.product_cards ?? []).length}`,
  );
}

await Bun.write("/tmp/personalization-snapshots.json", JSON.stringify(out, null, 2));
console.error("done");
