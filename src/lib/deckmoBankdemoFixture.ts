import type { EnrichedTransaction } from "@/components/exec-demo/execDemoData";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import { getPersonalizationSnapshot } from "@/lib/personalizationSnapshots";
import type { LifeEvent } from "@/types/lifestyle-signals";

const customer = EXAMPLE_CUSTOMERS[0];
const snapshot = customer ? getPersonalizationSnapshot(customer.id) : null;

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

const lifeEvents = (customer?.lifeEvents ?? []).map((event) => ({
  event_name: event.label,
  confidence: event.confidence === "Strong" ? 0.88 : event.confidence === "Likely" ? 0.72 : 0.55,
  talking_points: [event.evidence],
  evidence: [],
})) as unknown as LifeEvent[];

export const DECKMO_BANKDEMO_FIXTURE = {
  customer: customer?.demo,
  offers: snapshot?.offers ?? [],
  productCards: snapshot?.productCards ?? [],
  lifeEvents,
  enrichedTransactions: customer ? frozenTransactions(customer.demo.csv) : [],
};