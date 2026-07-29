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
    id: "ny-shopping", city: "New York", state: "NY", title: "Saks Fifth Avenue Personal Shopper",
    tagline: "A curated luxury shopping experience",
    description: "Dedicated personal shopper at Saks Fifth Avenue flagship with private fitting rooms and champagne service.",
    category: "Shopping", tier: "Private", partner: "Saks Fifth Avenue", value: "$200 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.saksfifthavenue.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "ny-fitness", city: "New York", state: "NY", title: "Equinox Hudson Yards Access",
    tagline: "NYC's most exclusive fitness club",
    description: "Complimentary month at Equinox Hudson Yards with rooftop pool and spa access.",
    category: "Fitness", tier: "Private", partner: "Equinox", value: "$500 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.equinox.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "18+", customRules: "" }, active: true,
  },
  {
    id: "ny-travel", city: "New York", state: "NY", title: "JFK Private Terminal Access",
    tagline: "Skip the crowds at JFK",
    description: "Access to PS @ JFK private terminal for international departures with lounge, dining, and direct tarmac boarding.",
    category: "Travel", tier: "Premium", partner: "PS @ JFK", value: "$500/trip",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.thepsjfk.com",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "Minimum $10M AUM" }, active: true,
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
    id: "la-dining", city: "Los Angeles", state: "CA", title: "Nobu Malibu Priority Table",
    tagline: "Oceanfront dining, no wait",
    description: "Guaranteed same-week reservations at Nobu Malibu with complimentary omakase upgrade.",
    category: "Dining", tier: "Private", partner: "Nobu", value: "$100 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.noburestaurants.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "la-ent", city: "Los Angeles", state: "CA", title: "Hollywood Bowl Box Seats",
    tagline: "Music under the stars in LA",
    description: "Reserved garden box seats at the Hollywood Bowl for the full summer concert season.",
    category: "Entertainment", tier: "Premium", partner: "Hollywood Bowl", value: "$350/show",
    startDate: "2025-06-01", endDate: "2025-09-30", link: "https://www.hollywoodbowl.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "la-fitness", city: "Los Angeles", state: "CA", title: "Alo Yoga Studio Premium",
    tagline: "Wellness in Beverly Hills",
    description: "Unlimited access to Alo Yoga Beverly Hills studio with private sessions and retreat invitations.",
    category: "Fitness", tier: "Preferred", partner: "Alo Yoga", value: "$400 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.aloyoga.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "la-shopping", city: "Los Angeles", state: "CA", title: "Rodeo Drive Style Concierge",
    tagline: "Your personal Rodeo Drive guide",
    description: "Personal styling concierge along Rodeo Drive with VIP access to flagship stores and private showrooms.",
    category: "Shopping", tier: "Premium", partner: "Beverly Hills CVB", value: "$300 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.lovebeverlyhills.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "la-culture", city: "Los Angeles", state: "CA", title: "Getty Villa Private Tour",
    tagline: "Ancient treasures on the Pacific coast",
    description: "Private guided tour of the Getty Villa with curator commentary and garden reception.",
    category: "Culture", tier: "Private", partner: "Getty Villa", value: "Free entry",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.getty.edu",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "la-travel", city: "Los Angeles", state: "CA", title: "LAX Private Suite Terminal",
    tagline: "The celebrity way to fly from LA",
    description: "Access to the PS @ LAX private terminal with personal suite, tarmac transfer, and TSA pre-screening.",
    category: "Travel", tier: "Premium", partner: "PS @ LAX", value: "$475/trip",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.reserveps.com",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
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
    id: "chi-fitness", city: "Chicago", state: "IL", title: "East Bank Club VIP",
    tagline: "Chicago's premier athletic club",
    description: "Complimentary 3-month membership at East Bank Club with personal training and spa services.",
    category: "Fitness", tier: "Private", partner: "East Bank Club", value: "$750 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.eastbankclub.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "18+", customRules: "" }, active: true,
  },
  {
    id: "chi-shopping", city: "Chicago", state: "IL", title: "Magnificent Mile VIP Shopping",
    tagline: "Shop the Mile like a VIP",
    description: "Personal concierge shopping experience along the Magnificent Mile with exclusive store discounts.",
    category: "Shopping", tier: "Preferred", partner: "Magnificent Mile Association", value: "$150 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.themagnificentmile.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "chi-art", city: "Chicago", state: "IL", title: "Museum of Contemporary Art Preview",
    tagline: "See tomorrow's art today",
    description: "Invitation to exhibition previews at MCA Chicago with artist receptions and cocktails.",
    category: "Art", tier: "Private", partner: "MCA Chicago", value: "Free membership",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://mcachicago.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "chi-travel", city: "Chicago", state: "IL", title: "O'Hare United Polaris Lounge",
    tagline: "Luxury layovers at ORD",
    description: "Complimentary access to United Polaris Lounge at O'Hare with dining, showers, and day suites.",
    category: "Travel", tier: "Premium", partner: "United Airlines", value: "$150/visit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.united.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
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
    id: "mia-sports", city: "Miami", state: "FL", title: "Heat Courtside Experience",
    tagline: "Feel the heat courtside",
    description: "Courtside seats at Miami Heat games with access to the Bacardi Ocho Lounge and player tunnel.",
    category: "Sports", tier: "Premium", partner: "Miami Heat", value: "$600/game",
    startDate: "2025-10-01", endDate: "2026-04-15", link: "https://www.nba.com/heat",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "mia-art", city: "Miami", state: "FL", title: "Art Basel VIP Preview",
    tagline: "First access to the world's premier art fair",
    description: "VIP preview day access to Art Basel Miami Beach with private collector tours and gallery receptions.",
    category: "Art", tier: "Premium", partner: "Art Basel", value: "$1,000 value",
    startDate: "2025-12-01", endDate: "2025-12-07", link: "https://www.artbasel.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "mia-ent", city: "Miami", state: "FL", title: "LIV Nightclub VIP Table",
    tagline: "Miami's iconic nightlife experience",
    description: "Reserved VIP table at LIV nightclub at Fontainebleau with bottle service and priority entry.",
    category: "Entertainment", tier: "Premium", partner: "LIV Miami", value: "$500 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.livnightclub.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "mia-shopping", city: "Miami", state: "FL", title: "Design District Style Pass",
    tagline: "Luxury shopping in the Design District",
    description: "Personal shopper and VIP lounge access at Miami Design District's top luxury boutiques.",
    category: "Shopping", tier: "Private", partner: "Miami Design District", value: "$250 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.miamidesigndistrict.net",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "mia-culture", city: "Miami", state: "FL", title: "Pérez Art Museum Members Circle",
    tagline: "Contemporary art on Biscayne Bay",
    description: "Annual membership to PAMM's Collectors Circle with exhibition previews and waterfront receptions.",
    category: "Culture", tier: "Private", partner: "PAMM", value: "Free membership",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.pamm.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "mia-travel", city: "Miami", state: "FL", title: "MIA Centurion Lounge Access",
    tagline: "Travel in style from Miami",
    description: "Complimentary access to the Centurion Lounge at MIA with spa, dining, and premium cocktails.",
    category: "Travel", tier: "Preferred", partner: "American Express", value: "$75/visit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.americanexpress.com",
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
    id: "sf-dining", city: "San Francisco", state: "CA", title: "Atelier Crenn Tasting Menu",
    tagline: "Three Michelin stars, one unforgettable meal",
    description: "Priority reservations at Atelier Crenn with complimentary wine pairing and chef's table experience.",
    category: "Dining", tier: "Premium", partner: "Atelier Crenn", value: "$200 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.ateliercrenn.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "sf-fitness", city: "San Francisco", state: "CA", title: "Barry's Bootcamp Unlimited",
    tagline: "High-intensity fitness by the bay",
    description: "Complimentary 3-month unlimited membership at Barry's Bootcamp SF locations.",
    category: "Fitness", tier: "Preferred", partner: "Barry's", value: "$450 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.barrys.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "sf-culture", city: "San Francisco", state: "CA", title: "SF Opera Opening Night",
    tagline: "Black-tie elegance at the opera",
    description: "Opening night tickets at San Francisco Opera with pre-show gala dinner and backstage tour.",
    category: "Culture", tier: "Premium", partner: "SF Opera", value: "$500/show",
    startDate: "2025-09-01", endDate: "2026-06-30", link: "https://www.sfopera.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "sf-travel", city: "San Francisco", state: "CA", title: "SFO Polaris Lounge Pass",
    tagline: "Relax before you fly from SFO",
    description: "Complimentary United Polaris Lounge access at SFO with dining, showers, and rest suites.",
    category: "Travel", tier: "Private", partner: "United Airlines", value: "$125/visit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.united.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
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
  {
    id: "atx-culture", city: "Austin", state: "TX", title: "Paramount Theatre VIP",
    tagline: "Historic venue, front-row experience",
    description: "Reserved front-row seating at the Paramount Theatre for live shows and film premieres.",
    category: "Culture", tier: "Preferred", partner: "Paramount Theatre", value: "$125/show",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.austintheatre.org",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "atx-shopping", city: "Austin", state: "TX", title: "South Congress Style Pass",
    tagline: "Shop Austin's trendiest strip",
    description: "VIP access to boutique shopping events on South Congress with exclusive discounts and stylist consultations.",
    category: "Shopping", tier: "All Members", partner: "SoCo Merchants", value: "$100 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "atx-travel", city: "Austin", state: "TX", title: "AUS Airport Lounge Access",
    tagline: "Relax before your flight from Austin",
    description: "Complimentary access to the Centurion Lounge at Austin-Bergstrom with full dining and bar service.",
    category: "Travel", tier: "Private", partner: "American Express", value: "$75/visit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.americanexpress.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
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
