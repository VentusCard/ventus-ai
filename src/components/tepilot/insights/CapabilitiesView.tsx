import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

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
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";

import { PulseDot } from "@/components/tepilot/common/PulseDot";
import type { TabValue } from "./AnalyticsContainer";

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
};

type Facing = "bank" | "consumer";

type Destination = {
  name: string;
  channel: string;
  facing: Facing;
  tab: TabValue;
  tabLabel: string;
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
    label: "Behavioral",
    icon: Activity,
    color: "bg-blue-500",
    tint: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    description:
      "Recurring spending habits classified across 11 lifestyle pillars from merchant and subcategory clusters.",
    examples: [
      { to: "Luxury goods auctioneer", ev: "Sotheby's/Christie's + high-value collectible purchases", basis: "Both" },
      { to: "Country club member", ev: "Country club dues + pro shop + course charges", basis: "1P" },
      { to: "Fine dining regular", ev: "Michelin/steakhouse reservations, $400+ dinners", basis: "1P" },
      { to: "Concert season subscriber", ev: "Symphony/opera recurring tickets", basis: "1P" },
      { to: "Bi-weekly weekend tennis", ev: "Court fees + tennis shop, every other Sat/Sun", basis: "1P" },
      { to: "Annual tropical vacationer", ev: "Caribbean/Mexico hotel + airline, Jan/Feb", basis: "Both" },
      { to: "Quarterly business traveler to Chicago", ev: "ORD flights + downtown hotels, Thu-Sun", basis: "Both" },
      { to: "Daily pre-work coffee run", ev: "Starbucks, Dunkin weekday mornings", basis: "1P" },
      { to: "Weekend date-night dine out regular", ev: "Ruth's Chris/Mastro's, Friday evenings", basis: "1P" },
      { to: "Monthly Chewy auto-ship", ev: "Recurring pet-food subscription", basis: "1P" },
      { to: "Summer outdoor-gear cycle", ev: "REI + Patagonia, spring/fall peaks", basis: "1P" },
      { to: "Saturday kids-activity parent", ev: "Sports leagues, activity centers, weekend", basis: "1P" },
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
      {
        label: "Trip Reconstruction",
        sublabel: "Anchor + non-home-zip clustering into dated trips with spend breakdown",
      },
    ],
  },
  {
    label: "Life Event",
    icon: CalendarHeart,
    color: "bg-amber-500",
    tint: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    description:
      "Major life-stage transitions inferred from merchant-level transaction clusters with minimum-evidence thresholds.",
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
      {
        label: "Relocation",
        sublabel: "Long-distance movers, vehicle shipping, extended-stay 7+ nights, new-metro utilities",
      },
      {
        label: "Inheritance / Windfall",
        sublabel: "Large one-time inflow paired with estate attorney or trust services",
      },
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
      {
        label: "Funds external brokerage",
        sublabel: "Outbound ACH to Schwab, Fidelity, Robinhood (wallet share leak)",
      },
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
    description:
      "Behaviorally inferred household and life-stage attributes with direct product and timing implications.",
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
      {
        label: "Self-employed / 1099 household",
        sublabel: "Quarterly estimated tax payments, irregular platform inflows, no single employer ACH",
      },
      {
        label: "Small business owner",
        sublabel: "Business banking deposits, merchant-services volume, commercial insurance, wholesale suppliers",
      },
      { label: "Multi-property household", sublabel: "Two or more distinct mortgage, HOA, or property-tax streams" },
      { label: "Rental income earner", sublabel: "Recurring inbound rent deposits or property-management payouts" },
      {
        label: "Household with dependents in college",
        sublabel: "Bursar or tuition outflows plus 529 plan distributions",
      },
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
    description:
      "Deterministic keyword/MCC flags for Vice and Financial Distress plus model-routed AML, bucketed with severity scores.",
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
      {
        label: "Debt collection & relief",
        sublabel: "Portfolio Recovery, Freedom Debt Relief, bankruptcy filings (weight 5)",
      },
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

/** Total 24h external signal detections — shared with the Intelligence Database KPI strip. */
export const TOTAL_SIGNAL_DETECTIONS_24H = SIGNALS.reduce(
  (n, s, i) => n + (640 + s.items.length * 187 + i * 53),
  0,
);


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

const DESTINATIONS: Destination[] = [
  { name: "Personalized Deals", channel: "Digital Banking", facing: "consumer", tab: "personalized-deals", tabLabel: "Personalized Deals" },
  { name: "Personalized Product", channel: "CRM", facing: "consumer", tab: "targeting", tabLabel: "Personalized Product" },
  { name: "Personalized Relationship", channel: "Ventus", facing: "consumer", tab: "personalized-relationship", tabLabel: "Personalized Relationship" },
  { name: "Intelligence Database", channel: "Ventus", facing: "bank", tab: "ventus-ai-dashboard", tabLabel: "Intelligence Database" },
  { name: "AI Coworker", channel: "Email", facing: "bank", tab: "wm-copilot", tabLabel: "AI Coworker" },
  { name: "Automated Flows", channel: "CRM", facing: "bank", tab: "targeting-automated-flows", tabLabel: "Automated Flows" },
  { name: "Campaign Builder", channel: "CRM", facing: "bank", tab: "targeting-campaign-builder", tabLabel: "Campaign Builder" },
];

function Connector({ amber, active = true }: { amber?: boolean; active?: boolean }) {
  const stroke = active && amber ? "#D9A441" : "#94A3B8";
  return (
    <div className={cn("flex items-center justify-center py-3 lg:py-0", !active && "opacity-40 grayscale")} aria-hidden>
      <svg width="52" height="20" viewBox="0 0 52 20" fill="none" className={cn("max-lg:rotate-90", active && "opacity-70")}>
        <path
          d="M2 10H43"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className={cn(active && "animate-flow-dash motion-reduce:animate-none")}
        />
        {active && (
          <circle
            cx="3"
            cy="10"
            r="1.9"
            fill={stroke}
            className="animate-flow-pulse motion-reduce:hidden"
            style={{ animationDelay: amber ? "0.5s" : "0s" }}
          />
        )}
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
  badge,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  badge?: string;
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
        {sublabel ? <div className="mt-px truncate font-mono text-[11px] text-slate-500">{sublabel}</div> : null}
      </div>
      {badge ? (
        <span className="flex-none rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-600">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
          {badge}
        </span>
      ) : null}
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
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        isActive
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50",
      )}
    >
      <div
        className={cn(
          "flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg",
          isExternal
            ? "bg-blue-100 text-blue-700"
            : "bg-blue-100 text-blue-700",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight text-slate-900">
          {group.provider}
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-slate-500">{group.sublabel}</div>
      </div>
      <span
        className={cn(
          "flex-none rounded-full px-2 py-0.5 text-[11px] font-medium",
          isExternal ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700",
        )}
      >
        {group.inputs.length} feeds
      </span>
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
  "First-party": "bg-sky-400/20 text-sky-100",
  Both: "bg-white/[0.12] text-slate-100",
  Modeled: "bg-amber-400/20 text-amber-100",
};

const DETECTION_BASIS_CLASS: Record<Detection["basis"], string> = {
  "1P": "bg-sky-400/20 text-sky-100",
  Ext: "bg-amber-400/20 text-amber-100",
  Both: "bg-white/[0.12] text-slate-100",
};

/* Per-family chrome for the signal cards on the dark Intelligence Core panel.
   Hues mirror the shared family palette (blue / amber / emerald / violet / rose). */
type DarkFamilyStyle = {
  surface: string;
  hover: string;
  border: string;
  activeSurface: string;
  activeBorder: string;
  chip: string;
  icon: string;
  label: string;
  bar: string;
};

const SIGNAL_DARK_STYLE: Record<string, DarkFamilyStyle> = {
  Behavioral: {
    surface: "bg-blue-600/30",
    hover: "hover:bg-blue-600/38",
    border: "border-blue-400/55",
    activeSurface: "bg-blue-600/45",
    activeBorder: "border-blue-300/70 ring-2 ring-blue-400/60",
    chip: "bg-blue-500 border border-white/20",
    icon: "text-white",
    label: "text-white",
    bar: "bg-blue-300",
  },
  "Life Event": {
    surface: "bg-amber-600/30",
    hover: "hover:bg-amber-600/38",
    border: "border-amber-400/55",
    activeSurface: "bg-amber-600/45",
    activeBorder: "border-amber-300/70 ring-2 ring-amber-400/60",
    chip: "bg-amber-500 border border-white/20",
    icon: "text-white",
    label: "text-white",
    bar: "bg-amber-300",
  },
  Financial: {
    surface: "bg-emerald-600/30",
    hover: "hover:bg-emerald-600/38",
    border: "border-emerald-400/55",
    activeSurface: "bg-emerald-600/45",
    activeBorder: "border-emerald-300/70 ring-2 ring-emerald-400/60",
    chip: "bg-emerald-500 border border-white/20",
    icon: "text-white",
    label: "text-white",
    bar: "bg-emerald-300",
  },
  Demographic: {
    surface: "bg-violet-600/30",
    hover: "hover:bg-violet-600/38",
    border: "border-violet-400/55",
    activeSurface: "bg-violet-600/45",
    activeBorder: "border-violet-300/70 ring-2 ring-violet-400/60",
    chip: "bg-violet-500 border border-white/20",
    icon: "text-white",
    label: "text-white",
    bar: "bg-violet-300",
  },
  Risk: {
    surface: "bg-rose-600/30",
    hover: "hover:bg-rose-600/38",
    border: "border-rose-400/55",
    activeSurface: "bg-rose-600/45",
    activeBorder: "border-rose-300/70 ring-2 ring-rose-400/60",
    chip: "bg-rose-500 border border-white/20",
    icon: "text-white",
    label: "text-white",
    bar: "bg-rose-300",
  },
};

const DEFAULT_DARK_STYLE: DarkFamilyStyle = {
  surface: "bg-white/[0.045]",
  hover: "hover:bg-white/[0.08]",
  border: "border-white/[0.08]",
  activeSurface: "bg-white/[0.11]",
  activeBorder: "border-white/25",
  chip: "bg-white/10 border border-white/15",
  icon: "text-slate-100",
  label: "text-white",
  bar: "bg-slate-400",
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
  const total = signal.examples.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentRowRef = useRef<HTMLSpanElement | null>(null);
  const nextRowRef = useRef<HTMLSpanElement | null>(null);
  const reduceMotion =
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    let intervalId: number;
    let cancelled = false;
    const advance = () => setIdx((current) => (current + 1) % total);

    const tick = () => {
      const track = trackRef.current;
      if (reduceMotion || !track || typeof track.animate !== "function") {
        advance();
        return;
      }
      // Roll by the exact measured row height so sub-pixel layout can't leave a fractional offset.
      const rowHeight = Math.round(currentRowRef.current?.getBoundingClientRect().height ?? 28);
      const timing: KeyframeAnimationOptions = {
        duration: 900,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards" as FillMode,
      };
      animationRef.current?.cancel();
      const roll = track.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          { transform: `translate3d(0, -${rowHeight}px, 0)` },
        ],
        timing,
      );
      animationRef.current = roll;
      roll.onfinish = () => {
        if (cancelled) return;
        // Paint the next row first, then drop the transform in the same frame.
        flushSync(advance);
        roll.cancel();
        if (animationRef.current === roll) animationRef.current = null;
      };
    };

    const start = window.setTimeout(() => {
      intervalId = window.setInterval(tick, interval);
    }, startDelay);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(intervalId);
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [total, startDelay, interval, reduceMotion]);

  const current = signal.examples[idx];
  const next = signal.examples[(idx + 1) % total];

  const renderRow = (example: SignalDetail["examples"][number], ref: React.RefObject<HTMLSpanElement>) => (
    <span ref={ref} className="flex h-10 items-center gap-2 text-[13px] leading-normal text-slate-100">
      <span className="relative z-10 truncate pb-px text-[14px] font-medium leading-normal text-white">{example.to}</span>
      <span className="relative z-0 flex-none text-[12px] leading-normal text-slate-300">&rarr;</span>
      <span className="relative z-0 truncate pb-px text-[13px] leading-normal text-slate-200">{example.ev}</span>
      <span
        className={cn(
          "relative z-10 ml-auto flex-none rounded px-1.5 py-px font-mono text-[12px] tracking-wide",
          DETECTION_BASIS_CLASS[example.basis],
        )}
      >
        {example.basis}
      </span>
    </span>
  );

  const style = SIGNAL_DARK_STYLE[signal.label] ?? DEFAULT_DARK_STYLE;
  const Icon = signal.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-[9px] border py-2 pl-3 pr-3 text-left transition-all duration-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.4)]",
        style.surface,
        style.border,
        isActive ? cn(style.activeSurface, style.activeBorder) : style.hover,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-[5px]", style.bar)} />
      <span className="mb-0 flex items-center gap-2">
        <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-[6px]", style.chip)}>
          <Icon className={cn("h-3.5 w-3.5", style.icon)} />
        </span>
        <span className={cn("text-[13px] font-semibold tracking-tight drop-shadow-sm", style.label)}>{signal.label}</span>
        <PulseDot
          colorClass={signal.dot}
          sizeClass="h-[6px] w-[6px]"
          delayMs={startDelay}
          className="rounded-full ring-[3px] ring-white/10"
        />
        <span className="ml-auto font-mono text-[11.5px] tabular-nums text-slate-200">
          <b className="font-semibold text-white">{count}</b> · 24h
        </span>
      </span>

      <span className="relative mt-0 block h-10 overflow-hidden">
        <div ref={trackRef} className="absolute inset-x-0 top-0" style={{ willChange: "transform" }}>
          {renderRow(current, currentRowRef)}
          {renderRow(next, nextRowRef)}
        </div>
      </span>
    </button>
  );
}


export function CapabilitiesView({ onNavigate }: { onNavigate?: (tab: TabValue) => void }) {
  const [activeSignalLabel, setActiveSignalLabel] = useState<string | null>(null);
  // Guided walkthrough: 0 = sources only, 1 = core live, 2 = activation live.
  const [walkStep, setWalkStep] = useState<0 | 1 | 2>(0);
  const coreLive = walkStep >= 1;
  const activationLive = walkStep >= 2;
  const goWalkStep = (next: 0 | 1 | 2) => {
    setWalkStep(next);
    if (next < 1) setActiveSignalLabel(null);
  };
  const sourceGroups: SourceGroup[] = [
    {
      provider: "Banking Core",
      sublabel: "accounts · transactions · ledger",
      icon: Landmark,
      description:
        "The bank's system-of-record spine — verified identity, every payment rail, and the full product portfolio the customer holds today.",
      inputs: [
        {
          label: "Name, DOB, SSN",
          sublabel: "Core identity tuple used for identity resolution across systems",
          icon: UserCircle,
        },
        { label: "Address & contact", sublabel: "Residential address, phone, and email of record", icon: MapPin },
        {
          label: "Document verification — ID / passport",
          sublabel: "Government ID scan + liveness check outcome",
          icon: FileCheck,
        },
        {
          label: "Sanctions, PEP & watchlists",
          sublabel: "OFAC, PEP, and adverse-media screening status",
          icon: ShieldCheck,
        },
        {
          label: "Employer & occupation",
          sublabel: "Self-reported employer and occupation from onboarding forms",
          icon: Briefcase,
        },
        {
          label: "Card auth & posted",
          sublabel: "Live authorization stream and settled postings from the card processor",
          icon: CreditCard,
        },
        {
          label: "ACH debit / credit",
          sublabel: "NACHA-cleared debits and credits including recurring payroll",
          icon: ArrowLeftRight,
        },
        {
          label: "Wires in / out",
          sublabel: "Domestic and international wire activity with counterparty detail",
          icon: Landmark,
        },
        { label: "Zelle", sublabel: "P2P transfers with contact-level counterparties", icon: Send },
        { label: "RTP / FedNow", sublabel: "Real-time payment rails, 24/7 clearing", icon: Zap },
        { label: "Bill pay & checks", sublabel: "Scheduled bill pay and posted paper/e-check activity", icon: Receipt },
        { label: "Checking & savings", sublabel: "Deposit accounts, balances, and interest posture", icon: Wallet },
        { label: "Credit & debit cards", sublabel: "Card products held, limits, and utilization", icon: CreditCard },
        { label: "Loans & mortgage", sublabel: "Auto, personal, HELOC, and mortgage servicing", icon: Home },
        {
          label: "Investments & brokerage",
          sublabel: "In-house brokerage and managed-portfolio holdings",
          icon: PiggyBank,
        },
        {
          label: "Statements & balances",
          sublabel: "Historical statement cycles for balance trending",
          icon: FileText,
        },
      ],
    },
    {
      provider: "Digital Banking",
      sublabel: "app + web telemetry",
      icon: Smartphone,
      description:
        "Behavioral telemetry from the mobile app and web banking — how customers engage with the bank's digital surface.",
      inputs: [
        {
          label: "App sessions & screens",
          sublabel: "Session duration, screen views, and navigation paths in mobile",
          icon: Smartphone,
        },
        { label: "Web sessions & pages", sublabel: "Online banking session telemetry and page views", icon: Gauge },
        { label: "Search & clicks", sublabel: "In-app search terms and CTA click-through", icon: Search },
        { label: "Push & in-app notifications", sublabel: "Notifications sent, opened, and dismissed", icon: Bell },
        { label: "Feature usage & funnels", sublabel: "Feature adoption and funnel drop-off analytics", icon: Layers },
      ],
    },
    {
      provider: "External Intelligence 1",
      sublabel: "national data partnership",
      icon: Gauge,
      description:
        "Credit bureau file plus household wealth, property, and demographic enrichment from national data partnerships.",
      inputs: [
        { label: "Credit File", sublabel: "Bureau tradelines, utilization, and score", icon: Gauge, fcra: true },
        {
          label: "Wealth Data",
          sublabel: "Estimated household investable assets and net-worth tier",
          icon: PiggyBank,
          fcra: false,
        },
        {
          label: "Loans & Payments",
          sublabel: "Auto loans, mortgage history, HELOC, and personal loan servicing",
          icon: Receipt,
          fcra: false,
        },
        {
          label: "Property Data",
          sublabel: "Property ownership, valuation, and equity estimate",
          icon: Home,
          fcra: false,
        },
        {
          label: "Demographics Data",
          sublabel: "Household composition, age, income band, life stage",
          icon: Users,
          fcra: false,
        },
      ],
    },
    {
      provider: "External Intelligence 2",
      sublabel: "national data partnership",
      icon: Sparkles,
      description: "Lifestyle, vehicle, life-event, and firmographic enrichment from national data partnerships.",
      inputs: [
        {
          label: "Interests & hobbies",
          sublabel: "Cooking, travel, apparel, outdoor, luxury affinities from surveys and subscriptions",
          icon: Heart,
          fcra: false,
        },
        {
          label: "Auto & VIN",
          sublabel: "Registered vehicles, make/model, and ownership tenure",
          icon: Car,
          fcra: false,
        },
        {
          label: "Life events",
          sublabel: "Marriage, new child, home purchase, relocation flags",
          icon: Sparkles,
          fcra: false,
        },
        {
          label: "Public records",
          sublabel: "Bankruptcies, liens, judgments, and UCC filings",
          icon: FileText,
          fcra: false,
        },
        {
          label: "Firmographics (business owner)",
          sublabel: "SIC code, employee count, estimated sales volume, years in business, website",
          icon: Building2,
          fcra: false,
        },
        {
          label: "Licenses & registrations",
          sublabel: "Pilot, hunting, boat, and driver's license history — wealth/lifestyle proxies",
          icon: BadgeCheck,
          fcra: false,
        },
        {
          label: "New movers & pre-movers",
          sublabel: "In-market relocation signal: pre-move intent and recent-move flag",
          icon: Truck,
          fcra: false,
        },
      ],
    },
  ];

  const sourceSections: { title: string; tagline: string; groups: SourceGroup[] }[] = [
    { title: "Internal signals", tagline: "Rail-agnostic transaction enrichment", groups: sourceGroups.slice(0, 2) },
    { title: "External signals", tagline: "Source-agnostic behavioral intelligence", groups: sourceGroups.slice(2, 4) },
  ];

  const totalSourceInputs = sourceGroups.reduce((n, g) => n + g.inputs.length, 0);
  const [activeSourceLabel, setActiveSourceLabel] = useState<string | null>(null);
  const activeSignal = activeSignalLabel ? (SIGNALS.find((s) => s.label === activeSignalLabel) ?? null) : null;
  const activeSourceGroup = activeSourceLabel
    ? (sourceGroups.find((g) => g.provider === activeSourceLabel) ?? null)
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
      }
    : null;
  const activeDetail = activeSignal ?? activeSource;
  const activeDetailKind = activeSignal ? "Signal family" : activeSource ? "Source" : null;
  const activeDetailCountNoun = activeSignal ? "detections" : activeSource ? "inputs" : "";
  const ActiveIcon = activeDetail?.icon;
  const visibleDestinations = DESTINATIONS;
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
  

  return (
    <div className="space-y-6">
      {/* Page head */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-row items-center gap-2.5 text-2xl font-semibold tracking-tight text-slate-900">
            Ventus AI System
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-600">
              <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-emerald-500" />
              Live
            </div>
          </h1>
          <p className="mt-1.5 whitespace-nowrap text-[14.5px] font-medium text-slate-700">
            Customer intelligence and banking personalization system with tools for analytics, growth and retention.
          </p>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <span className="font-mono text-[11px] text-slate-500">Updated 12s ago</span>
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


      <div className="bg-white border border-slate-200 rounded-2xl p-1.5">
        {/* Walkthrough control */}
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100"
          role="group"
          aria-label="Flow walkthrough steps"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goWalkStep(Math.min(2, walkStep + 1) as 0 | 1 | 2);
            if (e.key === "ArrowLeft") goWalkStep(Math.max(0, walkStep - 1) as 0 | 1 | 2);
          }}
        >
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
            Walk the flow
          </span>
          <div className="flex items-center gap-1.5">
            {(
              [
                { step: 0, label: "1 · Data sources" },
                { step: 1, label: "2 · Core" },
                { step: 2, label: "3 · Activation" },
              ] as const
            ).map(({ step, label }) => (
              <button
                key={step}
                type="button"
                onClick={() => goWalkStep(step)}
                aria-pressed={walkStep >= step}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors",
                  walkStep >= step
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => goWalkStep(Math.max(0, walkStep - 1) as 0 | 1 | 2)}
              disabled={walkStep === 0}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronDown className="h-3.5 w-3.5 rotate-90" />
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() => goWalkStep(Math.min(2, walkStep + 1) as 0 | 1 | 2)}
              disabled={walkStep === 2}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => goWalkStep(0)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Pipeline board */}
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1fr_52px_1.35fr_52px_1fr]">
          {/* Sources */}
          <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[11.5px] font-semibold uppercase tracking-wider text-blue-700">
                Data sources
              </span>
              <span className="ml-auto font-mono text-[11.5px] text-slate-500">
                2 groups · {totalSourceInputs} sources
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              {sourceSections.map((section) => {
                const isExternal = /external/i.test(section.title);
                return (
                  <div
                    key={section.title}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col gap-2.5 rounded-xl border p-2.5",
                      isExternal
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200 bg-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-[11.5px] font-semibold uppercase tracking-wider",
                          isExternal ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700",
                        )}
                      >
                        {section.title}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-slate-500">
                        {section.groups.length} sources
                      </span>
                    </div>
                    <p
                      className={cn(
                        "py-1 text-[14px] font-bold leading-snug text-slate-800",
                        isExternal ? "" : "",
                      )}
                    >
                      {section.tagline}
                    </p>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      {section.groups.map((g) => (
                        <SourceGroupCard
                          key={g.provider}
                          group={g}
                          isActive={activeSourceLabel === g.provider}
                          onSelect={() => selectSource(g.provider)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Connector active={coreLive} />

          {/* Core */}
          <div
            className={cn(
              "min-w-0 p-1.5 transition-opacity duration-300",
              !coreLive && "pointer-events-none select-none opacity-45 grayscale [&_*]:animate-none",
            )}
          >
            <div className="h-full overflow-hidden rounded-xl bg-[#141432] p-4">
              <div className="mb-3 border-b border-white/10 pb-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={ventusLogoTransparent} alt="Ventus" className="h-4 w-auto shrink-0 brightness-0 invert opacity-95" />
                  <p className="truncate text-[14px] font-semibold tracking-tight text-white">
                    Customer Intelligence Core
                  </p>
                </div>
                <p className="mt-0.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                  5 families · 233 signals · 24h
                </p>
              </div>


              {/* Signals column */}
              <div className="flex flex-col min-w-0">
                <div className="mb-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-slate-300">
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
                        startDelay={i * 900}
                        interval={3400 + i * 520}
                        onSelect={() => selectSignal(s.label)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Connector amber active={activationLive} />

          {/* Destinations */}
          <div
            className={cn(
              "flex h-full min-w-0 flex-col p-4 transition-opacity duration-300",
              !activationLive && "pointer-events-none select-none opacity-45 grayscale [&_*]:animate-none",
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[11.5px] font-semibold uppercase tracking-wider text-slate-600">
                Activation destinations
              </span>
              <span className="ml-auto text-[12px] font-medium italic text-slate-600">
                Every Customer, Every Colleague
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {visibleDestinations.map((d) => {
                const FacingIcon = d.facing === "bank" ? Landmark : Smartphone;
                const facingLabel = d.facing === "bank" ? "Bank-facing" : "Consumer-facing";
                return (
                  <div
                    key={d.name}
                    className="relative flex min-h-[44px] flex-1 items-center gap-2.5 overflow-hidden rounded-lg border border-slate-100 pl-3 pr-3"
                    title={facingLabel}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                        d.facing === "bank" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-600",
                      )}
                    >
                      <FacingIcon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-[15px] font-medium leading-tight text-slate-900">{d.name}</span>
                    {onNavigate && (
                      <button
                        type="button"
                        title={`Open ${d.tabLabel}`}
                        aria-label={`Open ${d.tabLabel}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(d.tab);
                        }}
                        className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-blue-100 hover:text-blue-600"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
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
              <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", activeDetail.color)}>
                <ActiveIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {activeDetailKind}
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-900">{activeDetail.label}</h3>
                  <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded border", activeDetail.tint)}>
                    {activeDetail.items.length} {activeDetailCountNoun}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1 leading-snug">{activeDetail.description}</p>
              </div>
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
                        <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">{item.label}</div>
                        {activeSourceLabel?.startsWith("External Intelligence") &&
                          (itemFcra ? (
                            <span className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              FCRA
                            </span>
                          ) : (
                            <span className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              non-FCRA
                            </span>
                          ))}
                      </div>
                      <div className="text-[11.5px] text-slate-600 leading-snug mt-0.5">{item.sublabel}</div>
                    </div>
                  </div>
                ) : (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]", activeDetail.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">{item.label}</div>
                      <div className="text-[11.5px] text-slate-600 leading-snug mt-0.5">{item.sublabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
