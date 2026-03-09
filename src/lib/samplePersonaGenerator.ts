/**
 * Generates synthetic customer personas based on targeting criteria.
 * Used by PersonalizationPreviewPanel to demonstrate AI personalization.
 */

export type WealthTier = "Mass Market" | "Affluent" | "HNW";

export interface SyntheticPersona {
  id: string;
  name: string;
  avatarColor: string;
  emoji: string;
  behavioralTags: string[];
  transactionSignals: string[];
  tier?: WealthTier;
  recommendedProduct?: { id: string; name: string };
}

// Name pools for different personas
const FIRST_NAMES = [
  "Sarah", "James", "Priya", "Marcus", "Elena", "David", 
  "Mei", "Carlos", "Aisha", "Ryan", "Olivia", "Kenji"
];

const LAST_INITIALS = ["M.", "T.", "K.", "R.", "L.", "S.", "W.", "J.", "P.", "C."];

// Color palette for avatar backgrounds
const AVATAR_COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#ec4899", // pink
  "#06b6d4", // cyan
];

// Signal templates by pillar
const PILLAR_SIGNALS: Record<string, { tags: string[]; signals: string[]; emojis: string[] }> = {
  "Travel & Exploration": {
    tags: ["European Travel", "Hawaii Enthusiast", "Business Travel", "Adventure Seeker", "Luxury Traveler"],
    signals: [
      "4 Paris flights this year",
      "3 Honolulu trips in 18 months",
      "22 domestic flights this quarter",
      "Resort & family dining bookings",
      "12 international destinations",
      "Airport lounge visits weekly",
    ],
    emojis: ["🇫🇷", "🌺", "✈️", "🏝️", "🗺️"],
  },
  "Food & Dining": {
    tags: ["Fine Dining", "Foodie", "Restaurant Explorer", "Wine Enthusiast", "Local Cuisine"],
    signals: [
      "12 Michelin-rated restaurants",
      "Weekly fine dining transactions",
      "8 wine club memberships",
      "Farm-to-table preference detected",
      "International cuisine variety",
    ],
    emojis: ["🍷", "🍽️", "🥂", "🍴"],
  },
  "Health & Wellness": {
    tags: ["Wellness", "Fitness Focused", "Self-Care", "Spa Lover", "Mindfulness"],
    signals: [
      "Premium gym membership active",
      "Monthly spa & wellness visits",
      "Organic grocery preference",
      "Meditation app subscriptions",
      "Fitness equipment purchases",
    ],
    emojis: ["🧘", "💪", "🌿", "✨"],
  },
  "Sports & Active Living": {
    tags: ["Golf Enthusiast", "Ski Lover", "Marathon Runner", "Tennis Player", "Outdoor Adventure"],
    signals: [
      "8 golf course visits monthly",
      "Ski resort transactions detected",
      "Running gear purchases quarterly",
      "Sports equipment investments",
      "Fitness competition entries",
    ],
    emojis: ["⛳", "🎿", "🏃", "🎾", "🏔️"],
  },
  "Entertainment & Media": {
    tags: ["Concert Goer", "Theater Fan", "Streaming Enthusiast", "Gaming", "Live Events"],
    signals: [
      "12 concert tickets this year",
      "Broadway show spending detected",
      "Premium streaming subscriptions",
      "Gaming platform purchases",
      "Live event VIP access",
    ],
    emojis: ["🎵", "🎭", "🎬", "🎮"],
  },
  "Fashion & Beauty": {
    tags: ["Luxury Fashion", "Beauty Enthusiast", "Designer Brands", "Skincare Focus"],
    signals: [
      "Designer brand transactions",
      "Monthly beauty subscriptions",
      "Luxury department store visits",
      "Skincare product investments",
    ],
    emojis: ["👗", "💄", "✨", "👠"],
  },
  "Home & Garden": {
    tags: ["Home Improvement", "Interior Design", "Gardening", "Smart Home"],
    signals: [
      "Home improvement spending up 40%",
      "Furniture & decor purchases",
      "Garden center transactions",
      "Smart home device adoption",
    ],
    emojis: ["🏡", "🌱", "🛋️", "🔧"],
  },
  "Pets": {
    tags: ["Pet Parent", "Dog Lover", "Cat Owner", "Premium Pet Care"],
    signals: [
      "Monthly pet subscription boxes",
      "Veterinary care spending high",
      "Premium pet food purchases",
      "Pet grooming regular visits",
    ],
    emojis: ["🐕", "🐱", "🦮", "🐾"],
  },
  "Education & Learning": {
    tags: ["Lifelong Learner", "Professional Development", "Course Enthusiast"],
    signals: [
      "Online course subscriptions",
      "Professional certification spending",
      "Book purchases monthly",
      "Conference attendance detected",
    ],
    emojis: ["📚", "🎓", "💡", "🧠"],
  },
  "Family & Kids": {
    tags: ["Family Focused", "Parent", "Family Activities", "Kids Education"],
    signals: [
      "Family entertainment spending",
      "Kids activity subscriptions",
      "School supply purchases",
      "Family vacation bookings",
    ],
    emojis: ["👨‍👩‍👧", "🎠", "🎒", "🏖️"],
  },
  "Technology & Gaming": {
    tags: ["Tech Enthusiast", "Early Adopter", "Gamer", "Gadget Collector"],
    signals: [
      "Latest tech releases purchased",
      "Gaming platform subscriptions",
      "Electronics spending high",
      "App store purchases frequent",
    ],
    emojis: ["💻", "🎮", "📱", "🤖"],
  },
  "Financial & Aspirational": {
    tags: ["Investor", "Wealth Builder", "Luxury", "High Net Worth"],
    signals: [
      "Investment platform activity",
      "Financial advisory services",
      "Luxury goods purchases",
      "Premium service subscriptions",
    ],
    emojis: ["💎", "📈", "🏆", "💰"],
  },
};

// Life event signals
const LIFE_EVENT_SIGNALS: Record<string, { tags: string[]; signals: string[]; emojis: string[] }> = {
  retirement: {
    tags: ["Pre-Retiree", "Retirement Planning", "Golden Years"],
    signals: ["401k rollover activity", "Retirement community research", "Social Security planning"],
    emojis: ["🌅", "🏖️", "🎯"],
  },
  education: {
    tags: ["College Bound", "Student", "Parent of Student"],
    signals: ["College application fees", "529 plan contributions", "Student housing searches"],
    emojis: ["🎓", "📚", "🏫"],
  },
  family: {
    tags: ["New Parent", "Growing Family", "Family Expansion"],
    signals: ["Baby product purchases", "Family vehicle research", "Childcare payments"],
    emojis: ["👶", "🍼", "👨‍👩‍👧"],
  },
  home: {
    tags: ["Home Buyer", "Moving", "First-Time Buyer"],
    signals: ["Mortgage research detected", "Home inspection payments", "Moving company bookings"],
    emojis: ["🏠", "🔑", "📦"],
  },
  elder_care: {
    tags: ["Caregiver", "Elder Support", "Family Care"],
    signals: ["Healthcare spending increase", "Assisted living research", "Medical equipment purchases"],
    emojis: ["❤️", "🏥", "👴"],
  },
  business: {
    tags: ["Entrepreneur", "Business Owner", "Startup Founder"],
    signals: ["Business registration fees", "Commercial account activity", "Vendor payments initiated"],
    emojis: ["💼", "🚀", "📊"],
  },
  wealth_transfer: {
    tags: ["Estate Planning", "Legacy Building", "Generational Wealth"],
    signals: ["Estate attorney payments", "Trust account activity", "Large gift transfers"],
    emojis: ["🏛️", "📜", "💎"],
  },
};

// MECE wealth-tier product mapping per life event
interface TierConfig {
  tier: WealthTier;
  tierLabel: string;
  productId: string;
  productName: string;
  signals: string[];
}

export const LIFE_EVENT_PRODUCT_TIERS: Record<string, TierConfig[]> = {
  family: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "high_yield_savings", productName: "High-Yield Savings", signals: ["Baby product purchases", "Childcare payments"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "529_plan", productName: "529 Education Plan", signals: ["529 plan contributions", "Education savings research"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "trust_services", productName: "Trust & Estate Services", signals: ["Estate attorney consultations", "Trust account inquiries"] },
  ],
  retirement: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "wealth_suite", productName: "Wealth Management Suite", signals: ["401k rollover activity", "Retirement community research"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "annuity", productName: "Annuity Plan", signals: ["Annuity product research", "Fixed income investment activity"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "trust_services", productName: "Estate Transfer Services", signals: ["Estate attorney payments", "Large gift transfers"] },
  ],
  home: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "home_mortgage", productName: "Home Mortgage", signals: ["Mortgage research detected", "Home inspection payments"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "heloc", productName: "HELOC", signals: ["Home equity research", "Renovation contractor payments"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "jumbo_mortgage", productName: "Jumbo Mortgage", signals: ["Luxury property searches", "High-value home transactions"] },
  ],
  education: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "personal_loan", productName: "Student Loan", signals: ["College application fees", "Student housing searches"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "529_plan", productName: "529 Education Plan", signals: ["529 plan contributions", "Education savings research"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "education_trust", productName: "Education Trust", signals: ["Trust account activity", "Multi-generational education planning"] },
  ],
  elder_care: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "high_yield_savings", productName: "High-Yield Savings", signals: ["Healthcare spending increase", "Medical equipment purchases"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "personal_loan", productName: "Care Financing", signals: ["Assisted living research", "Long-term care insurance"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "trust_services", productName: "Family Trust", signals: ["Estate attorney payments", "Care facility endowments"] },
  ],
  business: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "personal_loan", productName: "Business Loan", signals: ["Business registration fees", "Vendor payments initiated"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "wealth_suite", productName: "Business Banking Suite", signals: ["Commercial account activity", "Payroll processing"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "trust_services", productName: "Business Trust", signals: ["Business valuation activity", "Succession planning"] },
  ],
  wealth_transfer: [
    { tier: "Mass Market", tierLabel: "Building Foundation", productId: "high_yield_savings", productName: "High-Yield Savings", signals: ["Savings account contributions", "Financial advisory services"] },
    { tier: "Affluent", tierLabel: "Growing Wealth", productId: "wealth_suite", productName: "Wealth Management Suite", signals: ["Investment platform activity", "Estate attorney payments"] },
    { tier: "HNW", tierLabel: "Legacy Planning", productId: "trust_services", productName: "Generational Trust", signals: ["Trust account activity", "Large gift transfers"] },
  ],
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(arr: T[], count: number = 1): T[] {
  return shuffleArray(arr).slice(0, count);
}

export function generateSamplePersonas(
  selectedPillars: string[],
  selectedLifeEvents: string[] = [],
  count: number = 3
): SyntheticPersona[] {
  const usedNames = new Set<string>();
  const personas: SyntheticPersona[] = [];

  const pillarSources = selectedPillars.filter(p => PILLAR_SIGNALS[p]);
  const eventSources = selectedLifeEvents.filter(e => LIFE_EVENT_SIGNALS[e]);

  // Determine primary source mode
  const mode: 'pillars' | 'events' | 'both' =
    pillarSources.length > 0 && eventSources.length > 0 ? 'both'
    : eventSources.length > 0 ? 'events'
    : 'pillars';

  // If pillars mode but none selected, fall back to first 3 pillar keys
  const effectivePillars = pillarSources.length > 0
    ? pillarSources
    : Object.keys(PILLAR_SIGNALS).slice(0, 3);

  // Get tier configs for life event mode
  const eventKey = eventSources.length > 0 ? eventSources[0] : null;
  const tierConfigs = eventKey ? LIFE_EVENT_PRODUCT_TIERS[eventKey] : null;

  for (let i = 0; i < count; i++) {
    let firstName: string;
    do {
      firstName = pickRandom(FIRST_NAMES, 1)[0];
    } while (usedNames.has(firstName) && usedNames.size < FIRST_NAMES.length);
    usedNames.add(firstName);

    const lastName = pickRandom(LAST_INITIALS, 1)[0];
    const name = `${firstName} ${lastName}`;
    const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];

    let behavioralTags: string[];
    let transactionSignals: string[];
    let emoji: string;
    let tier: WealthTier | undefined;
    let recommendedProduct: { id: string; name: string } | undefined;

    if (mode === 'events' && tierConfigs && tierConfigs[i]) {
      // Life events with MECE tier assignment
      const tc = tierConfigs[i];
      const eventData = LIFE_EVENT_SIGNALS[eventKey!];
      behavioralTags = [pickRandom(eventData.tags, 1)[0], tc.tierLabel];
      transactionSignals = tc.signals;
      emoji = pickRandom(eventData.emojis, 1)[0];
      tier = tc.tier;
      recommendedProduct = { id: tc.productId, name: tc.productName };
    } else if (mode === 'events') {
      // Fallback for events without tier config
      const ek = eventSources[i % eventSources.length];
      const eventData = LIFE_EVENT_SIGNALS[ek];
      behavioralTags = pickRandom(eventData.tags, 2);
      transactionSignals = pickRandom(eventData.signals, 2);
      emoji = pickRandom(eventData.emojis, 1)[0];
    } else if (mode === 'both') {
      const ek = eventSources[i % eventSources.length];
      const eventData = LIFE_EVENT_SIGNALS[ek];
      const pillarKey = effectivePillars[i % effectivePillars.length];
      const pillarData = PILLAR_SIGNALS[pillarKey];

      behavioralTags = [...pickRandom(eventData.tags, 1), ...pickRandom(pillarData.tags, 1)];
      transactionSignals = [...pickRandom(eventData.signals, 1), ...pickRandom(pillarData.signals, 1)];
      emoji = pickRandom(eventData.emojis, 1)[0];
    } else {
      const pillarKey = effectivePillars[i % effectivePillars.length];
      const pillarData = PILLAR_SIGNALS[pillarKey];
      behavioralTags = pickRandom(pillarData.tags, 2);
      transactionSignals = pickRandom(pillarData.signals, 2);
      emoji = pickRandom(pillarData.emojis, 1)[0];
    }

    personas.push({
      id: `persona_${i}_${Date.now()}`,
      name,
      avatarColor,
      emoji,
      behavioralTags: behavioralTags.slice(0, 2),
      transactionSignals: transactionSignals.slice(0, 2),
      tier,
      recommendedProduct,
    });
  }

  return personas;
}

// Products available for cross-sell demos
export const DEMO_PRODUCTS = [
  { id: "travel_card", name: "Travel Card", category: "credit_cards" },
  { id: "rewards_card", name: "Rewards Card", category: "credit_cards" },
  { id: "premium_card", name: "Premium Card", category: "credit_cards" },
  { id: "cashback_card", name: "Cashback Card", category: "credit_cards" },
  { id: "wealth_suite", name: "Wealth Management Suite", category: "investments" },
  { id: "high_yield_savings", name: "High-Yield Savings", category: "deposit_accounts" },
  { id: "home_mortgage", name: "Home Mortgage", category: "loans" },
  { id: "personal_loan", name: "Personal Loan", category: "loans" },
  { id: "529_plan", name: "529 Education Plan", category: "investments" },
  { id: "trust_services", name: "Trust & Estate Services", category: "wealth" },
  { id: "annuity", name: "Annuity Plan", category: "investments" },
  { id: "heloc", name: "HELOC", category: "loans" },
  { id: "jumbo_mortgage", name: "Jumbo Mortgage", category: "loans" },
  { id: "education_trust", name: "Education Trust", category: "wealth" },
];
