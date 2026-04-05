export const SOURCE_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

export interface Transaction {
  account: string;
  merchant: string;
  amount: string;
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
}

export interface ExecPersona {
  accent: string;
  icon: string;
  title: string;
  pills: string[];
  signalMap: Record<number, SignalEntry>;
}

/** Map a DemoCustomer index to exec-demo intelligence cards */
export function getIntelligenceForCustomer(customerIdx: number): { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } {
  return EXEC_PROFILES[customerIdx % EXEC_PROFILES.length];
}

const EXEC_PROFILES: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }[] = [
  // c1 — Wellness Explorer (Michael R. style)
  {
    transactions: [
      { account: "••4821", merchant: "Equinox Fitness", amount: "$200.00" },
      { account: "••9053", merchant: "Whole Foods Market", amount: "$157.00" },
      { account: "••7390", merchant: "Delta Air Lines", amount: "$450.00" },
      { account: "••2156", merchant: "Sephora", amount: "$157.00" },
      { account: "••4821", merchant: "REI Co-op", amount: "$235.00" },
      { account: "••9053", merchant: "Sweetgreen", amount: "$34.00" },
      { account: "••7390", merchant: "Away Luggage", amount: "$295.00" },
      { account: "••2156", merchant: "LinkedIn Premium", amount: "$59.99" },
      { account: "••4821", merchant: "Peloton", amount: "$44.00" },
      { account: "••9053", merchant: "Trader Joe's", amount: "$94.20" },
      { account: "••7390", merchant: "Marriott Bonvoy", amount: "$892.00" },
      { account: "••2156", merchant: "Lululemon", amount: "$148.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Wellness Explorer", "Career Focused", "Active Lifestyle", "Organic Consumer"],
      signalMap: {
        0: { pillar: "Wellness & Fitness", label: "Gym" },
        1: { pillar: "Food & Dining", label: "Grocery" },
        2: { pillar: "Travel & Transport", label: "Airlines" },
        3: { pillar: "Shopping", label: "Beauty" },
        4: { pillar: "Wellness & Fitness", label: "Outdoor" },
        5: { pillar: "Food & Dining", label: "Fast Casual" },
        6: { pillar: "Travel & Transport", label: "Luggage" },
        7: { pillar: "Career & Education", label: "Professional" },
        8: { pillar: "Wellness & Fitness", label: "Fitness" },
        9: { pillar: "Food & Dining", label: "Grocery" },
        10: { pillar: "Travel & Transport", label: "Hotels" },
        11: { pillar: "Shopping", label: "Athleisure" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Travel 34% · Dining 22% · Wellness 18% of wallet. Career Advancement signals detected — LinkedIn Premium + coaching spend cluster.",
        txIndices: [0, 2, 4, 6, 8],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["REI 10% Back", "Sweetgreen $5 Off", "Equinox First Month Free", "Away 20% Off"],
        txIndices: [1, 3, 5, 9, 11],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Event: Career Advancement detected. Recommend Premium Travel Card upgrade + investment advisory introduction.",
        txIndices: [7, 10, 2, 6],
      },
    },
  },
  // c2 — Tech Enthusiast
  {
    transactions: [
      { account: "••3347", merchant: "Equinox Austin", amount: "$250.00" },
      { account: "••8812", merchant: "Barry's Bootcamp", amount: "$150.00" },
      { account: "••5501", merchant: "REI Co-op", amount: "$235.00" },
      { account: "••6274", merchant: "Nike Store", amount: "$160.00" },
      { account: "••3347", merchant: "Best Buy", amount: "$1,299.00" },
      { account: "••8812", merchant: "Home Depot", amount: "$847.00" },
      { account: "••5501", merchant: "Peloton", amount: "$44.00" },
      { account: "••6274", merchant: "DoorDash", amount: "$87.40" },
      { account: "••3347", merchant: "PlayStation Store", amount: "$69.99" },
      { account: "••8812", merchant: "U-Haul", amount: "$189.00" },
      { account: "••5501", merchant: "Zillow Premium", amount: "$29.99" },
      { account: "••6274", merchant: "Ring Doorbell", amount: "$199.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Tech Enthusiast", "Fitness Focused", "Home Buyer", "Gaming Lifestyle"],
      signalMap: {
        0: { pillar: "Wellness & Fitness", label: "Gym" },
        1: { pillar: "Wellness & Fitness", label: "Bootcamp" },
        2: { pillar: "Shopping", label: "Outdoor" },
        3: { pillar: "Shopping", label: "Athletic" },
        4: { pillar: "Technology", label: "Electronics" },
        5: { pillar: "Home & Living", label: "Home Improvement" },
        6: { pillar: "Wellness & Fitness", label: "Fitness" },
        7: { pillar: "Food & Dining", label: "Delivery" },
        8: { pillar: "Technology", label: "Gaming" },
        9: { pillar: "Home & Living", label: "Moving" },
        10: { pillar: "Home & Living", label: "Real Estate" },
        11: { pillar: "Technology", label: "Smart Home" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Technology 28% · Dining 24% · Fitness 20% of wallet. Home Purchase pattern detected — earnest money + home improvement cluster.",
        txIndices: [4, 5, 8, 9, 10, 11],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["Best Buy 15% Off", "Peloton 3mo Free", "DoorDash Free Delivery", "PlayStation $50 Off"],
        txIndices: [0, 1, 2, 3, 6],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Event: Home Purchase detected. Recommend mortgage pre-approval + home insurance bundle.",
        txIndices: [5, 9, 10, 11],
      },
    },
  },
  // c3 — Family Planner
  {
    transactions: [
      { account: "••4821", merchant: "Home Depot", amount: "$157.00" },
      { account: "••9053", merchant: "Costco Wholesale", amount: "$299.00" },
      { account: "••7390", merchant: "Gibsons Steakhouse", amount: "$288.00" },
      { account: "••2156", merchant: "Crate and Barrel", amount: "$157.00" },
      { account: "••4821", merchant: "Target", amount: "$234.00" },
      { account: "••9053", merchant: "Kumon Tutoring", amount: "$180.00" },
      { account: "••7390", merchant: "Instacart", amount: "$87.00" },
      { account: "••2156", merchant: "Estate Attorney", amount: "$450.00" },
      { account: "••4821", merchant: "Sunrise Senior Living", amount: "$3,200.00" },
      { account: "••9053", merchant: "AARP Medicare", amount: "$189.00" },
      { account: "••7390", merchant: "Disney World", amount: "$1,245.00" },
      { account: "••2156", merchant: "Lowe's", amount: "$312.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Family Planner", "Home Investor", "Education Focused", "Multi-Generational Care"],
      signalMap: {
        0: { pillar: "Home & Living", label: "Home Improvement" },
        1: { pillar: "Shopping", label: "Wholesale" },
        2: { pillar: "Food & Dining", label: "Fine Dining" },
        3: { pillar: "Home & Living", label: "Furniture" },
        4: { pillar: "Shopping", label: "Retail" },
        5: { pillar: "Education", label: "Tutoring" },
        6: { pillar: "Food & Dining", label: "Grocery" },
        7: { pillar: "Financial Planning", label: "Estate" },
        8: { pillar: "Healthcare", label: "Senior Care" },
        9: { pillar: "Healthcare", label: "Medicare" },
        10: { pillar: "Travel & Transport", label: "Family Travel" },
        11: { pillar: "Home & Living", label: "Home Improvement" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Family 30% · Home 25% · Education 20% of wallet. Wealth Transfer and Elder Care patterns detected across 3 accounts.",
        txIndices: [0, 1, 3, 4, 11],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["Target 20% Back-to-School", "Lowe's 10% Off", "Kumon First Month Free", "Instacart 6mo Delivery"],
        txIndices: [2, 5, 6, 10],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Events: Wealth Transfer + Elder Care detected. Recommend trust documentation package + Medicare supplement advisory.",
        txIndices: [7, 8, 9],
      },
    },
  },
  // c4 — Golf & Leisure
  {
    transactions: [
      { account: "••6102", merchant: "United Airlines", amount: "$1,345.00" },
      { account: "••7745", merchant: "Yellowstone Lodge", amount: "$1,234.00" },
      { account: "••3318", merchant: "Kids Soccer League", amount: "$295.00" },
      { account: "••9901", merchant: "Safeway", amount: "$179.00" },
      { account: "••6102", merchant: "Callaway Golf", amount: "$890.00" },
      { account: "••7745", merchant: "Wine Access", amount: "$245.00" },
      { account: "••3318", merchant: "Hilton Honors", amount: "$892.00" },
      { account: "••9901", merchant: "OpenTable", amount: "$156.00" },
      { account: "••6102", merchant: "Retirement Calculator", amount: "$0.00" },
      { account: "••7745", merchant: "Schwab Rollover", amount: "$5,000.00" },
      { account: "••3318", merchant: "Travel Agency", amount: "$350.00" },
      { account: "••9901", merchant: "Estate Attorney", amount: "$600.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Golf Enthusiast", "Wine Connoisseur", "Travel Regular", "Pre-Retiree"],
      signalMap: {
        0: { pillar: "Travel & Transport", label: "Airlines" },
        1: { pillar: "Travel & Transport", label: "Hotels" },
        2: { pillar: "Family", label: "Kids Activities" },
        3: { pillar: "Food & Dining", label: "Grocery" },
        4: { pillar: "Sports & Leisure", label: "Golf" },
        5: { pillar: "Food & Dining", label: "Wine" },
        6: { pillar: "Travel & Transport", label: "Hotels" },
        7: { pillar: "Food & Dining", label: "Dining" },
        8: { pillar: "Financial Planning", label: "Retirement" },
        9: { pillar: "Financial Planning", label: "Investments" },
        10: { pillar: "Travel & Transport", label: "Travel Agency" },
        11: { pillar: "Financial Planning", label: "Estate" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Golf 32% · Dining 22% · Travel 20% of wallet. Retirement Planning pattern detected — consolidation signals across multiple accounts.",
        txIndices: [0, 1, 4, 5, 6],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["Callaway 20% Off Clubs", "Wine Access $50 Credit", "Hilton 80K Points", "OpenTable $25 Dining"],
        txIndices: [3, 7, 2, 10],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Event: Retirement Planning detected. Recommend wealth management upgrade + estate planning consultation.",
        txIndices: [8, 9, 11],
      },
    },
  },
  // c5 — Urban Professional
  {
    transactions: [
      { account: "••4821", merchant: "Equinox Gramercy", amount: "$245.00" },
      { account: "••9053", merchant: "SoulCycle Flatiron", amount: "$175.00" },
      { account: "••7390", merchant: "West Elm", amount: "$389.00" },
      { account: "••2156", merchant: "Whole Foods Union Sq", amount: "$125.00" },
      { account: "••4821", merchant: "Net-a-Porter", amount: "$780.00" },
      { account: "••9053", merchant: "Exhale Spa", amount: "$220.00" },
      { account: "••7390", merchant: "Lincoln Center", amount: "$350.00" },
      { account: "••2156", merchant: "529 Plan Research", amount: "$0.00" },
      { account: "••4821", merchant: "School Tour Fees", amount: "$150.00" },
      { account: "••9053", merchant: "MBA Program App", amount: "$250.00" },
      { account: "••7390", merchant: "Air France", amount: "$1,890.00" },
      { account: "••2156", merchant: "Michelin Restaurant", amount: "$340.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Urban Professional", "Fashion Forward", "Culture Lover", "Career Ambitious"],
      signalMap: {
        0: { pillar: "Wellness & Fitness", label: "Gym" },
        1: { pillar: "Wellness & Fitness", label: "Cycling" },
        2: { pillar: "Home & Living", label: "Furniture" },
        3: { pillar: "Food & Dining", label: "Grocery" },
        4: { pillar: "Shopping", label: "Fashion" },
        5: { pillar: "Wellness & Fitness", label: "Spa" },
        6: { pillar: "Entertainment", label: "Performing Arts" },
        7: { pillar: "Education", label: "529 Plan" },
        8: { pillar: "Education", label: "School" },
        9: { pillar: "Career & Education", label: "MBA" },
        10: { pillar: "Travel & Transport", label: "Airlines" },
        11: { pillar: "Food & Dining", label: "Fine Dining" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Dining 28% · Fashion 24% · Wellness 20% of wallet. Education Funding and Career Change signals detected.",
        txIndices: [0, 1, 4, 5, 6],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["Sweetgreen $5 Off", "Net-a-Porter 15% Off", "Exhale 30% First Visit", "Lincoln Center Pass"],
        txIndices: [3, 2, 10, 11],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Events: Education Funding + Career Change detected. Recommend 529 plan advisory + executive banking upgrade.",
        txIndices: [7, 8, 9],
      },
    },
  },
  // c6 — Adventurer & Investor
  {
    transactions: [
      { account: "••6102", merchant: "East Bank Club", amount: "$295.00" },
      { account: "••7745", merchant: "Tennis Pro Shop", amount: "$85.00" },
      { account: "••3318", merchant: "RPM Italian", amount: "$88.00" },
      { account: "••9901", merchant: "Lululemon Chicago", amount: "$156.00" },
      { account: "••6102", merchant: "Delta SkyMiles", amount: "$2,400.00" },
      { account: "••7745", merchant: "Charles Schwab", amount: "$5,000.00" },
      { account: "••3318", merchant: "OpenTable", amount: "$120.00" },
      { account: "••9901", merchant: "TaylorMade Golf", amount: "$890.00" },
      { account: "••6102", merchant: "401k Max Contrib", amount: "$23,000.00" },
      { account: "••7745", merchant: "AARP Enrollment", amount: "$16.00" },
      { account: "••3318", merchant: "Dynasty Trust Research", amount: "$0.00" },
      { account: "••9901", merchant: "Charitable Foundation", amount: "$10,000.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      pills: ["Adventurer", "Active Investor", "Tennis Player", "Philanthropist"],
      signalMap: {
        0: { pillar: "Wellness & Fitness", label: "Club" },
        1: { pillar: "Sports & Leisure", label: "Tennis" },
        2: { pillar: "Food & Dining", label: "Fine Dining" },
        3: { pillar: "Shopping", label: "Athleisure" },
        4: { pillar: "Travel & Transport", label: "Airlines" },
        5: { pillar: "Financial Planning", label: "Investments" },
        6: { pillar: "Food & Dining", label: "Dining" },
        7: { pillar: "Sports & Leisure", label: "Golf" },
        8: { pillar: "Financial Planning", label: "Retirement" },
        9: { pillar: "Financial Planning", label: "AARP" },
        10: { pillar: "Financial Planning", label: "Trust" },
        11: { pillar: "Financial Planning", label: "Philanthropy" },
      },
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Spend patterns reveal lifestyle segments",
        content: "Travel 30% · Investments 25% · Dining 18% of wallet. Retirement Planning at 91% confidence — max 401k + AARP signals.",
        txIndices: [0, 1, 4, 5, 7],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized deal matching",
        content: "",
        pills: ["Delta 100K Miles", "Schwab Free Consult", "OpenTable $50 Credit", "TaylorMade 25% Off"],
        txIndices: [2, 3, 6],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Life events & next-best-product",
        content: "Life Events: Retirement + Wealth Transfer detected. Recommend dynasty trust setup + charitable foundation advisory.",
        txIndices: [8, 9, 10, 11],
      },
    },
  },
];

export const getSourceColor = (transactions: Transaction[], account: string): string => {
  const uniqueAccounts = [...new Set(transactions.map((t) => t.account))];
  const idx = uniqueAccounts.indexOf(account);
  return SOURCE_COLORS[idx % SOURCE_COLORS.length];
};
