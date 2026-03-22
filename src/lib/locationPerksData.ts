import type { LucideIcon } from "lucide-react";
import {
  Ticket, Palette, UtensilsCrossed, Music, Landmark,
  ShoppingBag, Dumbbell, Plane,
} from "lucide-react";

export type PerkCategory = "Sports" | "Art" | "Dining" | "Entertainment" | "Culture" | "Shopping" | "Fitness" | "Travel";

export interface Eligibility {
  wealthTiers: string[];
  ageRestriction: string;
  customRules: string;
}

export interface LocationPerk {
  id: string;
  city: string;
  state: string;
  title: string;
  tagline: string;
  description: string;
  category: PerkCategory;
  tier: "All Members" | "Preferred" | "Private" | "Premium";
  partner: string;
  value: string;
  startDate: string;
  endDate: string;
  link: string;
  eligibility: Eligibility;
  active: boolean;
}

export const CATEGORY_CONFIG: Record<PerkCategory, { icon: LucideIcon; color: string }> = {
  Sports: { icon: Ticket, color: "text-green-600 bg-green-50 border-green-200" },
  Art: { icon: Palette, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  Dining: { icon: UtensilsCrossed, color: "text-orange-600 bg-orange-50 border-orange-200" },
  Entertainment: { icon: Music, color: "text-purple-600 bg-purple-50 border-purple-200" },
  Culture: { icon: Landmark, color: "text-blue-600 bg-blue-50 border-blue-200" },
  Shopping: { icon: ShoppingBag, color: "text-pink-600 bg-pink-50 border-pink-200" },
  Fitness: { icon: Dumbbell, color: "text-red-600 bg-red-50 border-red-200" },
  Travel: { icon: Plane, color: "text-sky-600 bg-sky-50 border-sky-200" },
};

export const TIER_COLORS: Record<string, string> = {
  "All Members": "bg-slate-100 text-slate-700",
  Preferred: "bg-blue-100 text-blue-700",
  Private: "bg-amber-100 text-amber-800",
  Premium: "bg-purple-100 text-purple-700",
};

const DEFAULT_ELIGIBILITY: Eligibility = { wealthTiers: ["All Clients"], ageRestriction: "No Restriction", customRules: "" };

export const INITIAL_PERKS: LocationPerk[] = [
  {
    id: "1", city: "New York", state: "NY", title: "Mets Home Game Access",
    tagline: "Front-row seats to every home game",
    description: "Complimentary tickets to any regular season Mets home game at Citi Field, including access to the Delta Sky360° Club.",
    category: "Sports", tier: "Premium", partner: "New York Mets", value: "$250/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/mets",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "2", city: "New York", state: "NY", title: "Le Bernardin Priority Reservations",
    tagline: "Skip the waitlist at NYC's finest",
    description: "Skip the waitlist with guaranteed same-week reservations at Le Bernardin, plus complimentary amuse-bouche.",
    category: "Dining", tier: "Private", partner: "Le Bernardin", value: "$75 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://le-bernardin.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "3", city: "New York", state: "NY", title: "Broadway Show Pre-Sale",
    tagline: "See the best shows before anyone else",
    description: "48-hour pre-sale access to top Broadway shows with up to 30% off premium seating.",
    category: "Entertainment", tier: "Preferred", partner: "Telecharge", value: "30% off",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.telecharge.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "ny-art", city: "New York", state: "NY", title: "MoMA Private Viewing",
    tagline: "After-hours access to world-class art",
    description: "Exclusive after-hours access to MoMA exhibitions with curator-led tours and complimentary cocktails.",
    category: "Art", tier: "Premium", partner: "MoMA", value: "Free entry",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.moma.org",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "ny-culture", city: "New York", state: "NY", title: "Met Opera Box Seats",
    tagline: "The finest seats in the house",
    description: "Reserved box seating at the Metropolitan Opera with pre-show champagne reception.",
    category: "Culture", tier: "Premium", partner: "Metropolitan Opera", value: "$400/show",
    startDate: "2025-09-01", endDate: "2026-05-31", link: "https://www.metopera.org",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "4", city: "Los Angeles", state: "CA", title: "Lakers Courtside Lounge",
    tagline: "The ultimate courtside experience",
    description: "Access to the exclusive courtside lounge during all Lakers home games with complimentary food and beverage.",
    category: "Sports", tier: "Premium", partner: "LA Lakers", value: "$500/game",
    startDate: "2025-10-01", endDate: "2026-04-15", link: "https://www.nba.com/lakers",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "Minimum $5M AUM" }, active: true,
  },
  {
    id: "5", city: "Los Angeles", state: "CA", title: "LACMA After-Hours Tour",
    tagline: "Exclusive curator-led art experiences",
    description: "Private after-hours access to LACMA exhibitions with guided tours by senior curators.",
    category: "Art", tier: "Private", partner: "LACMA", value: "Free entry",
    startDate: "2025-03-01", endDate: "2025-11-30", link: "https://www.lacma.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "6", city: "Chicago", state: "IL", title: "Art Institute After-Hours",
    tagline: "Chicago's art treasures, all to yourself",
    description: "Exclusive after-hours access to the Art Institute of Chicago with guided curator tours.",
    category: "Culture", tier: "Preferred", partner: "Art Institute of Chicago", value: "Free entry",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.artic.edu",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "7", city: "Chicago", state: "IL", title: "Cubs Wrigley Field Suite",
    tagline: "Private suite with legendary Wrigley views",
    description: "Private suite access for Cubs home games at Wrigley Field, including catering for up to 8 guests.",
    category: "Sports", tier: "Premium", partner: "Chicago Cubs", value: "$1,200/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/cubs",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "chi-ent", city: "Chicago", state: "IL", title: "Chicago Symphony VIP",
    tagline: "World-class music in the Windy City",
    description: "Premium seating at the Chicago Symphony Orchestra with backstage meet-and-greets and pre-concert receptions.",
    category: "Entertainment", tier: "Private", partner: "CSO", value: "$175/show",
    startDate: "2025-09-01", endDate: "2026-06-30", link: "https://cso.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "chi-dining", city: "Chicago", state: "IL", title: "Alinea Tasting Priority",
    tagline: "Molecular gastronomy at its finest",
    description: "Priority reservations at Alinea with complimentary wine pairing upgrade.",
    category: "Dining", tier: "Premium", partner: "Alinea", value: "$150 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.alinearestaurant.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "8", city: "Miami", state: "FL", title: "Equinox Premium Membership",
    tagline: "Elevate your fitness in paradise",
    description: "Complimentary 3-month Equinox membership at any Miami location with personal training sessions.",
    category: "Fitness", tier: "Private", partner: "Equinox", value: "$900 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.equinox.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "18+", customRules: "" }, active: true,
  },
  {
    id: "9", city: "Miami", state: "FL", title: "South Beach Food Tour",
    tagline: "Taste the best of South Beach",
    description: "Guided culinary experience through South Beach's top restaurants with exclusive tasting menus.",
    category: "Dining", tier: "All Members", partner: "Miami Culinary Tours", value: "50% off",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "10", city: "San Francisco", state: "CA", title: "Giants Oracle Park Experience",
    tagline: "VIP treatment at the ballpark",
    description: "VIP pre-game batting practice viewing and exclusive clubhouse-level seating.",
    category: "Sports", tier: "Preferred", partner: "SF Giants", value: "$175/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/giants",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "11", city: "San Francisco", state: "CA", title: "Ferry Building Tasting Pass",
    tagline: "Artisan flavors by the bay",
    description: "All-access tasting pass at Ferry Building Marketplace artisan vendors, refreshed monthly.",
    category: "Shopping", tier: "All Members", partner: "Ferry Building Marketplace", value: "$50 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.ferrybuildingmarketplace.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "sf-art", city: "San Francisco", state: "CA", title: "SFMOMA Curator's Circle",
    tagline: "Behind the scenes at SFMOMA",
    description: "Annual membership to SFMOMA's Curator's Circle with private previews and studio visits.",
    category: "Art", tier: "Private", partner: "SFMOMA", value: "Free membership",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.sfmoma.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "sf-ent", city: "San Francisco", state: "CA", title: "Outside Lands VIP",
    tagline: "San Francisco's premiere music festival",
    description: "VIP passes to Outside Lands Music Festival with backstage lounge access and premium viewing areas.",
    category: "Entertainment", tier: "Premium", partner: "Outside Lands", value: "$650 value",
    startDate: "2025-08-08", endDate: "2025-08-10", link: "https://www.sfoutsidelands.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "12", city: "Austin", state: "TX", title: "ACL Festival VIP Pass",
    tagline: "Backstage at Austin's biggest festival",
    description: "VIP weekend passes to Austin City Limits Music Festival with backstage meet-and-greets.",
    category: "Entertainment", tier: "Premium", partner: "ACL Festival", value: "$800 value",
    startDate: "2025-10-03", endDate: "2025-10-12", link: "https://www.aclfestival.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "atx-dining", city: "Austin", state: "TX", title: "Franklin BBQ Priority Line",
    tagline: "Skip the legendary 3-hour line",
    description: "Priority access at Franklin Barbecue — no wait, guaranteed seating with a complimentary sides sampler.",
    category: "Dining", tier: "Preferred", partner: "Franklin Barbecue", value: "Priority access",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://franklinbbq.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "atx-art", city: "Austin", state: "TX", title: "Blanton Museum Private Tours",
    tagline: "Austin's finest art collection, privately",
    description: "Private guided tours of the Blanton Museum of Art with curator commentary and post-tour reception.",
    category: "Art", tier: "Private", partner: "Blanton Museum", value: "Free entry",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://blantonmuseum.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "atx-sports", city: "Austin", state: "TX", title: "UT Longhorns Suite Access",
    tagline: "Hook 'em from the best seats",
    description: "Private suite access for UT Longhorns football games at DKR Stadium with catering for up to 6.",
    category: "Sports", tier: "Premium", partner: "UT Athletics", value: "$950/game",
    startDate: "2025-09-01", endDate: "2025-11-30", link: "https://texassports.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "atx-fitness", city: "Austin", state: "TX", title: "Castle Hill Fitness Premium",
    tagline: "Austin's boutique wellness destination",
    description: "Complimentary 3-month membership at Castle Hill Fitness with personal training and spa credits.",
    category: "Fitness", tier: "Private", partner: "Castle Hill Fitness", value: "$600 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.castlehillfitness.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "18+", customRules: "" }, active: true,
  },
];

/** Map zip code prefix to city name */
export const ZIP_TO_CITY: Record<string, string> = {
  "941": "San Francisco",
  "787": "Austin",
  "606": "Chicago",
  "100": "New York",
  "331": "Miami",
  "900": "Los Angeles",
};

export function getCityFromZip(zip: string): string {
  const prefix = zip.slice(0, 3);
  return ZIP_TO_CITY[prefix] || "New York";
}

export function getPerksForCity(city: string): LocationPerk[] {
  return INITIAL_PERKS.filter(p => p.city === city && p.active);
}
