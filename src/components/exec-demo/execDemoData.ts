import {
  SAMPLE_CSV,
  SAMPLE_CSV_SPORTS_WELLNESS,
  SAMPLE_CSV_FOOD_HOME,
  SAMPLE_CSV_TRAVEL_FAMILY_12,
  SAMPLE_CSV_NYC_SPORTS_HOME_12,
  SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
  MCC_DESCRIPTIONS,
} from "@/lib/sampleData";

export const SOURCE_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

export interface Transaction {
  date: string;
  merchant: string;
  amount: string;
  source?: string;
  description?: string;
  mcc?: string;
}

export interface IntelCard {
  accent: string;
  icon: string;
  title: string;
  subtitle?: string;
  content: string;
  pills?: string[];
  txIndices: number[];
}

export interface ExecIntelligence {
  analytics: IntelCard;
  rewards: IntelCard;
  relationship: IntelCard;
}

export interface SignalEntry {
  pillar: string;
  label: string;
  amount: number;
  frequency?: string;
  mcc?: string;
  mccDescription?: string;
  category?: string;
  tier?: string;
  confidence?: number;
}

export interface ExecPersona {
  accent: string;
  icon: string;
  title: string;
  pills: string[];
  signalMap: Record<number, SignalEntry>;
  descriptions?: Record<number, string>;
}

// ---------- CSV → Transaction[] ----------

function maskSource(source: string): string {
  const hash = Array.from(source).reduce((a, c) => a + c.charCodeAt(0), 0);
  const last4 = String(hash % 10000).padStart(4, "0");
  return `••${last4}`;
}

export function parseCsvToTransactions(csv: string): Transaction[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const merchantIdx = header.indexOf("merchant_name");
  const amountIdx = header.indexOf("amount");
  const dateIdx = header.indexOf("date");
  const sourceIdx = header.indexOf("source");
  const descIdx = header.indexOf("description");
  const mccIdx = header.indexOf("mcc");

  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const rawAmt = parseFloat(cols[amountIdx] || "0");
    const merchant = cols[merchantIdx] || "Unknown";
    const description = descIdx >= 0 ? (cols[descIdx] || undefined) : undefined;
    const flow = getFlow({ merchant_name: merchant, description });
    const fmt = formatAccounting(rawAmt, flow);
    const rawDate = cols[dateIdx] || "";
    const dateParts = rawDate.split("-");
    const shortDate = dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}/${dateParts[0].slice(2)}` : rawDate.slice(5);
    return {
      date: shortDate,
      merchant,
      amount: fmt,
      source: sourceIdx >= 0 ? (cols[sourceIdx] || undefined) : undefined,
      description,
      mcc: mccIdx >= 0 ? (cols[mccIdx] || undefined) : undefined,
    };
  });
}



// ---------- MCC → Signal mapping ----------

const MCC_SIGNAL_MAP: Record<string, Omit<SignalEntry, 'amount' | 'mcc' | 'mccDescription'>> = {
  "4511": { pillar: "Travel & Transport", label: "Airlines", category: "Air Travel", tier: "Premium", frequency: "Occasional" },
  "3058": { pillar: "Travel & Transport", label: "Airlines", category: "Air Travel", tier: "Premium", frequency: "Occasional" },
  "7011": { pillar: "Travel & Transport", label: "Hotels", category: "Lodging", tier: "Premium", frequency: "Occasional" },
  "4121": { pillar: "Travel & Transport", label: "Rideshare", category: "Ground Transport", tier: "Standard", frequency: "Weekly" },
  "5541": { pillar: "Travel & Transport", label: "Gas", category: "Fuel", tier: "Budget", frequency: "Weekly" },
  "4111": { pillar: "Travel & Transport", label: "Transit", category: "Ground Transport", tier: "Budget", frequency: "Weekly" },
  "7512": { pillar: "Travel & Transport", label: "Car Rental", category: "Ground Transport", tier: "Standard", frequency: "Occasional" },
  "4789": { pillar: "Travel & Transport", label: "Transit", category: "Ground Transport", tier: "Budget", frequency: "Monthly" },
  "7523": { pillar: "Travel & Transport", label: "Parking", category: "Ground Transport", tier: "Budget", frequency: "Weekly" },
  "5411": { pillar: "Food & Dining", label: "Grocery", category: "Grocery", tier: "Standard", frequency: "Weekly" },
  "5300": { pillar: "Food & Dining", label: "Wholesale", category: "Grocery", tier: "Budget", frequency: "Monthly" },
  "5812": { pillar: "Food & Dining", label: "Dining", category: "Restaurants", tier: "Standard", frequency: "Weekly" },
  "5814": { pillar: "Food & Dining", label: "Fast Casual", category: "Restaurants", tier: "Budget", frequency: "Weekly" },
  "5499": { pillar: "Food & Dining", label: "Supplements", category: "Health Food", tier: "Premium", frequency: "Monthly" },
  "7997": { pillar: "Wellness & Fitness", label: "Gym", category: "Fitness", tier: "Premium", frequency: "Monthly" },
  "7298": { pillar: "Wellness & Fitness", label: "Spa", category: "Personal Care", tier: "Premium", frequency: "Occasional" },
  "8043": { pillar: "Healthcare", label: "Optician", category: "Vision", tier: "Standard", frequency: "Annually" },
  "8049": { pillar: "Wellness & Fitness", label: "Chiropractic", category: "Therapy", tier: "Standard", frequency: "Monthly" },
  "5651": { pillar: "Shopping", label: "Apparel", category: "Fashion", tier: "Standard", frequency: "Monthly" },
  "5655": { pillar: "Shopping", label: "Athletic Wear", category: "Fashion", tier: "Premium", frequency: "Occasional" },
  "5661": { pillar: "Shopping", label: "Shoes", category: "Fashion", tier: "Standard", frequency: "Occasional" },
  "5977": { pillar: "Shopping", label: "Beauty", category: "Personal Care", tier: "Standard", frequency: "Monthly" },
  "5969": { pillar: "Shopping", label: "Marketplace", category: "E-Commerce", tier: "Standard", frequency: "Weekly" },
  "5942": { pillar: "Shopping", label: "Books", category: "Media", tier: "Budget", frequency: "Monthly" },
  "5734": { pillar: "Technology", label: "Software", category: "Digital Services", tier: "Standard", frequency: "Monthly" },
  "5722": { pillar: "Home & Living", label: "Appliances", category: "Home Goods", tier: "Premium", frequency: "One-Time" },
  "5995": { pillar: "Pets & Care", label: "Pet Care", category: "Pet Supplies", tier: "Standard", frequency: "Monthly" },
  "0742": { pillar: "Pets & Care", label: "Veterinary", category: "Pet Health", tier: "Premium", frequency: "Occasionally" },
  "4899": { pillar: "Entertainment", label: "Streaming", category: "Digital Media", tier: "Budget", frequency: "Monthly" },
  "7922": { pillar: "Entertainment", label: "Events", category: "Live Events", tier: "Premium", frequency: "Occasional" },
  "7832": { pillar: "Entertainment", label: "Movies", category: "Cinema", tier: "Budget", frequency: "Monthly" },
  "7996": { pillar: "Entertainment", label: "Attractions", category: "Recreation", tier: "Standard", frequency: "Occasional" },
  "7998": { pillar: "Entertainment", label: "Attractions", category: "Recreation", tier: "Standard", frequency: "Occasional" },
  "7999": { pillar: "Entertainment", label: "Activities", category: "Recreation", tier: "Standard", frequency: "Occasional" },
  "5211": { pillar: "Home & Living", label: "Home Improvement", category: "Home Maintenance", tier: "Standard", frequency: "Occasional" },
  "5712": { pillar: "Home & Living", label: "Furniture", category: "Home Goods", tier: "Premium", frequency: "One-Time" },
  "5714": { pillar: "Home & Living", label: "Home Décor", category: "Home Goods", tier: "Standard", frequency: "Occasional" },
  "5251": { pillar: "Home & Living", label: "Hardware", category: "Home Maintenance", tier: "Budget", frequency: "Occasional" },
  "7217": { pillar: "Home & Living", label: "Cleaning", category: "Home Services", tier: "Standard", frequency: "Monthly" },
  "1711": { pillar: "Home & Living", label: "Services", category: "Home Services", tier: "Standard", frequency: "Occasional" },
  "8299": { pillar: "Education & Family", label: "Education", category: "Learning", tier: "Premium", frequency: "Monthly" },
  "7941": { pillar: "Education & Family", label: "Kids Sports", category: "Youth Activities", tier: "Standard", frequency: "Monthly" },
  "5945": { pillar: "Education & Family", label: "Toys", category: "Kids", tier: "Budget", frequency: "Occasional" },
  "5912": { pillar: "Healthcare", label: "Pharmacy", category: "Rx & OTC", tier: "Standard", frequency: "Monthly" },
  "8011": { pillar: "Healthcare", label: "Medical", category: "Clinical", tier: "Premium", frequency: "Occasional" },
  "5641": { pillar: "Education & Family", label: "Baby", category: "Kids", tier: "Standard", frequency: "Monthly" },
  "5941": { pillar: "Sports & Active", label: "Sporting Goods", category: "Equipment", tier: "Standard", frequency: "Occasional" },
  "5999": { pillar: "Shopping", label: "General", category: "General Retail", tier: "Standard", frequency: "Occasional" },
  "4900": { pillar: "Home & Living", label: "Utilities", category: "Bills", tier: "Standard", frequency: "Monthly" },
  "6163": { pillar: "Financial Planning", label: "Mortgage", category: "Lending", tier: "Premium", frequency: "Monthly" },
  "6411": { pillar: "Financial Planning", label: "Title & Escrow", category: "Real Estate", tier: "Premium", frequency: "One-Time" },
  "6531": { pillar: "Financial Planning", label: "Real Estate", category: "Real Estate", tier: "Premium", frequency: "One-Time" },
  "7389": { pillar: "Home & Living", label: "Inspection", category: "Home Services", tier: "Standard", frequency: "One-Time" },
  "8111": { pillar: "Financial Planning", label: "Estate", category: "Legal", tier: "Premium", frequency: "Occasional" },
};

function buildSignalMap(csv: string): Record<number, SignalEntry> {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return {};
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const mccIdx = header.indexOf("mcc");
  const amountIdx = header.indexOf("amount");

  const map: Record<number, SignalEntry> = {};
  const rows = lines.slice(1).filter((l) => l.trim());

  rows.forEach((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const mcc = cols[mccIdx] || "";
    const rawAmt = parseFloat(cols[amountIdx] || "0");
    const mccDesc = MCC_DESCRIPTIONS[mcc] || "Unknown";
    const signal = MCC_SIGNAL_MAP[mcc];
    if (signal) {
      map[i] = { ...signal, amount: rawAmt, mcc, mccDescription: mccDesc };
    } else {
      map[i] = { pillar: "Miscellaneous", label: "Other", amount: rawAmt, mcc: mcc || "N/A", mccDescription: mccDesc };
    }
  });

  return map;
}

// ---------- Build profiles from real CSVs ----------

const CSV_LIST = [
  SAMPLE_CSV,
  SAMPLE_CSV_SPORTS_WELLNESS,
  SAMPLE_CSV_FOOD_HOME,
  SAMPLE_CSV_TRAVEL_FAMILY_12,
  SAMPLE_CSV_NYC_SPORTS_HOME_12,
  SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
];

const PERSONA_META: { pills: string[] }[] = [
  { pills: ["Wellness Explorer", "Career Focused", "Active Lifestyle", "Organic Consumer"] },
  { pills: ["Tech Enthusiast", "Fitness Focused", "Home Buyer", "Gaming Lifestyle"] },
  { pills: ["Family Planner", "Home Investor", "Education Focused", "Multi-Generational Care"] },
  { pills: ["Golf Enthusiast", "Wine Connoisseur", "Travel Regular", "Pre-Retiree"] },
  { pills: ["Urban Professional", "Fashion Forward", "Culture Lover", "Career Ambitious"] },
  { pills: ["Adventurer", "Active Investor", "Tennis Player", "Philanthropist"] },
];

const INTELLIGENCE_META: ExecIntelligence[] = [
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Travel 34% · Dining 22% · Wellness 18% of wallet. Career Advancement signals detected — LinkedIn Premium + coaching spend cluster.",
      txIndices: [0, 2, 8, 12, 20],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["REI 10% Back", "Sweetgreen $5 Off", "Equinox First Month Free", "Away 20% Off"],
      txIndices: [1, 3, 5, 11, 19],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Event: Career Advancement detected. Recommend Premium Travel Card upgrade + investment advisory introduction.",
      txIndices: [7, 9, 14, 28],
    },
  },
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Fitness 30% · Grocery 22% · Outdoor 18% of wallet. Family Formation pattern detected — prenatal + nursery purchases.",
      txIndices: [0, 2, 5, 7, 14],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["Lululemon 15% Off", "REI $50 Credit", "Equinox Free Month", "Whole Foods 10% Back"],
      txIndices: [1, 3, 6, 10, 20],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Event: Family Formation detected. Recommend 529 plan setup + family insurance advisory.",
      txIndices: [11, 49, 75, 76],
    },
  },
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Home 30% · Grocery 25% · Dining 20% of wallet. Home Purchase pattern detected — mortgage + inspection + title cluster.",
      txIndices: [0, 2, 6, 12, 24],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["Home Depot 10% Off", "Costco $50 Credit", "HelloFresh Free Week", "Target 20% Back"],
      txIndices: [1, 3, 7, 14, 22],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Event: Home Purchase detected. Recommend mortgage pre-approval + home insurance bundle.",
      txIndices: [23, 60, 61, 76],
    },
  },
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Travel 35% · Family Activities 22% · Grocery 18% of wallet. Multiple international family trips detected across 3 continents.",
      txIndices: [6, 8, 49, 87, 131],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["United 50K Miles", "Costco $100 Credit", "Four Seasons Upgrade", "Budget Rental Free Day"],
      txIndices: [3, 10, 23, 27, 38],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Events: College Prep + Retirement Planning detected. Recommend 529 plan + estate planning consultation.",
      txIndices: [50, 89, 190, 204],
    },
  },
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Fitness 26% · Dining 22% · Home 20% of wallet. Urban wellness lifestyle with apartment upgrade pattern.",
      txIndices: [0, 4, 9, 16, 22],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["Equinox Free Month", "Sweetgreen $5 Off", "West Elm 15% Off", "SoulCycle 3 Free Rides"],
      txIndices: [1, 5, 7, 11, 17],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Events: Education Funding + Career Change detected. Recommend 529 plan advisory + executive banking upgrade.",
      txIndices: [38, 56, 70, 85],
    },
  },
  {
    analytics: {
      accent: "#60a5fa", icon: "◆", title: "Analytics Intelligence",
      subtitle: "Spend patterns reveal lifestyle segments",
      content: "Dining 28% · Fitness 22% · Investments 20% of wallet. Retirement Planning at 91% confidence — 401k max + AARP signals.",
      txIndices: [0, 2, 5, 10, 18],
    },
    rewards: {
      accent: "#34d399", icon: "★", title: "Smart Rewards",
      subtitle: "Hyper-personalized deal matching",
      content: "", pills: ["Delta 100K Miles", "Schwab Free Consult", "OpenTable $50 Credit", "TaylorMade 25% Off"],
      txIndices: [1, 3, 6, 12, 20],
    },
    relationship: {
      accent: "#fbbf24", icon: "⚡", title: "Relationship Intelligence",
      subtitle: "Life events & next-best-product",
      content: "Life Events: Retirement + Wealth Transfer detected. Recommend dynasty trust setup + charitable foundation advisory.",
      txIndices: [30, 45, 60, 75],
    },
  },
];

const EXEC_PROFILES: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }[] =
  CSV_LIST.map((csv, i) => {
    const transactions = parseCsvToTransactions(csv);
    const signalMap = buildSignalMap(csv);
    // Clamp txIndices to actual array length
    const intel = INTELLIGENCE_META[i];
    const clamp = (indices: number[]) => indices.filter((idx) => idx < transactions.length);
    return {
      transactions,
      persona: {
        accent: "#a78bfa",
        icon: "◈",
        title: "Dynamic Persona",
        pills: PERSONA_META[i].pills,
        signalMap,
      },
      intelligence: {
        analytics: { ...intel.analytics, txIndices: clamp(intel.analytics.txIndices) },
        rewards: { ...intel.rewards, txIndices: clamp(intel.rewards.txIndices) },
        relationship: { ...intel.relationship, txIndices: clamp(intel.relationship.txIndices) },
      },
    };
  });

/** Map a DemoCustomer index to exec-demo intelligence cards */
export function getIntelligenceForCustomer(customerIdx: number): { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } {
  return EXEC_PROFILES[customerIdx % EXEC_PROFILES.length];
}

export const getSourceColor = (transactions: Transaction[], date: string): string => {
  const uniqueDates = [...new Set(transactions.map((t) => t.date))];
  const idx = uniqueDates.indexOf(date);
  return SOURCE_COLORS[idx % SOURCE_COLORS.length];
};

/** Get raw CSV for a given customer index */
export function getCsvForCustomer(customerIdx: number): string {
  return CSV_LIST[customerIdx % CSV_LIST.length];
}

/** Build a local-only profile using MCC signal map (instant, no AI) */
export function buildLocalProfile(csv: string, customerIdx: number, customName?: string): { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } {
  const transactions = parseCsvToTransactions(csv);
  const signalMap = buildSignalMap(csv);
  const fallback = EXEC_PROFILES[customerIdx % EXEC_PROFILES.length];
  const clamp = (indices: number[]) => indices.filter((idx) => idx < transactions.length);

  // For custom data, generate evenly-spaced txIndices
  const customTxIndices = (count: number) => {
    const step = Math.max(1, Math.floor(transactions.length / count));
    return Array.from({ length: count }, (_, i) => Math.min(i * step, transactions.length - 1));
  };

  const isCustom = !!customName;

  return {
    transactions,
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: customName || "Dynamic Persona",
      pills: isCustom ? ["Analyzing...", "Processing Signals"] : PERSONA_META[customerIdx % PERSONA_META.length].pills,
      signalMap,
    },
    intelligence: isCustom ? {
      analytics: { ...fallback.intelligence.analytics, txIndices: customTxIndices(5) },
      rewards: { ...fallback.intelligence.rewards, txIndices: customTxIndices(5) },
      relationship: { ...fallback.intelligence.relationship, txIndices: customTxIndices(4) },
    } : {
      analytics: { ...fallback.intelligence.analytics, txIndices: clamp(fallback.intelligence.analytics.txIndices) },
      rewards: { ...fallback.intelligence.rewards, txIndices: clamp(fallback.intelligence.rewards.txIndices) },
      relationship: { ...fallback.intelligence.relationship, txIndices: clamp(fallback.intelligence.relationship.txIndices) },
    },
  };
}

/** Convert CSV to the payload format expected by classify-transactions */
export function csvToClassifyPayload(csv: string): {
  transaction_id: string;
  merchant_name: string;
  amount: number;
  date: string;
  description?: string;
  source?: string;
  zip_code?: string;
  mcc?: string;
}[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const merchantIdx = header.indexOf("merchant_name");
  const amountIdx = header.indexOf("amount");
  const dateIdx = header.indexOf("date");
  const descIdx = header.indexOf("description");
  const sourceIdx = header.indexOf("source");
  const zipIdx = header.indexOf("zip_code");
  const homeZipIdx = header.indexOf("home_zip");
  const mccIdx = header.indexOf("mcc");

  return lines.slice(1).filter((l) => l.trim()).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const desc = descIdx >= 0 ? cols[descIdx] : "";
    const source = sourceIdx >= 0 ? cols[sourceIdx] : "";
    const zip = zipIdx >= 0 ? cols[zipIdx] : (homeZipIdx >= 0 ? cols[homeZipIdx] : "");
    const mcc = mccIdx >= 0 ? cols[mccIdx] : "";
    return {
      transaction_id: `tx-${i}`,
      merchant_name: cols[merchantIdx] || "Unknown",
      amount: Math.abs(parseFloat(cols[amountIdx] || "0")),
      date: cols[dateIdx] || "",
      ...(desc && { description: desc }),
      ...(source && { source }),
      ...(zip && { zip_code: zip }),
      ...(mcc && { mcc }),
    };
  });
}

/** Enriched transaction from classify-transactions */
export interface EnrichedTransaction {
  transaction_id: string;
  merchant_name: string;
  amount: number;
  date?: string;
  pillar: string;
  category: string;
  subcategories: string[];
  spending_tier: string;
  purchase_frequency?: string;
  confidence?: number;
  // Raw fields preserved from the source CSV for the "before → after" view
  description?: string;
  mcc?: string;
  source?: string;
}

/** Build signal map from AI-classified enriched transactions, preserving MCC data from raw CSV */
export function buildSignalMapFromClassified(enrichedTxs: EnrichedTransaction[], csv?: string): Record<number, SignalEntry> {
  // Parse MCC codes + descriptions from raw CSV so tooltip row 1 stays accurate
  const mccFromCsv: Record<number, { mcc: string; mccDescription: string }> = {};
  if (csv) {
    const lines = csv.trim().split("\n");
    if (lines.length >= 2) {
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const mccIdx = header.indexOf("mcc");
      lines.slice(1).filter((l) => l.trim()).forEach((line, i) => {
        const cols = line.split(",").map((c) => c.trim());
        const mcc = cols[mccIdx] || "";
        mccFromCsv[i] = { mcc, mccDescription: MCC_DESCRIPTIONS[mcc] || "Unknown" };
      });
    }
  }

  const map: Record<number, SignalEntry> = {};
  enrichedTxs.forEach((tx) => {
    const idx = parseInt(tx.transaction_id.replace("tx-", ""), 10);
    if (isNaN(idx)) return;
    const csvMcc = mccFromCsv[idx];
    map[idx] = {
      pillar: tx.pillar || "Miscellaneous",
      label: tx.subcategories?.[0] || tx.category || "General",
      category: tx.category || "General",
      amount: tx.amount || 0,
      frequency: tx.purchase_frequency,
      tier: tx.spending_tier,
      confidence: tx.confidence,
      mcc: csvMcc?.mcc || "",
      mccDescription: csvMcc?.mccDescription || "Unknown",
    };
  });
  return map;
}

/** Merge AI results (pills, descriptions, intelligence) into an existing local profile */
export function mergeAiResults(
  localProfile: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] },
  aiResult: {
    pills: string[];
    descriptions: Record<string, string>;
    intelligence: {
      analytics: { accent: string; icon: string; title: string; subtitle: string; content: string; txIndices: number[] };
      rewards: { accent: string; icon: string; title: string; subtitle: string; pills: string[]; txIndices: number[] };
      relationship: { accent: string; icon: string; title: string; subtitle: string; content: string; txIndices: number[] };
    };
  }
): { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } {
  const txCount = localProfile.transactions.length;
  const clamp = (indices: number[]) => indices.filter((idx) => idx < txCount);

  const descriptions: Record<number, string> = {};
  for (const [key, val] of Object.entries(aiResult.descriptions)) {
    descriptions[parseInt(key, 10)] = val;
  }

  return {
    transactions: localProfile.transactions,
    persona: {
      ...localProfile.persona,
      pills: aiResult.pills.length > 0 ? aiResult.pills : localProfile.persona.pills,
      descriptions,
    },
    intelligence: {
      analytics: { ...aiResult.intelligence.analytics, txIndices: clamp(aiResult.intelligence.analytics.txIndices) },
      rewards: { ...aiResult.intelligence.rewards, content: "", txIndices: clamp(aiResult.intelligence.rewards.txIndices) },
      relationship: { ...aiResult.intelligence.relationship, txIndices: clamp(aiResult.intelligence.relationship.txIndices) },
    },
  };
}
