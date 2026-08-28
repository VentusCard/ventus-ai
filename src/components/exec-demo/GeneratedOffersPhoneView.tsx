import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Search, X, Loader2, TrendingUp, Clock, Star, MapPin } from "lucide-react";
import type { RollupOfferGroup } from "./NextOfferRationale";
import { getColor } from "./ExecDemoIntelPanel";
import { useSemanticDealSearch } from "@/hooks/useSemanticDealSearch";
import { availableDeals as AVAILABLE_DEALS } from "@/lib/availableDealsData";

// ── Merchant lookup: dealId → merchant name (mirrors edge function catalog) ──
const MERCHANT_LOOKUP: Record<string, string> = {
  "deal-1":"Starbucks","deal-2":"Chipotle","deal-3":"DoorDash","deal-4":"Uber Eats","deal-5":"McDonald's",
  "deal-6":"Panera Bread","deal-7":"Chick-fil-A","deal-8":"Dunkin'","deal-9":"Subway","deal-10":"Grubhub",
  "deal-11":"Olive Garden","deal-12":"Applebees","deal-13":"Buffalo Wild Wings","deal-14":"Taco Bell",
  "deal-15":"Wendy's","deal-16":"Dominos","deal-17":"Pizza Hut","deal-18":"Sweetgreen","deal-19":"Shake Shack",
  "deal-20":"Noodles & Company","deal-21":"Five Guys","deal-22":"Instacart","deal-23":"Whole Foods",
  "deal-24":"Trader Joes","deal-25":"HelloFresh","deal-26":"Delta Airlines","deal-27":"United Airlines",
  "deal-28":"American Airlines","deal-29":"Southwest Airlines","deal-30":"Marriott","deal-31":"Hilton",
  "deal-32":"Hyatt","deal-33":"Airbnb","deal-34":"VRBO","deal-35":"Hertz","deal-36":"Enterprise",
  "deal-37":"Expedia","deal-38":"Booking.com","deal-39":"Kayak","deal-40":"Uber","deal-41":"Lyft",
  "deal-42":"Carnival Cruise","deal-43":"Royal Caribbean","deal-44":"TSA PreCheck","deal-45":"Global Entry",
  "deal-46":"Sephora","deal-47":"ULTA","deal-48":"Nordstrom","deal-49":"Nike","deal-50":"Lululemon",
  "deal-51":"H&M","deal-52":"Zara","deal-53":"Foot Locker","deal-54":"Adidas","deal-55":"Gap",
  "deal-56":"Old Navy","deal-57":"Macys","deal-58":"Bloomingdales","deal-59":"Anthropologie",
  "deal-60":"Urban Outfitters","deal-61":"Glossier","deal-62":"Warby Parker","deal-63":"Ray-Ban",
  "deal-64":"Home Depot","deal-65":"Lowes","deal-66":"Wayfair","deal-67":"IKEA","deal-68":"Bed Bath & Beyond",
  "deal-69":"Williams-Sonoma","deal-70":"Crate & Barrel","deal-71":"West Elm","deal-72":"Pottery Barn",
  "deal-73":"Restoration Hardware","deal-74":"Overstock","deal-75":"Ace Hardware","deal-76":"Sherwin-Williams",
  "deal-77":"Casper","deal-78":"Purple","deal-79":"Dyson","deal-80":"Spotify","deal-81":"Netflix",
  "deal-82":"Disney+","deal-83":"Hulu","deal-84":"HBO Max","deal-85":"AMC Theatres","deal-86":"Regal Cinemas",
  "deal-87":"Ticketmaster","deal-88":"StubHub","deal-89":"Audible","deal-90":"Apple Music",
  "deal-91":"YouTube Premium","deal-92":"Barnes & Noble","deal-93":"GameStop","deal-94":"PlayStation Store",
  "deal-95":"Xbox Store","deal-96":"Equinox","deal-97":"Planet Fitness","deal-98":"CVS","deal-99":"Walgreens",
  "deal-100":"Peloton","deal-101":"GNC","deal-102":"Vitamin Shoppe","deal-103":"Orangetheory",
  "deal-104":"SoulCycle","deal-105":"Calm","deal-106":"Headspace","deal-107":"Massage Envy",
  "deal-108":"Rite Aid","deal-109":"1-800 Contacts","deal-110":"Noom","deal-111":"ClassPass",
  "deal-112":"Fitbit","deal-113":"Whoop","deal-114":"Dick's Sporting Goods","deal-115":"REI",
  "deal-116":"Golf Galaxy","deal-117":"Callaway Golf","deal-118":"TaylorMade","deal-119":"Academy Sports",
  "deal-120":"Fanatics","deal-121":"NFL Shop","deal-122":"NBA Store","deal-123":"MLB Shop",
  "deal-124":"Patagonia","deal-125":"The North Face","deal-126":"Columbia Sportswear",
  "deal-127":"Under Armour","deal-128":"Yeti","deal-129":"Backcountry","deal-130":"Scheels",
  "deal-131":"Bass Pro Shops","deal-132":"Apple","deal-133":"Best Buy","deal-134":"Amazon",
  "deal-135":"Samsung","deal-136":"Microsoft","deal-137":"Dell","deal-138":"HP","deal-139":"Bose",
  "deal-140":"Sonos","deal-141":"Sony","deal-142":"Logitech","deal-143":"B&H Photo","deal-144":"Newegg",
  "deal-145":"Adobe","deal-146":"Dropbox","deal-147":"AT&T","deal-148":"Verizon","deal-149":"T-Mobile",
  "deal-150":"Target","deal-151":"Walmart","deal-152":"Costco","deal-153":"Sam's Club",
  "deal-154":"BuyBuy Baby","deal-155":"Carter's","deal-156":"Gap Kids","deal-157":"The Childrens Place",
  "deal-158":"LEGO","deal-159":"Disney Store","deal-160":"Build-A-Bear","deal-161":"Pottery Barn Kids",
  "deal-162":"American Girl","deal-163":"Party City","deal-164":"Hallmark","deal-165":"1-800-Flowers",
  "deal-166":"Chewy","deal-167":"PetSmart","deal-168":"Petco","deal-169":"BarkBox","deal-170":"Rover",
  "deal-171":"Wag","deal-172":"Wisdom Panel","deal-173":"Embark","deal-174":"Furbo","deal-175":"Fi Collar",
  "deal-176":"Nom Nom","deal-177":"The Farmer's Dog","deal-178":"Petplan","deal-179":"Healthy Paws",
  "deal-180":"Wild One","deal-181":"TurboTax","deal-182":"H&R Block","deal-183":"Credit Karma",
  "deal-184":"Personal Capital","deal-185":"Mint","deal-186":"Acorns","deal-187":"Robinhood",
  "deal-188":"Wealthfront","deal-189":"LegalZoom","deal-190":"LifeLock","deal-191":"Shell",
  "deal-192":"Exxon Mobil","deal-193":"BP","deal-194":"Chevron","deal-195":"AutoZone",
  "deal-196":"O'Reilly Auto Parts","deal-197":"Advance Auto Parts","deal-198":"Jiffy Lube",
  "deal-199":"Firestone","deal-200":"Discount Tire",
};

// Curated image bank — keys must match the imageCategory enum returned by generate-next-offers.
// LLM picks the closest category from the rollup label; we hand-pick a vetted Unsplash photo per key.
const COLLECTION_IMAGE_BANK: Record<string, string> = {
  ski: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&h=200&fit=crop",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop",
  tennis: "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=400&h=200&fit=crop",
  golf: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop",
  cycling: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=200&fit=crop",
  running: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&h=200&fit=crop",
  yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=200&fit=crop",
  hiking: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=200&fit=crop",
  camping: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=200&fit=crop",
  boating: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=400&h=200&fit=crop",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=200&fit=crop",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop",
  dining: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
  wedding: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=200&fit=crop",
  baby: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=200&fit=crop",
  kids: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=200&fit=crop",
  pet: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop",
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop",
  wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
  home: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=200&fit=crop",
  garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop",
  auto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop",
  "travel-urban": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=200&fit=crop",
  "travel-generic": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop",
  finance: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
  entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop";

// Aliases for categories the prompts can emit that aren't literal bank keys.
const CATEGORY_ALIASES: Record<string, string> = {
  travel: "travel-generic", flight: "travel-generic", flights: "travel-generic",
  hotel: "travel-urban", city: "travel-urban", urban: "travel-urban",
  fitness: "running", gym: "running", sports: "running", outdoors: "hiking",
  food: "dining", restaurant: "dining", groceries: "grocery",
  shopping: "fashion", apparel: "fashion", style: "fashion",
  electronics: "tech", gaming: "tech", music: "entertainment", movies: "entertainment",
  health: "wellness", spa: "wellness", selfcare: "wellness",
  family: "kids", school: "kids", education: "kids", college: "kids",
  house: "home", moving: "home", renovation: "home", furniture: "home",
  car: "auto", vehicle: "auto", banking: "finance", money: "finance", investing: "finance",
};

// Keyword → bank key, used when the model returns "other"/unknown and only an imageQuery.
const KEYWORD_MAP: [RegExp, string][] = [
  [/\b(ski|snowboard|slope|alpine|snow)\b/, "ski"],
  [/\b(beach|ocean|surf|coast|island|resort)\b/, "beach"],
  [/\b(tennis|pickleball|racquet|court|padel)\b/, "tennis"],
  [/\b(golf|fairway|putting|caddie)\b/, "golf"],
  [/\b(bike|biking|cycl|peloton)\b/, "cycling"],
  [/\b(run|running|marathon|jog|track|sneaker)\b/, "running"],
  [/\b(yoga|pilates|meditat|stretch|studio)\b/, "yoga"],
  [/\b(hike|hiking|trail|climb|climbing|mountain|backpack)\b/, "hiking"],
  [/\b(camp|camping|tent|campfire|rv)\b/, "camping"],
  [/\b(boat|sail|marina|kayak|yacht|paddle)\b/, "boating"],
  [/\b(wine|vineyard|winery|sommelier|cocktail|brewery|beer)\b/, "wine"],
  [/\b(coffee|espresso|cafe|barista|latte)\b/, "coffee"],
  [/\b(dining|restaurant|dinner|chef|meal|food|kitchen|cook)\b/, "dining"],
  [/\b(wedding|bride|engagement|bridal|marriage)\b/, "wedding"],
  [/\b(baby|newborn|nursery|infant|stroller|maternity)\b/, "baby"],
  [/\b(kid|kids|child|children|school|classroom|college|dorm|student|toy)\b/, "kids"],
  [/\b(pet|dog|cat|puppy|veterinar)\b/, "pet"],
  [/\b(fashion|apparel|clothing|boutique|wardrobe|shoe|handbag|style)\b/, "fashion"],
  [/\b(beauty|cosmetic|makeup|skincare|salon|hair)\b/, "beauty"],
  [/\b(wellness|spa|massage|therapy|mindful|health)\b/, "wellness"],
  [/\b(tech|laptop|gadget|device|headphone|computer|gaming|console|smart)\b/, "tech"],
  [/\b(home|house|apartment|furniture|interior|renovat|mov(e|ing)|decor|mortgage)\b/, "home"],
  [/\b(garden|plant|yard|landscap|patio|outdoor furniture)\b/, "garden"],
  [/\b(car|auto|vehicle|driving|tire|garage|ev charging)\b/, "auto"],
  [/\b(city|urban|skyline|downtown|hotel|metro)\b/, "travel-urban"],
  [/\b(travel|flight|airport|airline|passport|vacation|trip|luggage|getaway)\b/, "travel-generic"],
  [/\b(finance|bank|loan|credit|savings|invest|refinanc|payment|apr)\b/, "finance"],
  [/\b(concert|festival|music|movie|cinema|streaming|show|entertain|event|ticket)\b/, "entertainment"],
  [/\b(grocery|groceries|supermarket|produce|pantry)\b/, "grocery"],
];

function resolveFromText(text: string): string | null {
  const t = text.toLowerCase();
  for (const [re, key] of KEYWORD_MAP) {
    if (re.test(t)) return COLLECTION_IMAGE_BANK[key];
  }
  return null;
}

function getCollectionImage(
  group: { imageCategory?: string; imageQuery?: string; rollup?: string; pillar?: string } | null | undefined
): string {
  if (!group) return DEFAULT_IMAGE;

  const rawCat = (group.imageCategory || "").toLowerCase().trim();
  if (rawCat && rawCat !== "other") {
    const key = COLLECTION_IMAGE_BANK[rawCat] ? rawCat : CATEGORY_ALIASES[rawCat];
    if (key && COLLECTION_IMAGE_BANK[key]) return COLLECTION_IMAGE_BANK[key];
  }

  // Keyword resolution against the query, then the rollup label.
  const fromQuery = group.imageQuery ? resolveFromText(group.imageQuery) : null;
  if (fromQuery) return fromQuery;
  const fromLabel = group.rollup ? resolveFromText(group.rollup) : null;
  if (fromLabel) return fromLabel;

  // Pillar-based default.
  const pillar = (group.pillar || "").toLowerCase();
  if (pillar.includes("life event")) return COLLECTION_IMAGE_BANK.home;
  if (pillar.includes("financial")) return COLLECTION_IMAGE_BANK.finance;
  return DEFAULT_IMAGE;
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src === DEFAULT_IMAGE) return;
  img.src = DEFAULT_IMAGE;
}


interface Props {
  offerGroups: RollupOfferGroup[];
  customerName: string;
  focusMode?: boolean;
  activeRollupLabel?: string | null;
  activeRollupPillar?: string | null;
}

// ── Fuzzy-match helpers (mirrors NextOfferRationale) ──
const STOPWORDS = new Set(["the","a","an","of","for","to","and","in","on","at","with","new","my","your"]);
const normLabel = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokenizeLabel = (s: string) => normLabel(s).split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));

export function findGroupForLabel(label: string, pillar: string | null | undefined, groups: RollupOfferGroup[]): RollupOfferGroup | null {
  const scoped = !pillar
    ? groups
    : groups.filter(g => pillar === "Life Event" ? g.pillar === "Life Event" : g.pillar !== "Life Event");
  const target = normLabel(label);
  const targetTokens = new Set(tokenizeLabel(label));
  // 1. exact
  let hit = scoped.find(g => normLabel(g.rollup) === target);
  if (hit) return hit;
  // 2. substring
  hit = scoped.find(g => {
    const r = normLabel(g.rollup);
    return r.includes(target) || target.includes(r);
  });
  if (hit) return hit;
  // 3. token overlap
  hit = scoped.find(g => tokenizeLabel(g.rollup).some(t => targetTokens.has(t)));
  return hit || null;
}

export default function GeneratedOffersPhoneView({ offerGroups, customerName, focusMode = true, activeRollupLabel, activeRollupPillar }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [expandedGroup, setExpandedGroup] = useState<RollupOfferGroup | null>(null);

  const firstName = customerName.split(" ")[0];

  // Sync expandedGroup with active persona pill selection
  useEffect(() => {
    if (!activeRollupLabel) {
      setExpandedGroup(null);
      return;
    }
    const matched = findGroupForLabel(activeRollupLabel, activeRollupPillar, offerGroups);
    setExpandedGroup(matched);
  }, [activeRollupLabel, activeRollupPillar, offerGroups]);

  // Semantic search
  const { searchQuery, isSearching, handleSearchChange, clearSearch, matchingDealIds, searchReasoning } = useSemanticDealSearch();

  // Bridge: convert matching deal IDs → merchant names
  const matchingMerchants = useMemo(() => {
    if (!searchQuery.trim() || matchingDealIds.length === 0) return null;
    const set = new Set<string>();
    for (const id of matchingDealIds) {
      const m = MERCHANT_LOOKUP[id];
      if (m) set.add(m.toLowerCase());
    }
    return set;
  }, [matchingDealIds, searchQuery]);

  const catalogSearchDeals = useMemo(() => {
    if (!searchQuery.trim() || matchingDealIds.length === 0) return [];
    const dealById = new Map(AVAILABLE_DEALS.map(deal => [deal.id, deal]));
    return matchingDealIds
      .map(id => dealById.get(id))
      .filter((deal): deal is NonNullable<typeof deal> => Boolean(deal))
      .slice(0, 12);
  }, [matchingDealIds, searchQuery]);

  // Filter groups based on search
  const allGroups = useMemo(() => {
    const base = offerGroups.filter(g => g.deals.filter(d => d.signal !== "suppress").length > 0);
    if (!matchingMerchants) return base;
    return base
      .map(g => ({
        ...g,
        deals: g.deals.filter(d => d.signal !== "suppress" && matchingMerchants.has(d.merchant.toLowerCase())),
      }))
      .filter(g => g.deals.length > 0);
  }, [offerGroups, matchingMerchants]);

  const isSearchActive = searchQuery.trim().length > 0;

  useEffect(() => {
    if (isSearchActive && expandedGroup) {
      setExpandedGroup(null);
    }
  }, [isSearchActive, expandedGroup]);

  const searchFooter = (
    <div className="shrink-0 px-3 py-2 border-t border-slate-100 bg-white space-y-1.5">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search deals..."
          className="w-full pl-6 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
        />
        {isSearching && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-400 animate-spin" />
        )}
        {!isSearching && searchQuery && (
          <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>
    </div>

  );

  // Stable savings number
  const yearlySavings = (offerGroups.length * 145) + (firstName.length * 12);

  // Top pick: first deal from first group
  const topPick = useMemo(() => {
    if (allGroups.length === 0) return null;
    const g = allGroups[0];
    const deals = g.deals.filter(d => d.signal !== "suppress");
    if (deals.length === 0) return null;
    return { deal: deals[0], group: g };
  }, [allGroups]);

  // Expiring soon: 2-3 deals from the last group
  const expiringSoon = useMemo(() => {
    if (allGroups.length < 2) return [];
    const g = allGroups[allGroups.length - 1];
    const deals = g.deals.filter(d => d.signal !== "suppress").slice(0, 3);
    const hours = [4, 12, 23];
    return deals.map((d, i) => ({ ...d, hoursLeft: hours[i] || 8, pillar: g.pillar }));
  }, [allGroups]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    if (allGroups.length <= 1 || expandedGroup || isSearchActive) return;
    const timer = setInterval(() => {
      setDirection("right");
      setCurrent(prev => (prev + 1) % allGroups.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [allGroups.length, expandedGroup, isSearchActive]);

  if (offerGroups.length === 0) return null;

  // ── Deal Detail View ──
  if (expandedGroup && !isSearchActive) {
    const deals = expandedGroup.deals.filter(d => d.signal !== "suppress");
    const imgSrc = getCollectionImage(expandedGroup);
    const c = getColor(expandedGroup.pillar || "");

    return (
      <div className="px-0 py-0 flex flex-col h-full" style={{ animation: "detail-slide-in 0.25s ease-out" }}>
        <button
          onClick={() => setExpandedGroup(null)}
          className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[11px] font-medium">Back</span>
        </button>

        <div className="h-[90px] w-full overflow-hidden">
          <img src={imgSrc} alt="" className="w-full h-full object-cover" onError={handleImageError} />
        </div>

        <div className="px-3 pt-2.5 pb-1">
          {expandedGroup.collectionMessage && (
            <p className="text-[13px] font-bold text-slate-800 leading-snug">{expandedGroup.collectionMessage}</p>
          )}
          <p className="text-[10px] text-slate-500 mt-0.5">{deals.length} offer{deals.length !== 1 ? "s" : ""} available</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2" style={{ scrollbarWidth: "none" }}>
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-slate-100 bg-white p-3 flex items-stretch justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 leading-snug">{deal.merchant}</p>
                {deal.product && <p className="text-[11px] text-slate-500 leading-snug">{deal.product}</p>}
                {deal.message && <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">{deal.message}</p>}
              </div>
              <div className="flex flex-col items-end justify-between gap-1.5 shrink-0">
                {deal.rewardValue ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: c.dot }}>
                    {deal.rewardValue}
                  </span>
                ) : <span />}
                <button
                  className="text-[9px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                  style={{ borderColor: c.dot, color: c.dot }}
                >
                  {deal.cta || "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {searchFooter}

        <style>{`
          @keyframes detail-slide-in {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Dedicated Search Results View ──
  if (isSearchActive) {
    return (
      <div className="flex flex-col h-full" style={{ scrollbarWidth: "none" }}>
        <div className="shrink-0 px-3 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-100">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-800 truncate">
              Results for "{searchQuery}"
            </p>
            <p className="text-[9px] text-slate-400">
              {isSearching ? "Searching…" : `${catalogSearchDeals.length} deal${catalogSearchDeals.length === 1 ? "" : "s"} found`}
            </p>
          </div>
          <button
            onClick={clearSearch}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 shrink-0"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
          {isSearching && catalogSearchDeals.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
          ) : catalogSearchDeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[11px] text-slate-400">No matching deals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {catalogSearchDeals.map((deal, i) => {
                const c = getColor(deal.category || "");
                return (
                  <div
                    key={deal.id}
                    className="rounded-xl border border-slate-100 bg-white p-2.5 flex flex-col gap-1.5 animate-fade-in"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{deal.merchantName}</p>
                        <p className="text-[8px] text-slate-400 truncate">{deal.subcategory}</p>
                      </div>
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                      >
                        {deal.rewardValue}
                      </span>
                    </div>
                    <p className="text-[9px] leading-snug text-slate-500 line-clamp-2">{deal.dealDescription}</p>
                    <button
                      className="mt-auto text-[9px] font-semibold px-2 py-1 rounded-full border transition-colors"
                      style={{ borderColor: c.border, color: c.text, background: c.bg }}
                    >
                      View Deal
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {searchFooter}
      </div>
    );
  }


  // ── Main View ──
  const groups = allGroups;
  const safeIdx = current % Math.max(groups.length, 1);
  const active = groups[safeIdx];
  const activeDeals = active ? active.deals.filter(d => d.signal !== "suppress") : [];
  const imgSrc = active ? getCollectionImage(active) : DEFAULT_IMAGE;

  return (
    <div className="flex flex-col h-full" style={{ scrollbarWidth: "none" }}>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5" style={{ scrollbarWidth: "none" }}>

        {!focusMode && (
        <>
        {/* ── Savings Summary Bar ── */}
        <div className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px]">👋</span>
            <span className="text-[11px] font-semibold text-slate-700">Welcome, {firstName}!</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600">${yearlySavings} saved this year</span>
          </div>
        </div>

        {/* ── Location Experience ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">Welcome to New York</p>
              <p className="text-[9px] text-slate-500">Explore perks for TCBY Members</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex rounded-lg border border-slate-100 bg-white overflow-hidden">
              <div className="w-1 bg-indigo-500 shrink-0" />
              <div className="px-2 py-1 flex-1 min-w-0">
                <p className="text-[8px] text-slate-500 truncate">MoMA</p>
                <p className="text-[9px] font-bold text-slate-800 leading-tight">Private Gallery Viewing</p>
              </div>
            </div>
            <div className="flex rounded-lg border border-slate-100 bg-white overflow-hidden">
              <div className="w-1 bg-green-500 shrink-0" />
              <div className="px-2 py-1 flex-1 min-w-0">
                <p className="text-[8px] text-slate-500 truncate">NY Mets</p>
                <p className="text-[9px] font-bold text-slate-800 leading-tight">Home Game Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Pick For You ── */}
        {!isSearchActive && topPick && (
          <div
            className="rounded-xl border p-3 cursor-pointer hover:shadow-md transition-shadow"
            style={{
              borderColor: getColor(topPick.group.pillar || "").dot + "40",
              background: `linear-gradient(145deg, ${getColor(topPick.group.pillar || "").dot}08, #ffffff)`,
            }}
            onClick={() => setExpandedGroup(topPick.group)}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Top Pick For You</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 truncate">{topPick.deal.merchant}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {topPick.deal.rewardValue && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: getColor(topPick.group.pillar || "").dot }}
                  >
                    {topPick.deal.rewardValue}
                  </span>
                )}
                <button
                  className="text-[9px] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: getColor(topPick.group.pillar || "").dot }}
                >
                  {topPick.deal.cta || "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Expiring Soon ── */}
        {!isSearchActive && expiringSoon.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[11px] font-bold text-slate-700">Expiring Soon</span>
            </div>

            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {expiringSoon.map((deal) => {
                const isUrgent = deal.hoursLeft < 6;
                return (
                  <div
                    key={deal.id}
                    className="shrink-0 rounded-lg border border-slate-100 bg-white px-2.5 py-2 min-w-[120px] max-w-[140px]"
                  >
                    <p className="text-[10px] font-bold text-slate-800 truncate">{deal.merchant}</p>
                    <div className="flex items-center justify-between mt-1">
                      {deal.rewardValue && (
                        <span className="text-[9px] font-semibold text-slate-600">{deal.rewardValue}</span>
                      )}
                      <span className={`text-[8px] font-bold ${isUrgent ? "text-red-500" : "text-amber-500"}`}>
                        {deal.hoursLeft}h left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}


        {/* ── Collection Carousel ── */}
        {!isSearchActive && groups.length > 0 && active && (
          <>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-slate-700">
                Curated for {firstName}
              </span>
            </div>

            <div
              key={`${active.pillar}::${active.rollup}`}
              className="rounded-xl overflow-hidden border border-slate-100 flex flex-col min-h-[124px] cursor-pointer hover:shadow-md transition-shadow"
              style={{
                background: "linear-gradient(145deg, #f8fafc, #ffffff)",
                animation: `collection-slide-${direction} 0.35s ease-out`,
              }}
              onClick={() => setExpandedGroup(active)}
            >
              <div className="h-[60px] w-full overflow-hidden">
                <img src={imgSrc} alt="" className="w-full h-full object-cover" loading="lazy" onError={handleImageError} />
              </div>
              <div className="px-3 pt-2 pb-1 flex-1">
                <p className="text-[10px] font-semibold text-slate-800 leading-snug">
                  {active.collectionMessage || `Discover curated picks from ${active.rollup}`}
                </p>
              </div>

              <div className="flex items-center gap-1 px-3 pb-2.5 overflow-hidden">
                {activeDeals.map((deal) => (
                  <span
                    key={deal.id}
                    className="inline-flex items-center text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm truncate shrink min-w-0"
                  >
                    {deal.merchant}
                  </span>
                ))}
              </div>
            </div>

            {groups.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => goTo((safeIdx - 1 + groups.length) % groups.length)}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-500" />
                </button>
                <div className="flex gap-1.5">
                  {groups.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i === safeIdx
                          ? "bg-slate-700 scale-125"
                          : "bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => goTo((safeIdx + 1) % groups.length)}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Semantic Search Bar (pinned bottom) ── */}
      {searchFooter}

      <style>{`
        @keyframes collection-slide-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes collection-slide-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes detail-slide-in {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
