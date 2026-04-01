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

export interface CustomerProfile {
  name: string;
  age: number;
  family: string;
  location: string;
  income: string;
  transactions: Transaction[];
  persona: IntelCard;
  intelligence: {
    analytics: IntelCard;
    rewards: IntelCard;
    relationship: IntelCard;
  };
}

export const customers: CustomerProfile[] = [
  {
    name: "Michael R.",
    age: 42,
    family: "Family of 4",
    location: "Wellesley, MA",
    income: "High Income",
    transactions: [
      { account: "••4821", merchant: "Home Depot", amount: "$847.00" },
      { account: "••9053", merchant: "Vail Resorts", amount: "$3,200.00" },
      { account: "••7390", merchant: "Whole Foods", amount: "$187.40" },
      { account: "••2156", merchant: "Benjamin Moore", amount: "$234.00" },
      { account: "••4821", merchant: "Lowe's", amount: "$312.50" },
      { account: "••9053", merchant: "United Airlines", amount: "$1,890.00" },
      { account: "••7390", merchant: "Trader Joe's", amount: "$94.20" },
      { account: "••2156", merchant: "Houzz Pro", amount: "$89.00" },
      { account: "••4821", merchant: "Pottery Barn", amount: "$1,245.00" },
      { account: "••9053", merchant: "Delta Sky Club", amount: "$45.00" },
      { account: "••7390", merchant: "Blue Apron", amount: "$62.00" },
      { account: "••2156", merchant: "West Elm", amount: "$567.00" },
      { account: "••4821", merchant: "Restoration Hardware", amount: "$2,180.00" },
      { account: "••9053", merchant: "Marriott Bonvoy", amount: "$892.00" },
      { account: "••7390", merchant: "Peloton", amount: "$44.00" },
      { account: "••2156", merchant: "Crate & Barrel", amount: "$423.00" },
      { account: "••4821", merchant: "Ferguson", amount: "$489.00" },
      { account: "••4821", merchant: "Sherwin-Williams", amount: "$167.30" },
      { account: "••2156", merchant: "Ace Hardware", amount: "$78.50" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      content: "",
      pills: ["Urban Homeowner", "High-Spend Renovation", "Annual Ski Trips", "Health-Conscious"],
      txIndices: [],
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Premium Home Equity Line — renovation spend pattern detected across 6 transactions. Personalized pre-approval message ready.",
        txIndices: [0, 4, 8, 12, 16, 17],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Delta SkyMiles 3x", "Marriott Elite Match", "United Lounge Pass", "Vail Season Deal"],
        txIndices: [1, 5, 9, 13],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: Major Home Renovation detected from lifestyle shifts across 3 accounts. Sent meeting prep to wealth advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    },
  },
  {
    name: "Sarah & David L.",
    age: 34,
    family: "Growing Family",
    location: "Brooklyn, NY",
    income: "Upper-Middle Income",
    transactions: [
      { account: "••3347", merchant: "Buy Buy Baby", amount: "$234.00" },
      { account: "••8812", merchant: "Whole Foods", amount: "$203.00" },
      { account: "••5501", merchant: "Walgreens", amount: "$67.20" },
      { account: "••6274", merchant: "Babylist", amount: "$312.00" },
      { account: "••3347", merchant: "Amazon Baby Registry", amount: "$189.00" },
      { account: "••8812", merchant: "Instacart", amount: "$87.40" },
      { account: "••5501", merchant: "CVS", amount: "$45.80" },
      { account: "••6274", merchant: "Snoo Rental", amount: "$159.00" },
      { account: "••3347", merchant: "Pottery Barn Kids", amount: "$567.00" },
      { account: "••8812", merchant: "DoorDash", amount: "$142.00" },
      { account: "••5501", merchant: "Walgreens", amount: "$52.10" },
      { account: "••6274", merchant: "Owlet", amount: "$299.00" },
      { account: "••3347", merchant: "Hanna Andersson", amount: "$89.00" },
      { account: "••8812", merchant: "Sweetgreen", amount: "$34.00" },
      { account: "••5501", merchant: "One Medical", amount: "$250.00" },
      { account: "••6274", merchant: "Uppababy", amount: "$1,049.00" },
      { account: "••3347", merchant: "Carter's", amount: "$124.50" },
      { account: "••8812", merchant: "Blue Apron", amount: "$62.00" },
      { account: "••6274", merchant: "529 Plan Contrib", amount: "$500.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      content: "",
      pills: ["New Parent", "Nesting Phase", "Health-Focused", "Meal Delivery Reliant", "Financial Planner"],
      txIndices: [],
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Family Rewards Card — baby-related spend is 40% of wallet. Personalized upgrade offer queued.",
        txIndices: [0, 4, 8, 12, 16],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Whole Foods 5% Back", "Instacart Free Delivery", "DoorDash DashPass", "Blue Apron Family Plan"],
        txIndices: [1, 5, 9, 13, 17],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: New Baby detected from health and planning transactions. Family financial package sent to advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    },
  },
  {
    name: "Emily & James W.",
    age: 58,
    family: "Empty Nesters",
    location: "Scottsdale, AZ",
    income: "High Income",
    transactions: [
      { account: "••6102", merchant: "Fidelity Investments", amount: "$5,000.00" },
      { account: "••7745", merchant: "Four Seasons Resort", amount: "$4,850.00" },
      { account: "••3318", merchant: "Mayo Clinic", amount: "$450.00" },
      { account: "••9901", merchant: "Williams Sonoma", amount: "$345.00" },
      { account: "••6102", merchant: "Charles Schwab", amount: "$3,200.00" },
      { account: "••7745", merchant: "Napa Valley Wine Train", amount: "$680.00" },
      { account: "••3318", merchant: "Equinox", amount: "$220.00" },
      { account: "••9901", merchant: "Sur La Table", amount: "$189.00" },
      { account: "••6102", merchant: "Edward Jones", amount: "$2,750.00" },
      { account: "••7745", merchant: "Viking Cruises", amount: "$8,200.00" },
      { account: "••3318", merchant: "United Way", amount: "$1,000.00" },
      { account: "••9901", merchant: "MasterClass", amount: "$120.00" },
      { account: "••6102", merchant: "Vanguard", amount: "$4,500.00" },
      { account: "••7745", merchant: "Amex Travel", amount: "$1,950.00" },
      { account: "••3318", merchant: "Habitat for Humanity", amount: "$500.00" },
      { account: "••9901", merchant: "Audible", amount: "$14.95" },
      { account: "••6102", merchant: "Northwestern Mutual", amount: "$1,800.00" },
      { account: "••6102", merchant: "TIAA", amount: "$2,100.00" },
      { account: "••9901", merchant: "National Geographic", amount: "$39.00" },
    ],
    persona: {
      accent: "#a78bfa",
      icon: "◈",
      title: "Dynamic Persona",
      content: "",
      pills: ["Pre-Retiree", "Luxury Traveler", "Philanthropist", "Wellness Focused", "Lifelong Learner"],
      txIndices: [],
    },
    intelligence: {
      analytics: {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Wealth Management Upgrade — retirement consolidation pattern detected across 6 accounts. Personalized advisor introduction queued.",
        txIndices: [0, 4, 8, 12, 16, 17],
      },
      rewards: {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Four Seasons 5x Points", "Viking Cruises $500 Credit", "Napa Wine Club", "Amex Centurion Invite"],
        txIndices: [1, 5, 9, 13],
      },
      relationship: {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: Retirement Transition detected from financial consolidation and lifestyle shifts. Estate planning package sent to advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    },
  },
];

export const getSourceColor = (transactions: Transaction[], account: string): string => {
  const uniqueAccounts = [...new Set(transactions.map((t) => t.account))];
  const idx = uniqueAccounts.indexOf(account);
  return SOURCE_COLORS[idx % SOURCE_COLORS.length];
};
