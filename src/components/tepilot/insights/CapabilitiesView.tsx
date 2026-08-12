import { useEffect, useRef, useState } from "react";

import {
  Layers,
  CreditCard,
  ArrowLeftRight,
  Send,
  Smartphone,
  Gauge,
  UserCircle,
  Database,
  CalendarHeart,
  Heart,
  BadgeCheck,
  Truck,
  Building2,
  Activity,
  DollarSign,
  AlertTriangle,
  Users,
  Gift,
  Bot,
  Megaphone,
  Briefcase,
  Home,
  PiggyBank,
  Package,
  ArrowUpRight,
  ChevronDown,
  Tag,
  Sparkles,
  MessageSquare,
  Crown,
  Store,
  TrendingUp,
  Gem,
  FileText,
  Search,
  Calendar,
  LineChart,
  PieChart,
  FilePlus,
  RefreshCw,
  Filter,
  GitBranch,
  PenTool,
  ShieldCheck,
  FileCheck,
  MapPin,
  Wallet,
  Landmark,
  Receipt,
  Bell,
  Car,
  Zap,
  BarChart3,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import { BANK_PRODUCT_CATEGORIES, BANK_PRODUCT_TOTAL } from "@/lib/bankProductCatalog";

type SourceInput = {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  fcra?: boolean;
};

type SourceGroup = {
  provider: string;
  sublabel: string;
  icon: React.ElementType;
  description: string;
  inputs: SourceInput[];
  onOpen?: () => void;
  openLabel?: string;
};

type Destination = {
  label: string;
  sublabel: string;
  icon: React.ElementType;
};


type Detection = { ev: string; to: string; basis: "1P" | "Ext" | "Both" };

type SignalDetail = {
  label: string;
  icon: React.ElementType;
  color: string;
  tint: string;
  dot: string;
  description: string;
  examples: Detection[];
  items: { label: string; sublabel: string; icon?: React.ElementType }[];
};

const SIGNALS: SignalDetail[] = [
  {
    label: "Life Event",
    icon: CalendarHeart,
    color: "bg-amber-500",
    tint: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    description: "Major life-stage transitions inferred from merchant-level transaction clusters with minimum-evidence thresholds.",
    examples: [
      { ev: "Title + escrow payment", to: "Home purchase in progress", basis: "1P" },
      { ev: "OB visits + registry spend", to: "New baby, ~2 months out", basis: "1P" },
      { ev: "Bureau tradeline maturing", to: "Auto loan renewal window", basis: "Ext" },
      { ev: "Bursar deposit + college tours", to: "Dependent starting college", basis: "Both" },
    ],
    items: [
      { label: "Home Purchase", sublabel: "Realtor, title/escrow, mortgage, HOA setup, first mortgage payment" },
      { label: "New Baby", sublabel: "OB/midwife, buybuy BABY, pediatrician, daycare, hospital L&D" },
      { label: "Wedding / Engagement", sublabel: "Jeweler ($2k+), venue, bridal salon, photographer, registry" },
      { label: "College Prep (Dependent)", sublabel: "SAT/ACT/Kaplan, Common App, bursar deposits, college tours" },
      { label: "Business Formation", sublabel: "LegalZoom, Stripe Atlas, business banking, commercial leasing" },
      { label: "Elder Care", sublabel: "Assisted living, home health aide, geriatric care, hospice, DME" },
      { label: "Retirement Planning", sublabel: "Advisor fees, estate attorney, Medicare supplement, downsizing" },
      { label: "Relocation", sublabel: "Long-distance movers, vehicle shipping, extended-stay 7+ nights, new-metro utilities" },
      { label: "Inheritance / Windfall", sublabel: "Large one-time inflow paired with estate attorney or trust services" },
    ],
  },
  {
    label: "Behavioral",
    icon: Activity,
    color: "bg-blue-500",
    tint: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    description: "Recurring spending habits classified across 11 lifestyle pillars from merchant and subcategory clusters.",
    examples: [
      { ev: "4 airline + 3 hotel bookings", to: "Travel & exploration, top pillar", basis: "1P" },
      { ev: "Weekly Chewy + vet visits", to: "Pet care routine", basis: "1P" },
      { ev: "Equinox + Lululemon cadence", to: "Sports & active living", basis: "1P" },
      { ev: "Anchor flight + out-of-zip spend", to: "Trip reconstructed, 6 nights", basis: "Both" },
    ],
    items: [
      { label: "Sports & Active Living", sublabel: "Equinox, Lululemon, REI, fitness classes, team leagues" },
      { label: "Food & Dining", sublabel: "Whole Foods, Starbucks, Chipotle, delivery, meal kits" },
      { label: "Travel & Exploration", sublabel: "Flights, hotels, car rentals, tours, travel insurance" },
      { label: "Home & Living", sublabel: "Mortgage, utilities, Home Depot, furniture, commuting" },
      { label: "Style & Beauty", sublabel: "Zara, Sephora, salon, jewelry, accessories" },
      { label: "Health & Wellness", sublabel: "Doctor visits, pharmacy, therapy, spa, supplements" },
      { label: "Technology & Digital", sublabel: "Spotify, Netflix, Adobe, devices, cloud storage" },
      { label: "Family & Community", sublabel: "Childcare, gifts, religious orgs, kids activities" },
      { label: "Pets", sublabel: "Chewy, vet care, grooming, pet insurance" },
      { label: "Entertainment & Culture", sublabel: "Movies, concerts, museums, books, gaming" },
      { label: "Trip Reconstruction", sublabel: "Anchor + non-home-zip clustering into dated trips with spend breakdown" },
    ],
  },
  {
    label: "Financial",
    icon: DollarSign,
    color: "bg-emerald-500",
    tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    description: "Cash-flow, balance, and credit posture inferred from payroll, deposit, and outflow streams.",
    examples: [
      { ev: "Outbound ACH to brokerage", to: "Investable assets held away", basis: "1P" },
      { ev: "Payroll ACH, steady cadence", to: "Active primary income", basis: "1P" },
      { ev: "Mortgage servicer outflow", to: "Active mortgage payer", basis: "1P" },
      { ev: "Deposit balance trending up", to: "Growing idle cash tier", basis: "Both" },
    ],
    items: [
      { label: "Active payroll deposit", sublabel: "Recurring employer ACH on a consistent cadence" },
      { label: "Recent large inflow", sublabel: "One-off deposit well above payroll baseline (windfall, bonus)" },
      { label: "Deposit balance trending up", sublabel: "Checking and savings growing across recent statements" },
      { label: "Investable assets tier", sublabel: "Idle balances above typical operating-cash needs" },
      { label: "Funds external brokerage", sublabel: "Outbound ACH to Schwab, Fidelity, Robinhood (wallet share leak)" },
      { label: "Active mortgage payer", sublabel: "Recurring mortgage servicer outflow on file" },
      { label: "Low credit utilization", sublabel: "Headroom on existing revolving credit lines" },
      { label: "Healthy DTI", sublabel: "Debt service comfortably below underwriting thresholds" },
      { label: "Subscription stack load", sublabel: "10+ active recurring digital subscriptions" },
    ],
  },
  {
    label: "Demographic",
    icon: UserCircle,
    color: "bg-violet-500",
    tint: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    description: "Behaviorally inferred household and life-stage attributes with direct product and timing implications.",
    examples: [
      { ev: "Merchant services + wholesale", to: "Small business owner", basis: "1P" },
      { ev: "Two payroll streams, one address", to: "Dual-income household", basis: "1P" },
      { ev: "Two mortgage + HOA streams", to: "Multi-property household", basis: "Both" },
      { ev: "Quarterly estimated tax", to: "Self-employed household", basis: "1P" },
    ],
    items: [
      { label: "Likely homeowner", sublabel: "Mortgage, Home Depot/Lowe's, HOA fees" },
      { label: "Parent of young children", sublabel: "Daycare, pediatric, Carter's, infant formula volume" },
      { label: "Parent of school-age", sublabel: "Tuition, kids activities, SAT/ACT prep" },
      { label: "Dual-income household", sublabel: "Two distinct payroll streams to one household" },
      { label: "Pre-retiree / empty nester", sublabel: "Medicare supplement, downsizing, no dependent-linked spend" },
      { label: "Self-employed / 1099 household", sublabel: "Quarterly estimated tax payments, irregular platform inflows, no single employer ACH" },
      { label: "Small business owner", sublabel: "Business banking deposits, merchant-services volume, commercial insurance, wholesale suppliers" },
      { label: "Multi-property household", sublabel: "Two or more distinct mortgage, HOA, or property-tax streams" },
      { label: "Rental income earner", sublabel: "Recurring inbound rent deposits or property-management payouts" },
      { label: "Household with dependents in college", sublabel: "Bursar or tuition outflows plus 529 plan distributions" },
      { label: "High-net-worth indicator", sublabel: "Advisory fees, trust services, private-client banking outflows" },
      { label: "Recently relocated household", sublabel: "Sustained merchant footprint shift into a new metro" },
      { label: "Beneficiary reasoning", sublabel: "Spend benefits self vs. dependent vs. third-party gift" },
    ],
  },
  {
    label: "Risk",
    icon: AlertTriangle,
    color: "bg-rose-500",
    tint: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    description: "Deterministic keyword/MCC flags for Vice and Financial Distress plus model-routed AML, bucketed with severity scores.",
    examples: [
      { ev: "Deposits just under $10K", to: "AML structuring pattern", basis: "1P" },
      { ev: "Payday lender outflows", to: "Financial distress, weight 5", basis: "1P" },
      { ev: "Repeat NSF fee events", to: "Overdraft escalation", basis: "1P" },
      { ev: "Cross-border wires off-zip", to: "Suspicious international", basis: "Both" },
    ],
    items: [
      { label: "Adult entertainment", sublabel: "OnlyFans, cam sites, adult processors (CCBill/Epoch), MCC 5967" },
      { label: "Offshore gambling", sublabel: "Bovada, Stake.com, Roobet, Curaçao books (weight 5)" },
      { label: "Sports betting", sublabel: "DraftKings SB, FanDuel SB, BetMGM, PrizePicks (weight 3)" },
      { label: "Casino & table games", sublabel: "MGM, Bellagio, Foxwoods, DraftKings Casino (weight 3)" },
      { label: "Payday & short-term credit", sublabel: "ACE Cash Express, Advance America, Earnin, Dave (weight 5)" },
      { label: "Debt collection & relief", sublabel: "Portfolio Recovery, Freedom Debt Relief, bankruptcy filings (weight 5)" },
      { label: "Check cashing & money services", sublabel: "Western Union, MoneyGram, MoneyPak reloads (weight 4)" },
      { label: "Overdraft & NSF activity", sublabel: "Aggregated fee events; severity escalates at 5+" },
      { label: "Subprime credit & rent-to-own", sublabel: "Credit One, OpenSky, Rent-A-Center, DriveTime (weight 3)" },
      { label: "Crypto mixing", sublabel: "Tornado Cash, Wasabi, CoinJoin, Monero exchanges (weight 4)" },
      { label: "Suspicious international", sublabel: "Merchant contains INTL/OFFSHORE + non-US zip" },
      { label: "AML structuring", sublabel: "Multiple deposits/withdrawals just below $10K (model-routed)" },
      { label: "AML round-number layering", sublabel: "Repeated round-number cash-equivalent patterns" },
      { label: "AML cross-border wires", sublabel: "Wire patterns inconsistent with home zip" },
    ],
  },
];

type WorkflowChipKind = "signal" | "destination" | "product" | "system";
type WorkflowChip = { label: string; kind: WorkflowChipKind };
type WorkflowStep = { stage: string; text: string; chips?: WorkflowChip[] };

const SIGNAL_CHIP_TINTS: Record<string, string> = {
  "Life Event": "bg-amber-50 text-amber-700 border-amber-200",
  Behavioral: "bg-blue-50 text-blue-700 border-blue-200",
  Financial: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Demographic: "bg-violet-50 text-violet-700 border-violet-200",
  Risk: "bg-rose-50 text-rose-700 border-rose-200",
};
const CHIP_KIND_TINTS: Record<WorkflowChipKind, string> = {
  signal: "bg-slate-50 text-slate-700 border-slate-200",
  destination: "bg-slate-100 text-slate-700 border-slate-200",
  product: "bg-indigo-50 text-indigo-700 border-indigo-200",
  system: "bg-zinc-100 text-zinc-700 border-zinc-200",
};
function chipClass(chip: WorkflowChip) {
  if (chip.kind === "signal" && SIGNAL_CHIP_TINTS[chip.label]) return SIGNAL_CHIP_TINTS[chip.label];
  return CHIP_KIND_TINTS[chip.kind];
}

interface DestinationGroup {
  team: string;
  items: Destination[];
}

const DESTINATION_GROUPS: DestinationGroup[] = [
  {
    team: "Bank Leadership",
    items: [
      { label: "Intelligence Dashboard", sublabel: "Access reports, query & API", icon: BarChart3 },
      { label: "Ventus AI Coworker", sublabel: "Intelligence for very colleague, 24/7", icon: Briefcase },
    ],
  },
  {
    team: "Product & Growth",
    items: [
      { label: "Automations Campaign", sublabel: "Signal-driven personalized campaigns", icon: Megaphone },
      { label: "Custom Product Builder", sublabel: "Hyper-personalized campaigns", icon: Route },
    ],
  },
  {
    team: "Rewards and Deals",
    items: [
      { label: "Personalized Reward Program", sublabel: "Hyper-personalized CLO program", icon: Sparkles },
      { label: "Local Merchant Deals\u00a0", sublabel: "AI assisted local deal capture", icon: Smartphone },
    ],
  },
];

const ALL_DESTINATIONS = DESTINATION_GROUPS.flatMap((g) => g.items);

function Connector({ amber }: { amber?: boolean }) {
  const stroke = amber ? "#D9A441" : "#94A3B8";
  return (
    <div className="flex items-center justify-center py-3 lg:py-0" aria-hidden>
      <svg
        width="52"
        height="20"
        viewBox="0 0 52 20"
        fill="none"
        className="opacity-60 max-lg:rotate-90"
      >
        <path
          d="M2 10H43"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        <path
          d="M40 5.5L46.5 10L40 14.5"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}


function NodeCard({
  icon: Icon,
  label,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  accent?: "slate" | "indigo";
  side?: "left" | "right";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-slate-100 bg-white px-2.5 py-2.5 transition-colors hover:border-slate-200">
      <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-tight text-slate-900">{label}</div>
        <div className="mt-px truncate font-mono text-[11px] text-slate-400">{sublabel}</div>
      </div>
      <span className="flex-none rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-600">
        Live
      </span>
    </div>
  );
}

function SourceGroupCard({
  group,
  isActive,
  onSelect,
}: {
  group: SourceGroup;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = group.icon;
  const isExternal = /external/i.test(group.provider);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[10px] border bg-white px-2.5 py-2.5 text-left transition-colors",
        isActive
          ? "border-sky-300 ring-1 ring-sky-200"
          : "border-slate-100 hover:border-slate-200",
      )}
    >
      <div
        className={cn(
          "flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg",
          isExternal ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-tight text-slate-900">
          {group.provider}
        </div>
        <div className="mt-px truncate font-mono text-[11px] text-slate-400">
          {group.sublabel} · {group.inputs.length}
        </div>
      </div>
      {isExternal && (
        <span className="flex-none rounded border border-amber-200 px-1.5 py-px font-mono text-[9px] uppercase tracking-wide text-amber-600">
          Modeled
        </span>
      )}
      <span className="h-2 w-2 flex-none rounded-full bg-emerald-500" />
    </button>
  );
}



const SIGNAL_BASIS: Record<string, "First-party" | "Both" | "Modeled"> = {
  "Life Event": "Both",
  Behavioral: "First-party",
  Financial: "Both",
  Demographic: "Modeled",
  Risk: "First-party",
};

const BASIS_BADGE: Record<string, string> = {
  "First-party": "bg-sky-50 text-sky-600",
  Both: "border border-slate-200 bg-gradient-to-r from-sky-50 to-amber-50 text-slate-600",
  Modeled: "bg-amber-50 text-amber-600",
};

const BASIS_BADGE_DARK: Record<string, string> = {
  "First-party": "bg-sky-400/15 text-sky-200",
  Both: "bg-white/[0.08] text-slate-200",
  Modeled: "bg-amber-400/15 text-amber-200",
};

const DETECTION_BASIS_CLASS: Record<Detection["basis"], string> = {
  "1P": "bg-sky-400/15 text-sky-200",
  Ext: "bg-amber-400/15 text-amber-200",
  Both: "bg-white/[0.08] text-slate-200",
};

/* A single standing signal section with a rolling detection ticker. */
function SignalSection({
  signal,
  count,
  isActive,
  startDelay,
  interval,
  onSelect,
}: {
  signal: SignalDetail;
  count: string;
  isActive: boolean;
  startDelay: number;
  interval: number;
  onSelect: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let id: number;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setIdx((i) => (i + 1) % signal.examples.length);
      }, interval);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [signal.examples.length, startDelay, interval]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.classList.remove("animate-rollup");
    void el.offsetWidth;
    el.classList.add("animate-rollup");
  }, [idx]);

  const e = signal.examples[idx];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-[9px] border py-2.5 pl-3 pr-3 text-left transition-colors",
        "border-white/[0.08] bg-white/[0.045]",
        isActive ? "border-white/25 bg-white/[0.11]" : "hover:bg-white/[0.08]",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", signal.color)} />
      <span className="mb-0.5 flex items-center gap-2">
        <span
          className={cn("h-[7px] w-[7px] flex-none rounded-full ring-[3px] ring-white/10", signal.dot)}
        />
        <span className="text-[12.5px] font-semibold tracking-tight text-slate-100">{signal.label}</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-slate-400">
          <b className="font-semibold text-slate-200">{count}</b> · 24h
        </span>
      </span>
      <span className="relative mt-0.5 block h-5 overflow-hidden">
        <div ref={trackRef} className="absolute inset-x-0 top-0">
          <div className="flex h-5 items-center gap-2 text-[11.5px] leading-none text-slate-300">
            <span className="truncate font-medium text-slate-200">{e.ev}</span>
            <span className="flex-none text-[10px] text-slate-500">&rarr;</span>
            <span className="truncate text-slate-400">{e.to}</span>
            <span
              className={cn(
                "ml-auto flex-none rounded px-1.5 py-px font-mono text-[9px] tracking-wide",
                DETECTION_BASIS_CLASS[e.basis],
              )}
            >
              {e.basis}
            </span>
          </div>
        </div>
      </span>
    </button>
  );
}



function Sparkline({ points, stroke }: { points: string; stroke: string }) {
  return (
    <svg className="absolute right-4 top-4" width="60" height="22" viewBox="0 0 60 22" fill="none" aria-hidden>
      <path d={points} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({
  label,
  dot,
  value,
  foot,
  spark,
}: {
  label: string;
  dot: string;
  value: React.ReactNode;
  foot: React.ReactNode;
  spark?: { points: string; stroke: string };
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
        {label}
      </div>
      <div className="text-[27px] font-semibold leading-none tracking-tight tabular-nums text-slate-900">{value}</div>
      <div className="mt-2.5 font-mono text-[11.5px] text-slate-400">{foot}</div>
      {spark && <Sparkline points={spark.points} stroke={spark.stroke} />}
    </div>
  );
}

export function CapabilitiesView({ onOpenProducts }: { onOpenProducts?: () => void } = {}) {

  const [activeSignalLabel, setActiveSignalLabel] = useState<string | null>(null);
  const sourceGroups: SourceGroup[] = [
    {
      provider: "KYC",
      sublabel: "Identity & compliance",
      icon: UserCircle,
      description: "Verified identity, contact, and compliance attributes collected at onboarding and refreshed through periodic KYC review.",
      inputs: [
        { label: "Name, DOB, SSN", sublabel: "Core identity tuple used for identity resolution across systems", icon: UserCircle },
        { label: "Address & contact", sublabel: "Residential address, phone, and email of record", icon: MapPin },
        { label: "Document verification — ID / passport", sublabel: "Government ID scan + liveness check outcome", icon: FileCheck },
        { label: "Sanctions, PEP & watchlists", sublabel: "OFAC, PEP, and adverse-media screening status", icon: ShieldCheck },
        { label: "Employer & occupation", sublabel: "Self-reported employer and occupation from onboarding forms", icon: Briefcase },
      ],
    },
    {
      provider: "Transactions",
      sublabel: "Card, ACH, wire & digital payments",
      icon: ArrowLeftRight,
      description: "Real-time and settled payment streams across every rail the bank runs — the primary substrate for behavioral enrichment.",
      inputs: [
        { label: "Card auth & posted", sublabel: "Live authorization stream and settled postings from the card processor", icon: CreditCard },
        { label: "ACH debit / credit", sublabel: "NACHA-cleared debits and credits including recurring payroll", icon: ArrowLeftRight },
        { label: "Wires in / out", sublabel: "Domestic and international wire activity with counterparty detail", icon: Landmark },
        { label: "Zelle", sublabel: "P2P transfers with contact-level counterparties", icon: Send },
        { label: "RTP / FedNow", sublabel: "Real-time payment rails, 24/7 clearing", icon: Zap },
        { label: "Bill pay & checks", sublabel: "Scheduled bill pay and posted paper/e-check activity", icon: Receipt },
      ],
    },
    {
      provider: "Product Holdings",
      sublabel: "Customer portfolio",
      icon: Database,
      description: "Every product the customer currently holds with the bank, balances, and statement history — the portfolio view of the relationship.",
      inputs: [
        { label: "Checking & savings", sublabel: "Deposit accounts, balances, and interest posture", icon: Wallet },
        { label: "Credit & debit cards", sublabel: "Card products held, limits, and utilization", icon: CreditCard },
        { label: "Loans & mortgage", sublabel: "Auto, personal, HELOC, and mortgage servicing", icon: Home },
        { label: "Investments & brokerage", sublabel: "In-house brokerage and managed-portfolio holdings", icon: PiggyBank },
        { label: "Statements & balances", sublabel: "Historical statement cycles for balance trending", icon: FileText },
      ],
    },
    {
      provider: "Digital Banking",
      sublabel: "App & web telemetry",
      icon: Smartphone,
      description: "Behavioral telemetry from the mobile app and web banking — how customers engage with the bank's digital surface.",
      inputs: [
        { label: "App sessions & screens", sublabel: "Session duration, screen views, and navigation paths in mobile", icon: Smartphone },
        { label: "Web sessions & pages", sublabel: "Online banking session telemetry and page views", icon: Gauge },
        { label: "Search & clicks", sublabel: "In-app search terms and CTA click-through", icon: Search },
        { label: "Push & in-app notifications", sublabel: "Notifications sent, opened, and dismissed", icon: Bell },
        { label: "Feature usage & funnels", sublabel: "Feature adoption and funnel drop-off analytics", icon: Layers },
      ],
    },
    {
      provider: "Bank Context",
      sublabel: "Products, locations, org & tiers",
      icon: Package,
      description: `The bank's operational context — products, locations, organizational structure, and customer tiers — that shapes what Ventus can recommend and to whom. ${BANK_PRODUCT_TOTAL} products across the catalog.`,
      onOpen: onOpenProducts,
      openLabel: `Open Bank Context tab`,
      inputs: [
        { label: "Consumer Banking Products", sublabel: "Checking, savings, debit, credit cards, and digital wallets", icon: Wallet },
        { label: "Consumer Lending Products", sublabel: "Mortgages, auto, personal, HELOC, and student loans", icon: Home },
        { label: "Wealth & Investment Products", sublabel: "Brokerage, managed portfolios, trusts, and advisory tiers", icon: Gem },
        { label: "Locations & Hours", sublabel: "Branch network, ATM coverage, and regional operating schedules", icon: MapPin },
        { label: "Departments", sublabel: "RM assignment rules, advisor specializations, and escalation paths", icon: Users },
        { label: "Customer Segments & Tiers", sublabel: "Mass market, affluent, and private-banking thresholds", icon: Crown },
      ],
    },
    {
      provider: "External Intelligence",
      sublabel: "Credit bureau & third-party enrichment",
      icon: Gauge,
      description: "Credit bureau file plus third-party consumer enrichment covering wealth, property, demographics, auto, employment, life events, and loans & payments.",
        inputs: [
        { label: "Credit File", sublabel: "Bureau tradelines, utilization, and score", icon: Gauge, fcra: true },
        { label: "Wealth Data", sublabel: "Estimated household investable assets and net-worth tier", icon: PiggyBank, fcra: false },
        { label: "Loans & Payments", sublabel: "Auto loans, mortgage history, HELOC, and personal loan servicing", icon: Receipt, fcra: false },
        { label: "Property Data", sublabel: "Property ownership, valuation, and equity estimate", icon: Home, fcra: false },
        { label: "Interests & hobbies", sublabel: "Cooking, travel, apparel, outdoor, luxury affinities from surveys and subscriptions", icon: Heart, fcra: false },
        { label: "Demographics Data", sublabel: "Household composition, age, income band, life stage", icon: Users, fcra: false },
        { label: "Auto & VIN", sublabel: "Registered vehicles, make/model, and ownership tenure", icon: Car, fcra: false },
        { label: "Life events", sublabel: "Marriage, new child, home purchase, relocation flags", icon: Sparkles, fcra: false },
        { label: "Public records", sublabel: "Bankruptcies, liens, judgments, and UCC filings", icon: FileText, fcra: false },
        { label: "Firmographics (business owner)", sublabel: "SIC code, employee count, estimated sales volume, years in business, website", icon: Building2, fcra: false },
        { label: "Licenses & registrations", sublabel: "Pilot, hunting, boat, and driver's license history — wealth/lifestyle proxies", icon: BadgeCheck, fcra: false },
        { label: "New movers & pre-movers", sublabel: "In-market relocation signal: pre-move intent and recent-move flag", icon: Truck, fcra: false },
      ],
    },
  ];
  const totalSourceInputs = sourceGroups.reduce((n, g) => n + g.inputs.length, 0);
  const [activeSourceLabel, setActiveSourceLabel] = useState<string | null>(null);
  const activeSignal = activeSignalLabel ? SIGNALS.find((s) => s.label === activeSignalLabel) ?? null : null;
  const activeSourceGroup = activeSourceLabel
    ? sourceGroups.find((g) => g.provider === activeSourceLabel) ?? null
    : null;
  const activeSource = activeSourceGroup
    ? {
        label: activeSourceGroup.provider,
        icon: activeSourceGroup.icon,
        color: "bg-emerald-500",
        tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        description: activeSourceGroup.description,
        items: activeSourceGroup.inputs.map((i) => ({
          label: i.label,
          sublabel: i.sublabel,
          icon: i.icon,
          fcra: i.fcra,
        })),
        onOpen: activeSourceGroup.onOpen,
        openLabel: activeSourceGroup.openLabel,
      }
    : null;
  const activeDetail = activeSignal ?? activeSource;
  const activeDetailKind = activeSignal ? "Signal family" : activeSource ? "Source" : null;
  const activeDetailCountNoun = activeSignal ? "detections" : activeSource ? "inputs" : "";
  const ActiveIcon = activeDetail?.icon;
  const visibleDestinations = ALL_DESTINATIONS;
  const selectSignal = (label: string) => {
    setActiveSourceLabel(null);
    setActiveSignalLabel((prev) => (prev === label ? null : label));
  };
  const selectSource = (label: string) => {
    setActiveSignalLabel(null);
    setActiveSourceLabel((prev) => (prev === label ? null : label));
  };

  const signalRows = SIGNALS.map((s, i) => ({
    label: s.label,
    dot: s.dot,
    basis: SIGNAL_BASIS[s.label] ?? "First-party",
    detected: 640 + s.items.length * 187 + i * 53,
    confidence: [88, 76, 71, 64, 82][i % 5],
  }));
  const totalDetections = signalRows.reduce((n, r) => n + r.detected, 0);

  return (
    <div className="space-y-6">
      {/* Page head */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
            System
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-600">
              <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </h1>
          <p className="mt-1.5 max-w-[78ch] text-[13.5px] text-slate-500">
            Every data source, the intelligence core, and every activation destination in one view. One enrichment
            layer feeds every channel of record — each team reads from the same canonical customer signal.
          </p>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <span className="font-mono text-[11px] text-slate-400">Updated 12s ago</span>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0C1322] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#1a2438]"
          >
            Export
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Customers modeled"
          dot="#2563EB"
          value="418,204"
          foot={
            <span className="text-emerald-600">
              ▲ 1.2% <span className="text-slate-400">vs last week</span>
            </span>
          }
          spark={{ points: "M1 17L10 15L19 16L28 11L37 12L46 6L59 3", stroke: "#2563EB" }}
        />
        <Kpi
          label="Active signals (24h)"
          dot="#1E9E6A"
          value={totalDetections.toLocaleString()}
          foot={
            <span className="text-emerald-600">
              ▲ 340 <span className="text-slate-400">today</span>
            </span>
          }
          spark={{ points: "M1 14L10 16L19 9L28 12L37 7L46 9L59 4", stroke: "#1E9E6A" }}
        />
        <Kpi
          label="Signal confirmation"
          dot="#1E9E6A"
          value={
            <>
              73<span className="text-sm font-medium text-slate-400">%</span>
            </>
          }
          foot={<span>external proposed, first-party confirmed</span>}
        />
        <Kpi
          label="Activations routed (24h)"
          dot="#6D4AD4"
          value="6,213"
          foot={
            <span className="text-emerald-600">
              ▲ 8.4% <span className="text-slate-400">vs avg</span>
            </span>
          }
          spark={{ points: "M1 15L10 13L19 14L28 9L37 10L46 5L59 4", stroke: "#6D4AD4" }}
        />
      </div>

      {/* Section head */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
          Intelligence pipeline
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-400">
            real-time
          </span>
        </h2>
        {onOpenProducts && (
          <button
            type="button"
            onClick={onOpenProducts}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-sky-600 hover:text-sky-700"
          >
            Configure sources →
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-1.5">
        {/* Pipeline board */}
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1fr_52px_1.35fr_52px_1fr]">
          {/* Sources */}
          <div className="min-w-0 p-4">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                Data sources
              </span>
              <span className="ml-auto font-mono text-[11px] text-slate-400">
                {sourceGroups.length} groups · {totalSourceInputs}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              {sourceGroups.map((g) => (
                <SourceGroupCard
                  key={g.provider}
                  group={g}
                  isActive={activeSourceLabel === g.provider}
                  onSelect={() => selectSource(g.provider)}
                />
              ))}
            </div>
          </div>

          <Connector />

          {/* Core */}
          <div className="min-w-0 p-1.5">
            <div className="h-full overflow-hidden rounded-xl bg-gradient-to-b from-[#0E1626] to-[#131E31] p-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={ventusLogoTransparent}
                  alt="Ventus"
                  className="h-4 w-auto brightness-0 invert opacity-95"
                />
                <p className="text-sm font-semibold tracking-tight text-white">
                  Behavioral Intelligence &amp; Personalization Core
                </p>
              </div>
              <p className="mb-4 mt-1 text-[11.5px] leading-relaxed text-slate-400">
                Every input is resolved, enriched, and scored into five signal families, then routed to
                every activation channel.
              </p>

              {/* Signals column */}
              <div className="flex flex-col min-w-0">
                <div className="mb-2.5 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
                  Signals · what we detect
                </div>
                <div className="flex flex-col gap-2">
                  {SIGNALS.map((s, i) => {
                    const row = signalRows.find((r) => r.label === s.label);
                    return (
                      <SignalSection
                        key={s.label}
                        signal={s}
                        count={row ? row.detected.toLocaleString() : "—"}
                        isActive={s.label === activeSignalLabel}
                        startDelay={i * 420}
                        interval={2600 + i * 160}
                        onSelect={() => selectSignal(s.label)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Connector amber />

          {/* Destinations */}
          <div className="min-w-0 p-4">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                Activation destinations
              </span>
              <span className="ml-auto font-mono text-[11px] text-slate-400">
                {visibleDestinations.length}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              {DESTINATION_GROUPS.map((group) => (
                <div key={group.team} className="flex min-w-0 flex-col gap-2">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {group.team}
                    </span>
                    <span className="h-px flex-1 bg-slate-100" />
                  </div>
                  {group.items.map((d) => (
                    <NodeCard
                      key={d.label}
                      icon={d.icon}
                      label={d.label}
                      sublabel={d.sublabel}
                      accent="indigo"
                      side="right"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Shared detail panel — signal or application */}
        {activeDetail && ActiveIcon && (
          <div
            key={activeDetail.label}
            className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-5">
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                  activeDetail.color,
                )}
              >
                <ActiveIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    {activeDetailKind}
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-900">{activeDetail.label}</h3>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                      activeDetail.tint,
                    )}
                  >
                    {activeDetail.items.length} {activeDetailCountNoun}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1 leading-snug">
                  {activeDetail.description}
                </p>
              </div>
              {activeSource?.onOpen && (
                <button
                  type="button"
                  onClick={activeSource.onOpen}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  <span>{activeSource.openLabel ?? "Open"}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDetail.items.map((item) => {
                  const ItemIcon = (item as any).icon as React.ElementType | undefined;
                  const itemFcra = (item as any).fcra as boolean | undefined;
                  return ItemIcon ? (
                    <div
                      key={item.label}
                      className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border",
                          activeDetail.tint,
                        )}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">
                            {item.label}
                          </div>
                          {activeSourceLabel === "External Intelligence" && (
                            itemFcra ? (
                              <span className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                FCRA
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                non-FCRA
                              </span>
                            )
                          )}
                        </div>
                        <div className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                  ) : (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]",
                          activeDetail.dot,
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">
                          {item.label}
                        </div>
                        <div className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        )}

      </div>

      {/* Lower grid: signal detection + system health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[15px]">
            <h3 className="text-[13.5px] font-semibold text-slate-900">Signal detection · last 24 hours</h3>
            <span className="font-mono text-[11.5px] text-slate-400">
              confidence = external proposed, first-party confirmed
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Signal family", "Basis", "Detected", "Confirmation"].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "border-b border-slate-100 bg-slate-50/50 px-[18px] py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400",
                      i === 2 ? "text-right" : "text-left",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signalRows.map((r) => (
                <tr
                  key={r.label}
                  className="cursor-pointer hover:bg-slate-50/60"
                  onClick={() => selectSignal(r.label)}
                >
                  <td className="border-b border-slate-100 px-[18px] py-3 text-[13px] text-slate-900">
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className={cn("h-[9px] w-[9px] flex-none rounded-[3px]", r.dot)} />
                      {r.label}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-[18px] py-3">
                    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-medium", BASIS_BADGE[r.basis])}>
                      {r.basis}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-[18px] py-3 text-right font-mono text-[12.5px] tabular-nums text-slate-500">
                    {r.detected.toLocaleString()}
                  </td>
                  <td className="border-b border-slate-100 px-[18px] py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-[5px] w-[54px] overflow-hidden rounded-[3px] bg-slate-100">
                        <span
                          className="block h-full rounded-[3px]"
                          style={{
                            width: `${r.confidence}%`,
                            background: r.confidence >= 70 ? "#1E9E6A" : "#B4722A",
                          }}
                        />
                      </span>
                      <span className="w-[30px] font-mono text-[11.5px] text-slate-500">{r.confidence}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-100 bg-slate-50/50 px-[18px] py-3 text-[11.5px] leading-relaxed text-slate-400">
            Modeled attributes are proposed by external enrichment and only promoted once first-party transaction
            evidence confirms them.
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-[18px] py-[15px]">
            <h3 className="text-[13.5px] font-semibold text-slate-900">System health</h3>
            <span className="font-mono text-[11.5px] text-slate-400">all regions</span>
          </div>
          <div className="mx-3.5 mb-1 mt-3 flex items-center gap-2.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-emerald-500 text-white">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <b className="text-[13px] font-semibold text-emerald-800">All systems operational</b>
              <span className="text-[11.5px] text-emerald-700/80">
                Every source ingesting, every destination delivering
              </span>
            </div>
          </div>
          <div className="p-3.5 pt-2">
            {sourceGroups.map((g) => (
              <div
                key={g.provider}
                className="mb-2 flex items-center gap-2.5 rounded-[10px] border border-slate-100 px-2.5 py-2 last:mb-0"
              >
                <span className="h-2 w-2 flex-none rounded-full bg-emerald-500" />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-700">{g.provider}</span>
                <span className="flex-none font-mono text-[11px] text-slate-400">
                  {g.inputs.length} inputs · live
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

