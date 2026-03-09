/**
 * Generates synthetic customer personas based on targeting criteria.
 * Used by PersonalizationPreviewPanel to demonstrate AI personalization.
 */

export interface SyntheticPersona {
  id: string;
  name: string;
  avatarColor: string;
  emoji: string;
  behavioralTags: string[];
  transactionSignals: string[];
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

  // Combine all available signal sources
  const pillarSources = selectedPillars.length > 0 
    ? selectedPillars.filter(p => PILLAR_SIGNALS[p])
    : Object.keys(PILLAR_SIGNALS).slice(0, 3);
  
  const eventSources = selectedLifeEvents.length > 0
    ? selectedLifeEvents.filter(e => LIFE_EVENT_SIGNALS[e])
    : [];

  for (let i = 0; i < count; i++) {
    // Generate unique name
    let firstName: string;
    do {
      firstName = pickRandom(FIRST_NAMES, 1)[0];
    } while (usedNames.has(firstName) && usedNames.size < FIRST_NAMES.length);
    usedNames.add(firstName);
    
    const lastName = pickRandom(LAST_INITIALS, 1)[0];
    const name = `${firstName} ${lastName}`;
    const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];

    // Select which sources to use for this persona
    const personaPillar = pillarSources[i % pillarSources.length] || pillarSources[0];
    const pillarData = PILLAR_SIGNALS[personaPillar] || PILLAR_SIGNALS["Travel & Exploration"];
    
    // Get tags and signals
    const behavioralTags = pickRandom(pillarData.tags, 2);
    const transactionSignals = pickRandom(pillarData.signals, 2);
    const emoji = pickRandom(pillarData.emojis, 1)[0];

    // Mix in life event signals if available
    if (eventSources.length > 0 && i < eventSources.length) {
      const eventData = LIFE_EVENT_SIGNALS[eventSources[i]];
      if (eventData) {
        behavioralTags.push(pickRandom(eventData.tags, 1)[0]);
        transactionSignals.push(pickRandom(eventData.signals, 1)[0]);
      }
    }

    personas.push({
      id: `persona_${i}_${Date.now()}`,
      name,
      avatarColor,
      emoji,
      behavioralTags: behavioralTags.slice(0, 2),
      transactionSignals: transactionSignals.slice(0, 2),
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
];
