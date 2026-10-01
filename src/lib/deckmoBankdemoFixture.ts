import type { EnrichedTransaction } from "@/components/exec-demo/execDemoData";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getPersonalizationSnapshot } from "@/lib/personalizationSnapshots";
import type { LifeEvent } from "@/types/lifestyle-signals";

const sourceCustomer = DEMO_CUSTOMERS[0];
const snapshot = getPersonalizationSnapshot(sourceCustomer.id);
// The deck narrative is about Ricky J #45275487 — reuse Sarah's dataset
// (tennis/Hawaii/pets themes match Ricky's signals) with Ricky's identity.
const customer = {
  ...sourceCustomer,
  profile: { ...sourceCustomer.profile, name: "Ricky J" },
};

const PILLARS: Record<string, { pillar: string; category: string }> = {
  "4511": { pillar: "Travel & Transport", category: "Air Travel" },
  "3058": { pillar: "Travel & Transport", category: "Air Travel" },
  "7011": { pillar: "Travel & Transport", category: "Lodging" },
  "4121": { pillar: "Travel & Transport", category: "Ground Transport" },
  "5411": { pillar: "Food & Dining", category: "Grocery" },
  "5812": { pillar: "Food & Dining", category: "Restaurants" },
  "5941": { pillar: "Sports & Active", category: "Equipment" },
  "5995": { pillar: "Pets & Care", category: "Pet Supplies" },
  "0742": { pillar: "Pets & Care", category: "Pet Health" },
  "5211": { pillar: "Home & Living", category: "Home Maintenance" },
  "5712": { pillar: "Home & Living", category: "Home Goods" },
  "6411": { pillar: "Financial Planning", category: "Real Estate" },
  "6531": { pillar: "Financial Planning", category: "Real Estate" },
};

function frozenTransactions(csv: string): EnrichedTransaction[] {
  const lines = csv.trim().split("\n");
  const header = lines[0]?.split(",").map((item) => item.trim().toLowerCase()) ?? [];
  const at = (name: string) => header.indexOf(name);
  return lines.slice(1).filter(Boolean).map((line, index) => {
    const cells = line.split(",").map((item) => item.trim());
    const mcc = cells[at("mcc")] ?? "";
    const mapped = PILLARS[mcc] ?? { pillar: "Everyday Spending", category: "General" };
    return {
      transaction_id: `deckmo-${index}`,
      merchant_name: cells[at("merchant_name")] ?? "Merchant",
      amount: Math.abs(Number(cells[at("amount")]) || 0),
      date: cells[at("date")],
      description: cells[at("description")],
      source: cells[at("source")],
      mcc,
      pillar: mapped.pillar,
      category: mapped.category,
      subcategories: [mapped.category],
      spending_tier: "Standard",
    };
  });
}

const lifeEvents = customer.lifeEvents.map((event) => ({
  event_name: event.name,
  confidence: event.confidence / 100,
  talking_points: [event.evidence],
  evidence: [],
})) satisfies LifeEvent[];

const deckmoProductCards: ProductCard[] = (snapshot?.productCards ?? []).map((card) =>
  card.product_name === "Our Bank Guided Investing"
    ? {
        type: "behavioral",
        product_name: "Our Bank High-Yield Savings",
        quote: "Put $35,000 to work for nine months and earn $1,550 toward your next tropical trip.",
        signal_label: "Annual tropical vacation",
        theme: "travel",
        offer_headline: "Earn more while saving for your next tropical trip",
        benefits: [
          "4% APR earns $1,050 over nine months",
          "$500 bonus brings the total benefit to $1,550",
          "No monthly service fee",
        ],
        eligibility: "$35,000 qualifying deposit held for nine months",
        cta: "Start Saving for Your Next Trip",
        cta_sub: "Open an account and fund your travel goal",
        estimated_label: "Est. Benefit",
        estimated_value: "$1,550",
      }
    : card,
);

export const DECKMO_BANKDEMO_FIXTURE = {
  customer,
  offers: snapshot?.offers ?? [],
  productCards: deckmoProductCards,
  lifeEvents,
  enrichedTransactions: frozenTransactions(customer.csv),
};