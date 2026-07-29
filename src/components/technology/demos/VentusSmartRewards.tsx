import { useEffect, useRef, useCallback } from "react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const PILL_ORDER = ["golf", "snowsports", "domestic_travel", "pets", "dining"];

const GENERIC_DEALS_POOL = [
  { brand: "Amazon", tags: ["Retail", "General"], standard: "Prime membership benefits" },
  { brand: "Target", tags: ["Retail", "General"], standard: "5% off with RedCard" },
  { brand: "Walmart+", tags: ["Retail", "Delivery"], standard: "Free delivery membership" },
  { brand: "Costco", tags: ["Retail", "Wholesale"], standard: "Executive membership rewards" },
  { brand: "Best Buy", tags: ["Electronics", "Retail"], standard: "Totaltech membership perks" },
  { brand: "Home Depot", tags: ["Home", "Retail"], standard: "Pro Xtra loyalty program" },
  { brand: "Lowe's", tags: ["Home", "Retail"], standard: "MyLowe's Rewards" },
  { brand: "CVS", tags: ["Pharmacy", "Health"], standard: "ExtraCare rewards program" },
  { brand: "Walgreens", tags: ["Pharmacy", "Health"], standard: "myWalgreens rewards" },
  { brand: "Kroger", tags: ["Grocery", "Retail"], standard: "Fuel points program" },
  { brand: "Whole Foods", tags: ["Grocery", "Organic"], standard: "Prime member discounts" },
  { brand: "Trader Joe's", tags: ["Grocery", "Specialty"], standard: "Seasonal offerings" },
  { brand: "Nordstrom", tags: ["Fashion", "Retail"], standard: "Nordy Club rewards" },
  { brand: "Macy's", tags: ["Fashion", "Retail"], standard: "Star Rewards program" },
  { brand: "Nike", tags: ["Athletic", "Apparel"], standard: "NikePlus membership benefits" },
  { brand: "Adidas", tags: ["Athletic", "Apparel"], standard: "Creators Club rewards" },
  { brand: "Lululemon", tags: ["Athletic", "Apparel"], standard: "Member exclusive events" },
  { brand: "Peloton", tags: ["Fitness", "Equipment"], standard: "All-Access Membership" },
  { brand: "Sephora", tags: ["Beauty", "Retail"], standard: "Beauty Insider rewards" },
  { brand: "Apple", tags: ["Technology", "Retail"], standard: "Trade-in credit offers" },
];

const DEAL_LIBRARY = {
  golf: [
    { brand: "Callaway", tags: ["Golf", "Equipment"], standard: "20% off premium golf balls" },
    { brand: "TaylorMade", tags: ["Golf", "Equipment"], standard: "$100 off on driver purchase over $400" },
    { brand: "Nike Golf", tags: ["Golf", "Apparel"], standard: "Buy 2 polos, get 1 free" },
    { brand: "PGA Superstore", tags: ["Golf", "Retail"], standard: "$50 gift card with $200 purchase" },
    { brand: "TrackMan", tags: ["Golf", "Technology"], standard: "Free club fitting with Range membership" },
    { brand: "Titleist", tags: ["Golf", "Equipment"], standard: "Free personalization on Pro V1 orders" },
    { brand: "FootJoy", tags: ["Golf", "Apparel"], standard: "30% off all golf shoes" },
    { brand: "GolfNow", tags: ["Golf", "Tee Times"], standard: "$10 off tee time bookings" },
    { brand: "Ping", tags: ["Golf", "Equipment"], standard: "Custom fitting included with iron sets" },
    { brand: "Bushnell", tags: ["Golf", "Technology"], standard: "20% off rangefinders and GPS devices" },
  ],
  snowsports: [
    { brand: "Burton", tags: ["Snow Sports", "Equipment"], standard: "25% off bindings with board purchase" },
    { brand: "GoPro", tags: ["Snow Sports", "Technology"], standard: "15% off GoPro HERO12" },
    { brand: "Smith", tags: ["Snow Sports", "Goggles"], standard: "25% off Smith 4D MAG goggles" },
    { brand: "The North Face", tags: ["Snow Sports", "Apparel"], standard: "30% off winter jackets" },
    { brand: "Ikon Pass", tags: ["Snow Sports", "Passes"], standard: "Family season pass with 50+ destinations" },
    { brand: "REI", tags: ["Snow Sports", "Retail"], standard: "20% off member dividend on winter gear" },
    { brand: "Rossignol", tags: ["Snow Sports", "Equipment"], standard: "Free tune-up with ski purchase" },
    { brand: "Arc'teryx", tags: ["Snow Sports", "Apparel"], standard: "$50 off orders over $300" },
    { brand: "K2", tags: ["Snow Sports", "Equipment"], standard: "Buy skis, get poles 50% off" },
    { brand: "Oakley", tags: ["Snow Sports", "Goggles"], standard: "BOGO 50% on snow goggles" },
  ],
  domestic_travel: [
    { brand: "Hilton", tags: ["Travel", "Hotels"], standard: "Instant status match + 80K bonus points" },
    { brand: "Turo", tags: ["Travel", "Car Rental"], standard: "30% savings on car rentals" },
    { brand: "Clear", tags: ["Travel", "Airport"], standard: "Clear Plus family membership for faster TSA" },
    { brand: "Delta SkyMiles", tags: ["Travel", "Airlines"], standard: "50K bonus miles with new card" },
    { brand: "Airbnb", tags: ["Travel", "Lodging"], standard: "$100 off first booking over $500" },
    { brand: "Hyatt", tags: ["Travel", "Hotels"], standard: "Two free nights with World of Hyatt card" },
    { brand: "Southwest", tags: ["Travel", "Airlines"], standard: "Companion pass after 125K points" },
    { brand: "National Car Rental", tags: ["Travel", "Car Rental"], standard: "Executive status upgrade included" },
    { brand: "TSA PreCheck", tags: ["Travel", "Airport"], standard: "$20 off 5-year membership" },
    { brand: "Marriott Bonvoy", tags: ["Travel", "Hotels"], standard: "Earn 6X points on hotel stays" },
  ],
  pets: [
    { brand: "Chewy", tags: ["Pets", "Food"], standard: "15% off first Autoship order" },
    { brand: "PetSmart", tags: ["Pets", "Grooming"], standard: "Grooming loyalty — $10 off every 6th visit" },
    { brand: "Trupanion", tags: ["Pets", "Insurance"], standard: "90% reimbursement with no payout limits" },
    { brand: "Rover", tags: ["Pets", "Pet Sitting"], standard: "$20 off first booking" },
    { brand: "Petco", tags: ["Pets", "Retail"], standard: "$20 off $100 purchase" },
    { brand: "Blue Buffalo", tags: ["Pets", "Food"], standard: "Buy 10 bags, get 1 free" },
    { brand: "Banfield", tags: ["Pets", "Veterinary"], standard: "Wellness plan with free exams" },
    { brand: "Kong", tags: ["Pets", "Toys"], standard: "25% off durable chew toys" },
    { brand: "Furbo", tags: ["Pets", "Technology"], standard: "$50 off dog camera with treats" },
    { brand: "Barkbox", tags: ["Pets", "Subscription"], standard: "First month free with 6-month plan" },
  ],
  dining: [
    { brand: "CAVA", tags: ["Dining", "Lunch"], standard: "$5 off first Mediterranean bowl" },
    { brand: "Resy", tags: ["Dining", "Fine Dining"], standard: "Priority access to exclusive reservations" },
    { brand: "DoorDash", tags: ["Dining", "Delivery"], standard: "DashPass membership with free delivery" },
    { brand: "OpenTable", tags: ["Dining", "Reservations"], standard: "2,000 bonus points on 3 reservations" },
    { brand: "Uber Eats", tags: ["Dining", "Delivery"], standard: "$20 off first 2 orders" },
    { brand: "Grubhub+", tags: ["Dining", "Delivery"], standard: "Free delivery on all orders" },
    { brand: "Panera", tags: ["Dining", "Lunch"], standard: "Unlimited coffee subscription $10.99/mo" },
    { brand: "Sweetgreen", tags: ["Dining", "Lunch"], standard: "$3 off with Rewards membership" },
    { brand: "Chipotle", tags: ["Dining", "Fast Casual"], standard: "Free entree after 1,250 points" },
    { brand: "The Infatuation", tags: ["Dining", "Discovery"], standard: "Exclusive restaurant guide access" },
  ],
};

const PILL_DATA = {
  golf: {
    hint: "Golf",
    tx: [
      { m: "Titleist.com", amt: "$58.00" },
      { m: "PGA Superstore", amt: "$129.99" },
      { m: "Local Course", amt: "$92.00" },
      { m: "Golf Galaxy", amt: "$247.50" },
      { m: "TPC Boston", amt: "$145.00" },
      { m: "Golfsmith", amt: "$85.00" },
    ],
    ai: [
      { title: "$58.00 at Titleist.com", taxRate: 6.25, inference: "Likely 1× dozen Pro V1 or Pro V1x (pricing match).", conf: 0.86 },
      { title: "$129.99 at PGA Superstore", taxRate: 6.25, inference: "Basket inference suggests glove + tees + 1–2 sleeves.", conf: 0.71 },
      { title: "$92.00 at Local Course", taxRate: 0, inference: "Green fee matches 18-hole weekend rate.", conf: 0.79 },
      { title: "$247.50 at Golf Galaxy", taxRate: 6.25, inference: "Price point suggests wedge or hybrid club purchase.", conf: 0.68 },
      { title: "$145.00 at TPC Boston", taxRate: 6.25, inference: "Tournament spectator tickets for 2.", conf: 0.75 },
      { title: "$85.00 at Golfsmith", taxRate: 6.25, inference: "Club fitting service indicates commitment to performance.", conf: 0.72 },
    ],
    deals: [
      { brand: "Callaway", value: 150, standard: "20% off premium golf balls", personalized: "Capture your weekend play with Callaway Chrome Tour X at 20% off. You just purchased Pro V1s at Titleist.com for $58 — Chrome Tour X delivers similar distance and softer feel at better value with this introductory offer." },
      { brand: "TrackMan", value: 299, standard: "Free club fitting with TrackMan Range membership", personalized: "Improve your game with real-time swing data and free club fitting session. Your recent $85 fitting at Golfsmith shows equipment optimization focus — TrackMan data can maximize performance with your new clubs." },
      { brand: "TaylorMade", value: 100, standard: "$100 off on driver purchase over $400", personalized: "Upgrade your driver with TaylorMade Stealth 2 at $100 off. Your $247.50 club purchase at Golf Galaxy shows investment in equipment — premium drivers can add 15-20 yards to your drive distance." },
      { brand: "Nike Golf", value: 75, lowPriority: true, suppressionReason: "Lower value apparel deal — prioritizing equipment offers", standard: "Buy 2 polos, get 1 free", personalized: "Refresh your golf wardrobe with Nike Golf at buy 2 get 1 free. Your regular course visits and $145 tournament attendance show active golf lifestyle — professional appearance matters on and off the course." },
    ],
  },
  snowsports: {
    hint: "Snow Sports",
    tx: [
      { m: "Epic Pass", amt: "$1,129.00" },
      { m: "Burton", amt: "$214.50" },
      { m: "Ski Shop", amt: "$78.20" },
      { m: "REI", amt: "$167.89" },
      { m: "Loon Mountain", amt: "$312.00" },
      { m: "The North Face", amt: "$389.00" },
    ],
    ai: [
      { title: "$1,129.00 at Epic Pass", taxRate: 0, inference: "Matches family-style season pass bundles.", conf: 0.82 },
      { title: "$214.50 at Burton", taxRate: 6.25, inference: "Likely kids outerwear + gloves.", conf: 0.74 },
      { title: "$78.20 at Ski Shop", taxRate: 6.25, inference: "Tune + wax + edge service.", conf: 0.77 },
      { title: "$167.89 at REI", taxRate: 6.25, inference: "Winter accessories bundle.", conf: 0.69 },
      { title: "$312.00 at Loon Mountain", taxRate: 0, inference: "Family day pass pricing for 4.", conf: 0.80 },
      { title: "$389.00 at The North Face", taxRate: 6.25, inference: "Premium kids outerwear at 2-jacket price point.", conf: 0.76 },
    ],
    deals: [
      { brand: "Smith", value: 125, standard: "25% off Smith 4D MAG goggles", personalized: "Upgrade your vision with Smith 4D MAG goggles at 25% off for Epic Pass holders. Quick-swap ChromaPop lenses enhance visibility across all conditions — perfect for your frequent mountain visits throughout the season." },
      { brand: "GoPro", value: 85, standard: "15% off GoPro HERO12", personalized: "Capture precious family memories with GoPro at 15% off. Waterproof design with easy mounts. Your family visits Loon Mountain regularly with kids — capture those moments on the slopes before they outgrow this phase." },
      { brand: "Ikon Pass", value: 1200, lowPriority: true, suppressionReason: "Competing product: Customer purchased Epic Pass for $1,129", standard: "Family season pass with 50+ destinations", personalized: "Expand access to 50+ mountains with Ikon Pass family plans. Your $1,129 Epic Pass covers limited resorts — Ikon offers similar pricing with better New England access including Loon Mountain where you already spend $312 on day passes." },
      { brand: "Burton", value: 200, lowPriority: true, suppressionReason: "Recent purchase: $214.50 spent 3 weeks ago", standard: "25% off bindings with board purchase", personalized: "Upgrade your board setup with Burton bindings at 25% off with any board purchase. Your recent $214.50 kids outerwear buy shows family commitment to the sport — quality bindings enhance safety and performance." },
    ],
  },
  domestic_travel: {
    hint: "Domestic Travel",
    tx: [
      { m: "Delta Air Lines", amt: "$364.18" },
      { m: "Marriott", amt: "$612.40" },
      { m: "Uber", amt: "$46.22" },
      { m: "United Airlines", amt: "$428.90" },
      { m: "Hertz", amt: "$287.55" },
      { m: "Airbnb", amt: "$845.00" },
    ],
    ai: [
      { title: "$364.18 at Delta", taxRate: 0, inference: "Route + cadence suggests repeat trip likelihood.", conf: 0.76 },
      { title: "$612.40 at Marriott", taxRate: 5.7, inference: "3-night stay suggests weekend extension.", conf: 0.69 },
      { title: "$46.22 at Uber", taxRate: 0, inference: "Airport ride pattern confirms itinerary timestamps.", conf: 0.81 },
      { title: "$428.90 at United Airlines", taxRate: 0, inference: "BOS to SFO route indicates West Coast preference.", conf: 0.73 },
      { title: "$287.55 at Hertz", taxRate: 6.25, inference: "Weekly rental duration aligns with extended family trip.", conf: 0.78 },
      { title: "$845.00 at Airbnb", taxRate: 5.7, inference: "5-night mountain location booking.", conf: 0.70 },
    ],
    deals: [
      { brand: "Hilton", value: 400, standard: "Instant status match + 80K bonus points", personalized: "Match your Marriott status instantly with Hilton and earn 80K bonus points on first stay. You spend $600+ per hotel stay — enough points for two free weekend nights on your future Denver trips where you're already traveling regularly." },
      { brand: "Clear", value: 189, standard: "Clear Plus family membership for faster TSA", personalized: "Breeze through security in minutes at Boston Logan and 50+ airports with Clear family plan at $189/year. Flying from BOS 4-6 times annually with family means saving 20+ minutes per trip with kids in tow." },
      { brand: "Turo", value: 100, standard: "30% savings on car rentals", personalized: "Skip rental counters and save 30% with Turo delivered to your hotel. Your $287 Hertz rental becomes $200 with better vehicle selection — hotel delivery eliminates airport counter waits for family of 4 with luggage." },
      { brand: "Airbnb", value: 100, lowPriority: true, suppressionReason: "Recent booking: $845 spent 2 weeks ago", standard: "$100 off first booking over $500", personalized: "Save $100 on your next mountain getaway with Airbnb. Your recent $845 5-night booking shows preference for spacious family accommodations — new user offer doesn't apply but Superhost properties ensure quality stays." },
      { brand: "TSA PreCheck", value: 85, lowPriority: true, suppressionReason: "Lower value vs Clear — both offer TSA benefits", standard: "$20 off 5-year membership", personalized: "Save time at security with TSA PreCheck at $85 for 5 years. Your 4-6 BOS trips annually mean faster screening — though Clear offers family plans, PreCheck works across all airlines and costs less long-term." },
    ],
  },
  pets: {
    hint: "Pets",
    tx: [
      { m: "Chewy", amt: "$64.90" },
      { m: "Veterinary Clinic", amt: "$186.00" },
      { m: "Petco", amt: "$28.47" },
      { m: "PetSmart", amt: "$72.00" },
      { m: "Banfield", amt: "$45.99" },
      { m: "Pet Supplies Plus", amt: "$89.35" },
    ],
    ai: [
      { title: "$64.90 at Chewy", taxRate: 6.25, inference: "Subscription-like recurring order.", conf: 0.84 },
      { title: "$186.00 at Veterinary Clinic", taxRate: 0, inference: "Routine care probability high.", conf: 0.63 },
      { title: "$28.47 at Petco", taxRate: 6.25, inference: "Top-up aligns with low-inventory window before ship date.", conf: 0.70 },
      { title: "$72.00 at PetSmart", taxRate: 0, inference: "Monthly grooming service indicates larger breed or high-maintenance coat.", conf: 0.77 },
      { title: "$45.99 at Banfield", taxRate: 0, inference: "Wellness plan subscription suggests proactive health management.", conf: 0.81 },
      { title: "$89.35 at Pet Supplies Plus", taxRate: 6.25, inference: "Supplementary shopping between main orders.", conf: 0.68 },
    ],
    deals: [
      { brand: "Trupanion", value: 500, standard: "90% reimbursement pet insurance with no payout limits", personalized: "Protect against unexpected costs with Trupanion's 90% reimbursement coverage and no payout limits. Your $186 vet visit plus $45.99 Banfield wellness plan shows proactive care focus — Trupanion covers major expenses beyond routine wellness." },
      { brand: "Rover", value: 200, standard: "Trusted pet sitters with $20 off first booking", personalized: "Save on pet care during travel with Rover at $40/night versus $65+ kennels. Your Denver and SF trips require care for your larger breed — background-checked sitters provide in-home comfort while you're away, plus $20 off first booking." },
      { brand: "PetSmart", value: 120, standard: "Grooming loyalty program — $10 off every 6th visit", personalized: "Maximize your grooming savings with PetSmart loyalty program earning $10 off every 6th visit. You already pay $72/month for grooming — new client discounts don't apply, but loyalty rewards add up to $120/year in savings." },
      { brand: "Chewy", value: 50, lowPriority: true, suppressionReason: "Timing suppression: Recent order 6 days ago — wait 2 weeks", standard: "15% off first Autoship order", personalized: "Save on your regular food orders with Chewy Autoship at 15% off. Your $64.90 recurring pattern suggests monthly orders — set up Autoship now and never run out while saving $10/month on supplies." },
      { brand: "Petco", value: 20, lowPriority: true, suppressionReason: "Low dollar value + recent purchase 1 week ago", standard: "$20 off $100 purchase", personalized: "Stock up on essentials with Petco's $20 off $100 offer. Your $28.47 top-up purchase shows you shop between main orders — consolidate next month's supplies into one trip to maximize savings." },
    ],
  },
  dining: {
    hint: "Dining",
    tx: [
      { m: "Sweetgreen", amt: "$16.84" },
      { m: "Omakase Sushi", amt: "$182.10" },
      { m: "Blue Bottle", amt: "$6.45" },
      { m: "Legal Sea Foods", amt: "$98.76" },
      { m: "Flour Bakery", amt: "$42.30" },
      { m: "Tatte", amt: "$18.95" },
    ],
    ai: [
      { title: "$182.10 at Omakase Sushi", taxRate: 6.25, inference: "Likely tasting menu for 2 + gratuity.", conf: 0.73 },
      { title: "$16.84 at Sweetgreen", taxRate: 6.25, inference: "Lunch bowl + add-ons.", conf: 0.78 },
      { title: "$6.45 at Blue Bottle", taxRate: 6.25, inference: "High frequency indicates morning routine anchor.", conf: 0.81 },
      { title: "$98.76 at Legal Sea Foods", taxRate: 6.25, inference: "Family dinner for 4 including kids meals.", conf: 0.74 },
      { title: "$42.30 at Flour Bakery", taxRate: 6.25, inference: "Weekend brunch for 2-3.", conf: 0.69 },
      { title: "$18.95 at Tatte", taxRate: 6.25, inference: "Weekday breakfast routine in Cambridge.", conf: 0.82 },
    ],
    deals: [
      { brand: "Resy", value: 300, standard: "Priority access to exclusive reservations", personalized: "Unlock Boston's best omakase with Resy priority access to O Ya, Oishii, and chef's counter seats at new openings. Your $182 spend at omakase shows fine dining appreciation — secure impossible-to-get reservations before they're released publicly." },
      { brand: "OpenTable", value: 240, standard: "2,000 bonus points on three qualifying reservations", personalized: "Earn dining credits with OpenTable points converting to $20-30/month toward future reservations. Your family dines out 2-3x monthly at $100+ checks — 2,000 bonus points on three reservations gets you started earning rewards on spending you already do." },
      { brand: "DoorDash", value: 120, standard: "DashPass membership with free delivery", personalized: "Never pay delivery fees with DoorDash at $9.99/month including exclusive restaurant offers. Your Blue Bottle routine 4-6x/week plus regular dining out means saving $5.99 per delivery — breaks even at just 2 orders monthly for your habits." },
      { brand: "CAVA", value: 60, standard: "$5 off first Mediterranean bowl", personalized: "Discover Mediterranean variety with CAVA at $5 off your first bowl. Your Sweetgreen Tue/Thu routine shows health-conscious eating — CAVA offers similar nutrition with bold Mediterranean flavors at the same $16-17 price point." },
      { brand: "Panera", value: 132, lowPriority: true, suppressionReason: "Coffee subscription overlaps with Blue Bottle habit", standard: "Unlimited coffee subscription $10.99/mo", personalized: "Get unlimited coffee at Panera for $10.99/month with their subscription. Your $6.45 Blue Bottle visits 4-6x/week cost $130-195/month — Panera subscription saves money but may not match specialty coffee preference." },
    ],
  },
};

const PILL_ICONS = { golf: "⛳", snowsports: "🎿", domestic_travel: "✈️", pets: "🐾", dining: "🍽️" };
const PILL_LABELS = { golf: "Golf", snowsports: "Snow Sports", domestic_travel: "Domestic Travel", pets: "Pets", dining: "Dining" };

function pillLabel(id: string) { return (PILL_LABELS as Record<string, string>)[id] || id; }
function dealKey(d: { brand: string }) { return d.brand.toLowerCase(); }
function wait(ms: number) { return new Promise(res => setTimeout(res, ms)); }

// ─── Component ────────────────────────────────────────────────────────────────

export default function VentusSmartRewards() {
  // Mutable state in refs — no re-renders needed for animation loop
  const runningRef = useRef(true);
  const stepIdxRef = useRef(0);
  const flowTokenRef = useRef(0);
  const cyclesRef = useRef(0);
  const currentPillRef = useRef("golf");
  const highPipelineRef = useRef([]);
  const lowPipelineRef = useRef([]);

  // DOM refs
  const rootRef = useRef(null);
  const txListRef = useRef(null);
  const aiListRef = useRef(null);
  const dealLibraryRef = useRef(null);
  const highPriorityRef = useRef(null);
  const lowPriorityRef = useRef(null);
  const txHintRef = useRef(null);
  const libraryCountRef = useRef(null);
  const highCountRef = useRef(null);
  const lowCountRef = useRef(null);
  const flowStepRef = useRef(null);
  const pauseLabelRef = useRef<HTMLSpanElement>(null);
  const pauseIconRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef(null);
  const loadTxRef = useRef(null);
  const loadAiRef = useRef(null);
  const loadHighRef = useRef(null);
  const loadLowRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showLoad = useCallback((which, on) => {
    if (which === "tx" && loadTxRef.current) loadTxRef.current.style.display = on ? "flex" : "none";
    if (which === "ai" && loadAiRef.current) loadAiRef.current.style.display = on ? "flex" : "none";
    if (which === "deals") {
      if (loadHighRef.current) loadHighRef.current.style.display = on ? "flex" : "none";
      if (loadLowRef.current) loadLowRef.current.style.display = on ? "flex" : "none";
    }
  }, []);

  const setPauseLabel = useCallback((label: string) => {
    if (pauseLabelRef.current) pauseLabelRef.current.textContent = label;
    if (pauseIconRef.current) {
      const isPause = label === 'Pause';
      pauseIconRef.current.innerHTML = isPause
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  }, []);

  const setScanningUI = useCallback((pillId, on) => {
    if (!rootRef.current) return;
    rootRef.current.querySelectorAll(".vsr-pill").forEach(btn => {
      if (btn.dataset.pill === pillId) {
        btn.classList.toggle("scanning", !!on);
      } else {
        btn.classList.remove("scanning");
      }
    });
  }, []);

  const renderTx = useCallback((items) => {
    if (!txListRef.current) return;
    txListRef.current.innerHTML = items.map(x => `
      <div class="vsr-item vsr-fadeIn">
        <div class="vsr-item-name">${x.m}</div>
        <div class="vsr-amt vsr-mono">${x.amt}</div>
      </div>
    `).join("");
  }, []);

  const renderAi = useCallback((items) => {
    if (!aiListRef.current) return;
    aiListRef.current.innerHTML = items.map(x => {
      const amountMatch = x.title.match(/\$[\d,]+\.?\d*/);
      const total = amountMatch ? parseFloat(amountMatch[0].replace(/[$,]/g, "")) : 0;
      const preTax = x.taxRate > 0 ? total / (1 + x.taxRate / 100) : total;
      const taxCalc = x.taxRate > 0
        ? `MA sales tax (${x.taxRate}%) → pre-tax $${preTax.toFixed(2)} • `
        : "No sales tax applied • ";
      return `
        <div class="vsr-ai-line vsr-fadeIn">
          <div class="vsr-spark">✨</div>
          <div class="vsr-ai-txt">
            <div class="vsr-ai-title-row">
              <b>${x.title}</b>
              <span class="vsr-conf">Confidence: ${x.conf.toFixed(2)}</span>
            </div>
            <div class="vsr-ai-info">${taxCalc}${x.inference}</div>
          </div>
        </div>
      `;
    }).join("");
  }, []);

  const renderDealLibrary = useCallback((categoryDeals) => {
    if (!dealLibraryRef.current) return;
    if (libraryCountRef.current) libraryCountRef.current.textContent = categoryDeals.length + " deals";
    dealLibraryRef.current.innerHTML = categoryDeals.map((d, i) => `
      <div class="vsr-deal-card vsr-deal-final" style="animation-delay:${i * 0.06}s">
        <div class="vsr-deal-top">
          <div class="vsr-deal-brand">${d.brand}</div>
          <div class="vsr-deal-tags">${d.tags.map(t => `<span class="vsr-deal-tag">${t}</span>`).join("")}</div>
        </div>
        <div class="vsr-deal-desc">${d.standard}</div>
      </div>
    `).join("");
  }, []);

  const renderDealLibraryWithScroll = useCallback(async (token) => {
    if (!dealLibraryRef.current) return;
    const categoryDeals = DEAL_LIBRARY[currentPillRef.current] || [];
    if (libraryCountRef.current) libraryCountRef.current.textContent = "scanning thousands...";

    const shuffled = [...GENERIC_DEALS_POOL].sort(() => Math.random() - 0.5);
    const doubled = [...shuffled, ...shuffled];
    dealLibraryRef.current.innerHTML = `
      <div class="vsr-scroll-container">
        ${doubled.map(d => `
          <div class="vsr-deal-card">
            <div class="vsr-deal-top">
              <div class="vsr-deal-brand">${d.brand}</div>
              <div class="vsr-deal-tags">${d.tags.map(t => `<span class="vsr-deal-tag">${t}</span>`).join("")}</div>
            </div>
            <div class="vsr-deal-desc">${d.standard}</div>
          </div>
        `).join("")}
      </div>
    `;

    await wait(1800);
    if (token !== flowTokenRef.current) return;

    renderDealLibrary(categoryDeals);
  }, [renderDealLibrary]);

  const renderDealAccordion = useCallback((d, isCurrent) => {
    const label = pillLabel(d.sourcePill);
    const openAttr = isCurrent ? "open" : "";
    const lowClass = d.lowPriority ? "low-priority" : "";
    return `
      <details class="vsr-accord ${lowClass} vsr-fadeIn" ${openAttr}>
        <summary class="vsr-accord-sum">
          <div class="vsr-sum-left">
            <div class="vsr-brand-name">${d.brand}</div>
            <div class="vsr-pill-tag">${label}</div>
            <div class="vsr-dollar-value">$${d.value}</div>
          </div>
          <div class="vsr-caret">▾</div>
        </summary>
        <div class="vsr-accord-body">
          ${d.suppressionReason ? `
            <div class="vsr-suppression">
              <div class="vsr-sup-icon">⚠️</div>
              <div class="vsr-sup-txt">${d.suppressionReason}</div>
            </div>
          ` : ""}
          <div class="vsr-deal-section">
            <div class="vsr-deal-label">Standard Offer</div>
            <div class="vsr-deal-copy">${d.standard}</div>
          </div>
          <div class="vsr-deal-section">
            <div class="vsr-deal-label" style="color:#2563eb;">✨ AI Personalization</div>
            <div class="vsr-deal-copy">${d.personalized}</div>
          </div>
        </div>
      </details>
    `;
  }, []);

  const renderPipeline = useCallback(() => {
    const sortedHigh = [...highPipelineRef.current].sort((a, b) => b.value - a.value);
    const sortedLow = [...lowPipelineRef.current].sort((a, b) => b.value - a.value);
    const cur = currentPillRef.current;

    if (highCountRef.current) highCountRef.current.textContent = sortedHigh.length + " deals";
    if (lowCountRef.current) lowCountRef.current.textContent = sortedLow.length + " deals";

    const buildHTML = (sorted, container) => {
      if (!container) return;
      const current = sorted.filter(d => d.sourcePill === cur);
      const previous = sorted.filter(d => d.sourcePill !== cur);
      let html = "";
      if (current.length) {
        html += `<div class="vsr-section-label">From ${pillLabel(cur)}</div>`;
        html += current.map(d => renderDealAccordion(d, true)).join("");
      }
      if (previous.length) {
        html += `
          <details class="vsr-collapse">
            <summary class="vsr-collapse-sum">
              <span>Previous indicators (${previous.length})</span>
              <div class="vsr-caret">▾</div>
            </summary>
            <div class="vsr-collapse-body">
              ${previous.map(d => renderDealAccordion(d, false)).join("")}
            </div>
          </details>
        `;
      }
      container.innerHTML = html;
    };

    buildHTML(sortedHigh, highPriorityRef.current);
    buildHTML(sortedLow, lowPriorityRef.current);
  }, [renderDealAccordion]);

  const addDeals = useCallback((deals, sourcePill) => {
    const highSeen = new Set(highPipelineRef.current.map(dealKey));
    const lowSeen = new Set(lowPipelineRef.current.map(dealKey));
    deals.forEach(d => {
      const k = dealKey(d);
      const enriched = { ...d, sourcePill, createdAt: Date.now() };
      if (d.lowPriority) {
        if (!lowSeen.has(k)) { lowPipelineRef.current.push(enriched); lowSeen.add(k); }
      } else {
        if (!highSeen.has(k)) { highPipelineRef.current.push(enriched); highSeen.add(k); }
      }
    });
    renderPipeline();
  }, [renderPipeline]);

  const updatePillUI = useCallback((pillId) => {
    if (!rootRef.current) return;
    rootRef.current.querySelectorAll(".vsr-pill").forEach(btn => {
      const on = btn.dataset.pill === pillId;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }, []);

  // ── Flow steps ────────────────────────────────────────────────────────────

  const runOneStep = useCallback(async (pillId, stepNum, total, token) => {
    const data = PILL_DATA[pillId];
    if (!data || token !== flowTokenRef.current) return;

    currentPillRef.current = pillId;
    setScanningUI(pillId, true);
    updatePillUI(pillId);

    if (txHintRef.current) txHintRef.current.textContent = data.hint;
    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Scanning: ${pillLabel(pillId)}`;

    showLoad("tx", true);
    await wait(2000);
    if (token !== flowTokenRef.current) return;
    showLoad("tx", false);
    await wait(150);
    if (token !== flowTokenRef.current) return;
    renderTx(data.tx);
    await wait(2500);
    if (token !== flowTokenRef.current) return;

    aiListRef.current && (aiListRef.current.innerHTML = "");
    await wait(150);
    if (token !== flowTokenRef.current) return;
    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Analyzing: ${pillLabel(pillId)}`;
    showLoad("ai", true);
    await wait(2000);
    if (token !== flowTokenRef.current) return;
    showLoad("ai", false);
    await wait(150);
    if (token !== flowTokenRef.current) return;
    renderAi(data.ai);
    await wait(2500);
    if (token !== flowTokenRef.current) return;

    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Filtering thousands of deals...`;
    await renderDealLibraryWithScroll(token);
    if (token !== flowTokenRef.current) return;
    await wait(700);
    if (token !== flowTokenRef.current) return;

    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Personalizing: ${pillLabel(pillId)}`;
    showLoad("deals", true);
    await wait(2200);
    if (token !== flowTokenRef.current) return;
    showLoad("deals", false);
    await wait(150);
    if (token !== flowTokenRef.current) return;
    addDeals(data.deals, pillId);
    await wait(2200);
    if (token !== flowTokenRef.current) return;
    setScanningUI(pillId, false);
  }, [setScanningUI, updatePillUI, showLoad, renderTx, renderAi, renderDealLibraryWithScroll, addDeals]);

  const autoLoop = useCallback(async () => {
    const total = PILL_ORDER.length;
    while (runningRef.current && cyclesRef.current < 1) {
      const myToken = flowTokenRef.current;
      const pillId = PILL_ORDER[stepIdxRef.current % total];
      const stepNum = (stepIdxRef.current % total) + 1;
      await runOneStep(pillId, stepNum, total, myToken);
      if (myToken !== flowTokenRef.current) continue;
      stepIdxRef.current++;
      if (stepIdxRef.current >= total) {
        cyclesRef.current++;
        if (cyclesRef.current >= 1) {
          runningRef.current = false;
          setPauseLabel("Play");
          if (flowStepRef.current) flowStepRef.current.textContent = "All indicators processed · Complete";
          break;
        }
      }
      await wait(1400);
    }
  }, [runOneStep]);

  const start = useCallback(() => {
    runningRef.current = true;
    cyclesRef.current = 0;
    stepIdxRef.current = 0;
    setPauseLabel("Pause");
    flowTokenRef.current++;
    autoLoop();
  }, [autoLoop]);

  const pause = useCallback(() => {
    runningRef.current = false;
    setPauseLabel("Play");
    flowTokenRef.current++;
    setScanningUI("", false);
    showLoad("tx", false);
    showLoad("ai", false);
    showLoad("deals", false);
    if (flowStepRef.current) flowStepRef.current.textContent = "Paused";
  }, [setScanningUI, showLoad]);

  // ── Pill click handler ────────────────────────────────────────────────────

  const handlePillClick = useCallback(async (pillId) => {
    pause();
    const data = PILL_DATA[pillId];
    if (!data) return;
    const clickToken = flowTokenRef.current;
    currentPillRef.current = pillId;
    updatePillUI(pillId);
    if (txHintRef.current) txHintRef.current.textContent = data.hint;
    if (flowStepRef.current) flowStepRef.current.textContent = pillLabel(pillId);
    renderTx(data.tx);
    aiListRef.current && (aiListRef.current.innerHTML = "");
    showLoad("ai", true);
    await wait(1400);
    if (clickToken !== flowTokenRef.current) return;
    showLoad("ai", false);
    await wait(100);
    if (clickToken !== flowTokenRef.current) return;
    renderAi(data.ai);
    await wait(600);
    if (clickToken !== flowTokenRef.current) return;
    if (flowStepRef.current) flowStepRef.current.textContent = "Filtering thousands of deals...";
    await renderDealLibraryWithScroll(clickToken);
    if (clickToken !== flowTokenRef.current) return;
    await wait(700);
    if (clickToken !== flowTokenRef.current) return;
    showLoad("deals", true);
    if (flowStepRef.current) flowStepRef.current.textContent = `Personalizing: ${pillLabel(pillId)}`;
    await wait(2000);
    if (clickToken !== flowTokenRef.current) return;
    showLoad("deals", false);
    renderPipeline();
    if (flowStepRef.current) flowStepRef.current.textContent = pillLabel(pillId);
  }, [pause, updatePillUI, renderTx, renderAi, renderDealLibraryWithScroll, showLoad, renderPipeline]);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const first = PILL_ORDER[0];
    currentPillRef.current = first;
    renderTx(PILL_DATA[first].tx);
    if (txHintRef.current) txHintRef.current.textContent = PILL_DATA[first].hint;
    renderDealLibrary(DEAL_LIBRARY[first] || []);
    renderPipeline();
    start();
    return () => {
      flowTokenRef.current++;
      runningRef.current = false;
      // Clear all innerHTML-managed containers so React doesn't try to remove
      // DOM nodes it didn't create, which causes "removeChild" errors.
      if (txListRef.current) txListRef.current.innerHTML = "";
      if (aiListRef.current) aiListRef.current.innerHTML = "";
      if (dealLibraryRef.current) dealLibraryRef.current.innerHTML = "";
      if (highPriorityRef.current) highPriorityRef.current.innerHTML = "";
      if (lowPriorityRef.current) lowPriorityRef.current.innerHTML = "";
    };
  }, [renderTx, renderDealLibrary, renderPipeline, start]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .vsr-root {
          font-family: "Manrope", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #0f172a;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
        }
        .vsr-root *, .vsr-root *::before, .vsr-root *::after { box-sizing: border-box; }

        .vsr-top {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .vsr-title-left {
          display: flex; align-items: center; gap: 8px;
        }
        .vsr-pulsing-dot {
          position: relative; width: 8px; height: 8px; flex-shrink: 0;
        }
        .vsr-pulsing-dot::before {
          content: ''; position: absolute; inset: 0; border-radius: 50%; background: #10b981;
          animation: vsr-dotPulse 2s ease-in-out infinite;
        }
        .vsr-pulsing-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%; background: #10b981;
          opacity: 0.75; animation: vsr-dotPing 2s ease-in-out infinite;
        }
        @keyframes vsr-dotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        @keyframes vsr-dotPing { 0% { transform: scale(1); opacity: 0.75; } 100% { transform: scale(2.5); opacity: 0; } }
        .vsr-title {
          font-weight: 700; letter-spacing: 0; text-transform: none;
          line-height: 1.05; font-size: 18px; color: #0f172a;
        }
        .vsr-live-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 999px;
          background: rgba(16,185,129,0.08); color: #059669;
          font-size: 11px; font-weight: 600;
        }
        .vsr-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: vsr-dotPulse 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(16,185,129,0.6);
        }
        @media (max-width: 1023px) {
          .vsr-live-dot { display: none; }
        }
        .vsr-sub { color: rgba(15,23,42,.55); font-size: 13px; line-height: 1.35; max-width: 1200px; margin-top: 6px; }

        .vsr-grid { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 16px 20px; }

        .vsr-row {
          display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
          padding: 12px; background: #fff;
          border: 1px solid #e2e8f0; border-radius: 18px;
        }
        .vsr-row-label { font-size: 12px; color: rgba(15,23,42,.50); font-weight: 650; letter-spacing: .02em; margin-right: 4px; }

        .vsr-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 999px;
          border: 1px solid #e2e8f0; background: #fff;
          font-size: 12px; color: rgba(15,23,42,.80);
        }
        .vsr-chip strong { font-weight: 720; color: #0f172a; }
        .vsr-chip .k { color: rgba(15,23,42,.50); font-weight: 650; }

        .vsr-pills { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .vsr-pill {
          position: relative;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 999px;
          border: 1px solid #e2e8f0; background: #fff;
          cursor: pointer;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
          font-size: 13px; color: rgba(15,23,42,.85);
          outline: none;
        }
        .vsr-pill:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.08); border-color: rgba(15,23,42,.25); background: rgba(15,23,42,.07); }
        .vsr-pill[aria-selected="true"] { background: rgba(37,99,235,.08); border-color: rgba(37,99,235,.40); box-shadow: 0 12px 26px rgba(37,99,235,.08); color: #2563eb; font-weight: 700; }
        .vsr-pill[aria-selected="true"] .vsr-pill-icon { background: rgba(37,99,235,.12); border-color: rgba(37,99,235,.30); }
        .vsr-pill.scanning { border-color: rgba(59,130,246,.50); background: rgba(59,130,246,.08); box-shadow: 0 14px 34px rgba(59,130,246,.12); color: #2563eb; font-weight: 700; }
        .vsr-pill.scanning::after {
          content: ""; position: absolute; inset: -2px; border-radius: 999px;
          border: 1px solid rgba(59,130,246,.50);
          animation: vsr-scanGlow 1.4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes vsr-scanGlow {
          0%  { opacity: .25; transform: scale(0.985); }
          50% { opacity: .85; transform: scale(1.01); }
          100%{ opacity: .25; transform: scale(0.985); }
        }
        .vsr-pill-icon {
          width: 26px; height: 26px; border-radius: 10px;
          display: grid; place-items: center;
          background: #f8fafc; border: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .vsr-pill[aria-selected="true"] .vsr-pill-icon { background: rgba(15,23,42,.08); border-color: rgba(15,23,42,.22); }
        .vsr-pill.scanning .vsr-pill-icon { background: rgba(59,130,246,.10); border-color: rgba(59,130,246,.25); }

        .vsr-controls {
          display: flex; gap: 10px; align-items: center; justify-content: space-between;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 18px;
        }
        .vsr-ctrl-left { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; color: rgba(15,23,42,.65); font-size: 12px; }
        .vsr-ctrl-btns { display: flex; gap: 8px; align-items: center; }
        .vsr-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 10px; border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: rgba(15,23,42,.85);
          font-weight: 740; font-size: 12px; cursor: pointer;
          transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
        }
        .vsr-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.08); background: #f8fafc; }
        .vsr-btn.primary { background: #0f172a; color: #fff; border-color: rgba(15,23,42,.10); }
        .vsr-btn.primary:hover { background: #1e293b; }
        .vsr-btn:active { transform: translateY(1px); }

        .vsr-analysis-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 6px; }
        @media (max-width: 980px) { .vsr-analysis-row { grid-template-columns: 1fr; } }
        .vsr-deals-row { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; padding: 6px; }
        @media (max-width: 980px) { .vsr-deals-row { grid-template-columns: 1fr; } }
        .vsr-pipeline-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 0; }
        @media (max-width: 760px) { .vsr-pipeline-panel { grid-template-columns: 1fr; } }

        .vsr-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          display: flex; flex-direction: column;
          max-height: 420px;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .vsr-priority-section {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          display: flex; flex-direction: column;
          max-height: 420px;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .vsr-hd {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 12px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .vsr-hd-title { font-weight: 700; letter-spacing: 0.12em; font-size: 10px; color: #2563eb; text-transform: uppercase; }
        .vsr-hd-left { display: flex; align-items: center; gap: 10px; }
        .vsr-tag {
          font-size: 11px; padding: 6px 8px; border-radius: 999px;
          border: 1px solid #dbeafe; background: #eff6ff;
          color: #2563eb; white-space: nowrap; font-weight: 600;
        }
        .vsr-bd {
          padding: 12px; display: flex; flex-direction: column; gap: 10px;
          flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
        }
        .vsr-bd::-webkit-scrollbar { width: 10px; }
        .vsr-bd::-webkit-scrollbar-track { background: transparent; }
        .vsr-bd::-webkit-scrollbar-thumb { background: rgba(15,23,42,.12); border: 3px solid transparent; border-radius: 999px; background-clip: content-box; }
        .vsr-bd::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,.20); background-clip: content-box; }

        /* Loading overlay */
        .vsr-load-overlay {
          position: absolute; inset: 46px 10px 10px 10px;
          border-radius: 16px;
          border: 1px dashed rgba(15,23,42,.15);
          background: rgba(255,255,255,.85);
          display: none; align-items: center; justify-content: center;
          padding: 12px; pointer-events: none;
        }
        .vsr-loader-box {
          display: flex; gap: 12px; align-items: center;
          padding: 12px; background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px; box-shadow: 0 10px 22px rgba(0,0,0,.06); max-width: 92%;
        }
        .vsr-spinner {
          width: 26px; height: 26px; border-radius: 999px;
          border: 2px solid rgba(15,23,42,.15);
          border-top-color: rgba(15,23,42,.70);
          animation: vsr-spin 1s linear infinite; flex: 0 0 auto;
        }
        @keyframes vsr-spin { to { transform: rotate(360deg); } }
        .vsr-loader-txt { display: flex; flex-direction: column; gap: 3px; }
        .vsr-loader-txt b { font-size: 12.5px; letter-spacing: -.01em; color: #0f172a; }
        .vsr-loader-txt span { font-size: 11px; color: rgba(15,23,42,.55); line-height: 1.25; }

        /* Items */
        .vsr-item {
          border: none; border-radius: 0;
          background: transparent; padding: 10px 4px;
          display: flex; justify-content: space-between; align-items: center; gap: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .vsr-item:last-child { border-bottom: none; }
        .vsr-item-name { font-weight: 500; font-size: 13px; letter-spacing: 0; color: #374151; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-transform: uppercase; }
        .vsr-amt {
          font-size: 13px; padding: 0;
          border: none; background: transparent;
          color: #111827; white-space: nowrap; font-weight: 600;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        /* AI lines */
        .vsr-ai-line {
          display: flex; gap: 10px; align-items: flex-start;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 12px; padding: 10px;
        }
        .vsr-spark {
          width: 28px; height: 28px; border-radius: 10px;
          display: grid; place-items: center;
          border: 1px solid #dbeafe;
          background: #eff6ff; flex: 0 0 auto; font-size: 14px;
        }
        .vsr-ai-txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .vsr-ai-title-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .vsr-ai-title-row b { font-size: 12.5px; letter-spacing: -.01em; color: #0f172a; }
        .vsr-conf { font-size: 10px; color: rgba(15,23,42,.50); font-variant-numeric: tabular-nums; }
        .vsr-ai-info { font-size: 11px; color: rgba(15,23,42,.55); line-height: 1.4; font-variant-numeric: tabular-nums; }

        /* Deal library */
        .vsr-deal-library { display: flex; flex-direction: column; gap: 7px; }
        .vsr-deal-library::-webkit-scrollbar { width: 10px; }
        .vsr-deal-library::-webkit-scrollbar-track { background: transparent; }
        .vsr-deal-library::-webkit-scrollbar-thumb { background: rgba(15,23,42,.12); border: 3px solid transparent; border-radius: 999px; background-clip: content-box; }

        .vsr-scroll-container {
          display: flex; flex-direction: column; gap: 7px;
          animation: vsr-smoothScroll 2.2s linear infinite;
          filter: blur(3px); opacity: 0.5;
        }
        @keyframes vsr-smoothScroll {
          0%  { transform: translateY(0); }
          100%{ transform: translateY(-50%); }
        }

        .vsr-deal-card {
          border: 1px solid #e2e8f0; background: #fff;
          border-radius: 12px; padding: 10px;
          display: flex; flex-direction: column; gap: 6px; cursor: pointer;
          transition: all .22s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .vsr-deal-card:hover { border-color: rgba(59,130,246,.30); background: rgba(59,130,246,.03); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
        .vsr-deal-final { animation: vsr-dealSettle 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes vsr-dealSettle {
          0%  { transform: translateY(20px) scale(0.95); opacity: 0; filter: blur(4px); }
          100%{ transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
        }
        .vsr-deal-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .vsr-deal-brand { font-weight: 820; font-size: 13px; letter-spacing: -.02em; color: #0f172a; }
        .vsr-deal-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .vsr-deal-tag { font-size: 10px; padding: 4px 6px; border-radius: 999px; border: 1px solid transparent; background: #eff6ff; color: #2563eb; white-space: nowrap; font-weight: 600; }
        .vsr-deal-desc { font-size: 11.5px; color: rgba(15,23,42,.60); line-height: 1.35; }

        /* Pipeline */
        .vsr-pipeline { display: flex; flex-direction: column; gap: 7px; min-height: 0; }
        .vsr-pipeline::-webkit-scrollbar { width: 10px; }
        .vsr-pipeline::-webkit-scrollbar-track { background: transparent; }
        .vsr-pipeline::-webkit-scrollbar-thumb { background: rgba(15,23,42,.12); border: 3px solid transparent; border-radius: 999px; background-clip: content-box; }

        .vsr-section-label { font-size: 11px; font-weight: 700; color: rgba(15,23,42,.50); text-transform: uppercase; letter-spacing: .04em; padding: 6px 8px 3px; }

        /* Accordion */
        details.vsr-accord {
          border: 1px solid rgba(15,23,42,.12); background: #fff;
          border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 350px;
        }
        details.vsr-accord[open] { box-shadow: 0 12px 24px rgba(0,0,0,.08); }
        details.vsr-accord.low-priority { border: 1px solid rgba(15,23,42,.10); background: #fff; opacity: 0.65; }
        details.vsr-accord.low-priority[open] { box-shadow: 0 8px 16px rgba(0,0,0,.06); border-color: rgba(15,23,42,.15); opacity: 1; }

        .vsr-accord-sum {
          list-style: none; cursor: pointer;
          padding: 10px; display: flex; align-items: center; justify-content: space-between;
          gap: 10px; user-select: none; flex-shrink: 0;
        }
        .vsr-accord-sum::-webkit-details-marker { display: none; }
        .vsr-sum-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; flex: 1; }
        .vsr-brand-name { font-weight: 820; letter-spacing: -.02em; font-size: 13px; color: #0f172a; white-space: nowrap; }
        .vsr-pill-tag { font-size: 11px; padding: 5px 7px; border-radius: 999px; border: 1px solid #dbeafe; background: #eff6ff; color: #2563eb; white-space: nowrap; font-weight: 600; }
        .vsr-dollar-value { font-size: 12px; padding: 5px 8px; border-radius: 999px; border: 1px solid #dcfce7; background: #f0fdf4; color: #16a34a; font-weight: 720; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .vsr-sum-meta { font-size: 11px; color: rgba(15,23,42,.50); white-space: nowrap; flex-shrink: 0; }
        .vsr-caret { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; border: none; background: transparent; color: rgba(15,23,42,.40); flex: 0 0 auto; transition: transform .22s ease, background .22s ease; }
        .vsr-caret:hover { background: #f1f5f9; }
        details.vsr-accord[open] .vsr-caret, details.vsr-collapse[open] .vsr-caret { transform: rotate(180deg); }

        .vsr-accord-body { padding: 0 10px 10px; display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; min-height: 0; }
        .vsr-accord-body::-webkit-scrollbar { width: 8px; }
        .vsr-accord-body::-webkit-scrollbar-thumb { background: rgba(15,23,42,.12); border: 2px solid transparent; border-radius: 999px; background-clip: content-box; }

        .vsr-suppression { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 10px; background: #fffbeb; border: 1px solid #fde68a; }
        .vsr-sup-icon { font-size: 14px; }
        .vsr-sup-txt { font-size: 11px; color: rgba(15,23,42,.65); line-height: 1.35; }
        .vsr-deal-section { display: flex; flex-direction: column; gap: 3px; }
        .vsr-deal-label { font-size: 10px; color: rgba(15,23,42,.45); font-weight: 650; letter-spacing: .03em; text-transform: uppercase; }
        .vsr-deal-copy { font-size: 12px; color: rgba(15,23,42,.75); line-height: 1.38; }

        /* Collapse */
        .vsr-collapse { border: 1px solid rgba(15,23,42,.10); background: #fff; border-radius: 14px; overflow: hidden; }
        .vsr-collapse-sum { list-style: none; cursor: pointer; padding: 9px 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; user-select: none; font-size: 12px; font-weight: 700; color: rgba(15,23,42,.60); }
        .vsr-collapse-sum::-webkit-details-marker { display: none; }
        .vsr-collapse-body { padding: 0 8px 8px; display: flex; flex-direction: column; gap: 7px; }

        .vsr-foot { padding: 8px 6px 2px; color: rgba(15,23,42,.40); font-size: 11px; line-height: 1.35; }
        .vsr-mono { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
        .vsr-fadeIn { animation: vsr-fadeIn .35s ease both; }
        @keyframes vsr-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 767px) {
          .vsr-root { padding: 10px; border-radius: 14px; }
          .vsr-title { font-size: 16px; }
          .vsr-chip { padding: 6px 8px; font-size: 11px; }
          .vsr-pill { padding: 7px 9px; font-size: 11px; }
          .vsr-pill-icon { width: 22px; height: 22px; font-size: 12px; }
          .vsr-panel { max-height: 350px; }
          .vsr-priority-section { max-height: 350px; }
          .vsr-controls { flex-direction: column; align-items: stretch; }
          .vsr-ctrl-left { font-size: 11px; }
          .vsr-ctrl-btns { justify-content: flex-end; }
        }
      `}</style>


      <div className="vsr-root" ref={rootRef}>
        {/* Header */}
        <div className="vsr-top">
          <div className="vsr-title">Rewards Intelligence</div>
          <span className="vsr-live-badge">
            <span className="vsr-live-dot" />
            Live Demo
          </span>
        </div>

        <div className="vsr-grid">
          {/* Customer Profile */}
          <div style={{ padding: '0 0 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', color: '#2563EB', textTransform: 'uppercase' as const, display: 'block', marginBottom: 12 }}>Customer Profile</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#2563eb', fontWeight: 700, fontSize: 14 }}>JT</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>James T.</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Age 39 · Family · MA · $165K · 2 kids</p>
              </div>
            </div>
          </div>

          {/* Lifestyle pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', color: '#2563EB', textTransform: 'uppercase' as const }}>Lifestyle Indicators</span>
            <div className="vsr-pills">
              {PILL_ORDER.map((id, i) => (
                <button
                  key={id}
                  className="vsr-pill"
                  data-pill={id}
                  aria-selected={i === 0 ? "true" : "false"}
                  onClick={() => handlePillClick(id)}
                >
                  <span className="vsr-pill-icon">{PILL_ICONS[id]}</span>
                  <span>{PILL_LABELS[id]}</span>
                </button>
              ))}
            </div>
          </div>


          {/* Step indicator (hidden) */}
          <span ref={flowStepRef} style={{ display: 'none' }} />

          {/* Analysis row */}
          <div className="vsr-analysis-row">
            <div className="vsr-panel">
              <div className="vsr-hd">
                <div className="vsr-hd-title">Related Transactions</div>
                <div className="vsr-tag" ref={txHintRef}>Golf</div>
              </div>
              <div className="vsr-bd" ref={txListRef} />
              <div className="vsr-load-overlay" ref={loadTxRef}>
                <div className="vsr-loader-box">
                  <div className="vsr-spinner" />
                  <div className="vsr-loader-txt"><b>Pulling transactions</b><span>Matching merchants and context for the selected indicator.</span></div>
                </div>
              </div>
            </div>

            <div className="vsr-panel">
              <div className="vsr-hd">
                <div className="vsr-hd-title">Ventus AI Purchase Analysis</div>
                <div className="vsr-tag">tax + pricing context</div>
              </div>
              <div className="vsr-bd" ref={aiListRef} />
              <div className="vsr-load-overlay" ref={loadAiRef}>
                <div className="vsr-loader-box">
                  <div className="vsr-spinner" />
                  <div className="vsr-loader-txt"><b>Inferring item-level detail</b><span>Back-calculating pre-tax price, then matching likely SKUs &amp; bundles.</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Deals row */}
          <div className="vsr-deals-row">
            {/* Library */}
            <div className="vsr-panel">
              <div className="vsr-hd">
                <div className="vsr-hd-title">Available Deals</div>
                <div className="vsr-tag vsr-mono" ref={libraryCountRef}>0 deals</div>
              </div>
              <div className="vsr-bd">
                <div className="vsr-deal-library" ref={dealLibraryRef} />
              </div>
            </div>

            {/* Pipeline */}
            <div className="vsr-pipeline-panel">
              <div className="vsr-priority-section">
                <div className="vsr-hd">
                  <div className="vsr-hd-title" style={{ color: '#dc2626' }}>High Priority</div>
                  <div className="vsr-tag vsr-mono" ref={highCountRef}>0 deals</div>
                </div>
                <div className="vsr-bd">
                  <div className="vsr-deal-library" ref={highPriorityRef} />
                </div>
                <div className="vsr-load-overlay" ref={loadHighRef}>
                  <div className="vsr-loader-box">
                    <div className="vsr-spinner" />
                    <div className="vsr-loader-txt"><b>Personalizing deals</b><span>Matching offers to customer insights and spending patterns.</span></div>
                  </div>
                </div>
              </div>

              <div className="vsr-priority-section">
                <div className="vsr-hd">
                  <div className="vsr-hd-title" style={{ color: '#d97706' }}>Low Priority</div>
                  <div className="vsr-tag vsr-mono" ref={lowCountRef}>0 deals</div>
                </div>
                <div className="vsr-bd">
                  <div className="vsr-deal-library" ref={lowPriorityRef} />
                </div>
                <div className="vsr-load-overlay" ref={loadLowRef}>
                  <div className="vsr-loader-box">
                    <div className="vsr-spinner" />
                    <div className="vsr-loader-txt"><b>Personalizing deals</b><span>Matching offers to customer insights and spending patterns.</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", padding: "12px 0 4px", borderTop: "1px solid #e2e8f0" }}>
            <button
              ref={toggleBtnRef}
              onClick={() => {
                if (runningRef.current) { pause(); }
                else { if (cyclesRef.current >= 1) { start(); } else { runningRef.current = true; setPauseLabel("Pause"); flowTokenRef.current++; autoLoop(); } }
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 20px", fontSize: "14px", fontWeight: 500,
                color: "#9ca3af", background: "transparent", border: "none",
                borderRadius: "9999px", cursor: "pointer",
                transition: "color 0.2s, background 0.2s", height: "40px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
            >
              <span ref={pauseIconRef} style={{ display: "inline-flex" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></span>
              <span ref={pauseLabelRef}>Pause</span>
            </button>
            <button
              onClick={() => {
                highPipelineRef.current = [];
                lowPipelineRef.current = [];
                renderPipeline();
                stepIdxRef.current = 0;
                cyclesRef.current = 0;
                runningRef.current = false;
                flowTokenRef.current++;
                setPauseLabel("Pause");
                start();
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 20px", fontSize: "14px", fontWeight: 500,
                color: "#9ca3af", background: "transparent", border: "none",
                borderRadius: "9999px", cursor: "pointer",
                transition: "color 0.2s, background 0.2s", height: "40px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Replay
            </button>
          </div>
      </div>
    </>
  );
}
