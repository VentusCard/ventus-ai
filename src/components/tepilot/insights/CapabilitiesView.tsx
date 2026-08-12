import { useId, useState } from "react";

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


type SignalDetail = {
  label: string;
  icon: React.ElementType;
  color: string;
  tint: string;
  dot: string;
  description: string;
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

type TeamDetail = {
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  color: string;
  tint: string;
  dot: string;
  description: string;
  items: { label: string; sublabel: string; icon?: React.ElementType }[];
  workflow?: WorkflowStep[];
};

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

const TEAMS: TeamDetail[] = [
  {
    label: "Product & Growth",
    icon: TrendingUp,
    color: "bg-violet-500",
    tint: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    description: "Product marketing team owning adoption funnels, cross-sell health, and go-to-market briefs across the retail banking portfolio.",
    items: [
      { label: "Product adoption funnel review", sublabel: "Track application-to-funding rates and drop-off by segment", icon: Filter },
      { label: "Cross-sell pipeline health", sublabel: "Monitor qualified-opportunity volume from signal-driven triggers", icon: GitBranch },
      { label: "Campaign performance & sizing", sublabel: "Validate segment size, response rate, and revenue lift", icon: PieChart },
      { label: "Go-to-market brief creation", sublabel: "Package product rationale, target criteria, and channel plan", icon: FilePlus },
      { label: "Segment validation & feedback", sublabel: "Close the loop with CRM and digital on actual conversion outcomes", icon: RefreshCw },
    ],
    workflow: [
      {
        stage: "Life Event + Financial signals in",
        text: "New home, new baby, retirement, payroll growth, and wallet-share leaks flag cross-sell moments.",
        chips: [
          { label: "Life Event", kind: "signal" },
          { label: "Financial", kind: "signal" },
        ],
      },
      {
        stage: "Map signal → eligible product",
        text: "Join each signal against the Bank Product catalog — the single source of truth for what's offered.",
        chips: [{ label: "Bank Product", kind: "product" }],
      },
      {
        stage: "Eligibility & demographic fit",
        text: "Filter by income band, account tenure, and regional product availability.",
        chips: [{ label: "Demographic", kind: "signal" }],
      },
      {
        stage: "Risk gate",
        text: "Suppress new credit pushes for customers in distress or under active risk review.",
        chips: [{ label: "Risk", kind: "signal" }],
      },
      {
        stage: "Brief + cross-sell distribution",
        text: "Go-to-market briefs route to CRM, marketing automation, and the in-app assistant.",
        chips: [
          { label: "CRM", kind: "destination" },
          { label: "Marketing Automation", kind: "destination" },
          { label: "AI Banking Assistant", kind: "destination" },
        ],
      },
    ],
  },
  {
    label: "Wealth & Relationship",
    icon: Gem,
    color: "bg-amber-500",
    tint: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    description: "Private banking and advisory operations team preparing client briefings, life-event timing, and portfolio-aware talking points for relationship managers.",
    items: [
      { label: "High-net-worth client segmentation", sublabel: "Tier clients by AUM signals, investable assets, and outbound flows", icon: Crown },
      { label: "Advisor meeting-prep briefs", sublabel: "One-page AI briefs covering posture, events, and conversation hooks", icon: FileText },
      { label: "Life-event outreach timing", sublabel: "Trigger advisor check-ins at inheritance, retirement, or business sale", icon: CalendarHeart },
      { label: "Portfolio-context summaries", sublabel: "Surface wallet-share leaks and win-back opportunities", icon: Briefcase },
      { label: "RM workflow distribution", sublabel: "Route briefs and follow-ups to the right relationship manager", icon: Send },
    ],
    workflow: [
      {
        stage: "Life Event + Financial signals in",
        text: "Inheritance, retirement, business sale, and outbound brokerage flows surface the moments that matter for advisors.",
        chips: [
          { label: "Life Event", kind: "signal" },
          { label: "Financial", kind: "signal" },
        ],
      },
      {
        stage: "HNW client identification",
        text: "Segment by investable-asset tier and wallet-share posture to scope the advisor's book.",
      },
      {
        stage: "Portfolio-aware brief assembly",
        text: "One-page advisor brief: client posture, active events, talking points, and win-back hooks.",
      },
      {
        stage: "Compliance & demographic context",
        text: "Layer in tenure and AUM tier; exclude clients under any open risk review.",
        chips: [
          { label: "Demographic", kind: "signal" },
          { label: "Risk", kind: "signal" },
        ],
      },
      {
        stage: "Route to relationship manager",
        text: "Brief and follow-up tasks land in the advisor console and CRM queue for the right RM.",
        chips: [
          { label: "AI Coworker", kind: "destination" },
          { label: "CRM", kind: "destination" },
        ],
      },
    ],
  },
  {
    label: "Deals & Rewards",
    icon: Store,
    color: "bg-orange-500",
    tint: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    description: "Rewards team curating personalized offers, managing the live deal catalog, and driving engagement through digital banking and marketing channels.",
    items: [
      { label: "Offer catalog curation", sublabel: "Assemble and maintain personalized deal collections by lifestyle and life event", icon: Package },
      { label: "Deal personalization & ranking", sublabel: "Re-rank offers using financial tier and demographic context", icon: Tag },
      { label: "Seasonal campaign alignment", sublabel: "Time offer pushes to holidays, travel windows, and life events", icon: Calendar },
      { label: "Redemption & engagement tracking", sublabel: "Monitor take rates, redemption velocity, and merchant-funded liability", icon: LineChart },
      { label: "Rewards rail distribution", sublabel: "Ship individualized offer sets to the rewards provider and digital banking", icon: Send },
    ],
    workflow: [
      {
        stage: "Behavioral & Life Event signals in",
        text: "Each customer arrives with their behavioral clusters (golf, coffee runs, ski trips) and active life events (new home, new baby).",
        chips: [
          { label: "Behavioral", kind: "signal" },
          { label: "Life Event", kind: "signal" },
        ],
      },
      {
        stage: "Curate deal collection",
        text: "Assemble a deal set per behavioral cluster and per life event from the merchant partner catalog.",
      },
      {
        stage: "Personalize ranking",
        text: "Re-rank offers using Financial tier and Demographic context — Luxury, income band, region.",
        chips: [
          { label: "Financial", kind: "signal" },
          { label: "Demographic", kind: "signal" },
        ],
      },
      {
        stage: "Risk exclusion pass",
        text: "Drop offers adjacent to vice, gambling, or distress signals for that specific customer.",
        chips: [{ label: "Risk", kind: "signal" }],
      },
      {
        stage: "Push to rewards rails",
        text: "Individualized offer set ships to the rewards provider and surfaces in digital banking.",
        chips: [
          { label: "Rewards Provider", kind: "destination" },
          { label: "Digital Banking App", kind: "destination" },
        ],
      },
    ],
  },
];

const DESTINATIONS: Destination[] = [
  { label: "Digital Banking App", sublabel: "Mobile + Web", icon: Smartphone },
  { label: "Marketing Automation", sublabel: "Marketing Cloud / Braze", icon: Megaphone },
  { label: "CRM", sublabel: "Salesforce Financial Cloud", icon: Users },
  { label: "Rewards Provider", sublabel: "Kard, etc", icon: Gift },
  { label: "AI Banking Assistant", sublabel: "In-app Copilot", icon: Bot },
  { label: "AI Coworker", sublabel: "Every team, 24/7", icon: Briefcase },
];

function getTeamDestinations(teamLabel: string): string[] {
  const team = TEAMS.find((t) => t.label === teamLabel);
  if (!team || !team.workflow) return [];
  const dests = new Set<string>();
  for (const step of team.workflow) {
    for (const chip of step.chips ?? []) {
      if (chip.kind === "destination") dests.add(chip.label);
    }
  }
  dests.add("Digital Banking App");
  return Array.from(dests);
}

function NetworkWires({ leftCount, rightCount, centered }: { leftCount: number; rightCount: number; centered?: boolean }) {
  const gradId = useId().replace(/:/g, "");
  const SRC_X = 0;
  const CORE_LEFT = 38;
  const CORE_RIGHT = 62;
  const DST_X = 100;

  const leftYs = Array.from({ length: leftCount }, (_, i) => ((i + 0.5) / leftCount) * 100);
  let rightYs: number[];
  if (centered && rightCount > 0) {
    const blockHeight = Math.min(72, Math.max(24, rightCount * 12));
    const startY = (100 - blockHeight) / 2;
    rightYs = Array.from({ length: rightCount }, (_, i) => startY + ((i + 0.5) / rightCount) * blockHeight);
  } else {
    rightYs = Array.from({ length: rightCount }, (_, i) => ((i + 0.5) / rightCount) * 100);
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`flow-${gradId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
      </defs>

      {leftYs.map((y, i) => (
        <g key={`L${i}`}>
          <path
            d={`M ${SRC_X} ${y} C ${(SRC_X + CORE_LEFT) / 2} ${y}, ${(SRC_X + CORE_LEFT) / 2} 50, ${CORE_LEFT} 50`}
            fill="none"
            stroke={`url(#flow-${gradId})`}
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeDasharray="1.4 1.8"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-12"
              dur="2.6s"
              begin={`${(i * 0.18).toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </path>
        </g>
      ))}

      {rightYs.map((y, i) => (
        <g key={`R${i}`}>
          <path
            d={`M ${CORE_RIGHT} 50 C ${(CORE_RIGHT + DST_X) / 2} 50, ${(CORE_RIGHT + DST_X) / 2} ${y}, ${DST_X} ${y}`}
            fill="none"
            stroke={`url(#flow-${gradId})`}
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeDasharray="1.4 1.8"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-12"
              dur="2.6s"
              begin={`${(i * 0.22 + 0.4).toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </path>
        </g>
      ))}

      {leftYs.map((y, i) => (
        <circle key={`pl${i}`} cx={CORE_LEFT} cy={50} r="0.5" fill="#6366f1" vectorEffect="non-scaling-stroke" />
      ))}
      {rightYs.map((y, i) => (
        <circle key={`pr${i}`} cx={CORE_RIGHT} cy={50} r="0.5" fill="#6366f1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function NodeCard({
  icon: Icon,
  label,
  sublabel,
  accent = "slate",
  side,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  accent?: "slate" | "indigo";
  side: "left" | "right";
}) {
  const accentClass =
    accent === "indigo"
      ? "bg-indigo-50 text-indigo-600 border-indigo-100"
      : "bg-slate-100 text-slate-600 border-slate-200";
  const hoverBorder = accent === "indigo" ? "hover:border-indigo-300" : "hover:border-emerald-300";

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm transition-colors",
        hoverBorder,
      )}
    >
      <div className={cn("flex items-center justify-center w-7 h-7 rounded-md shrink-0 border", accentClass)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{label}</div>
        <div className="text-[10.5px] text-slate-500 leading-tight truncate mt-0.5">{sublabel}</div>
      </div>
      <span
        className={cn(
          "absolute top-1.5 w-1.5 h-1.5 rounded-full",
          side === "left" ? "right-2 bg-emerald-500" : "left-2 bg-emerald-500",
          "animate-pulse",
        )}
      />
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-lg border bg-white shadow-sm transition-all",
        isActive
          ? "border-emerald-400 ring-2 ring-emerald-200 shadow-md scale-[1.01]"
          : "border-slate-200 hover:border-emerald-300",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-md shrink-0 border",
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-100 text-slate-600 border-slate-200",
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-slate-900 leading-tight truncate">
          {group.provider}
        </div>
        <div className="text-[10.5px] text-slate-500 leading-tight truncate mt-0.5">
          {group.sublabel} · {group.inputs.length} input{group.inputs.length === 1 ? "" : "s"}
        </div>
      </div>
      <span className="absolute top-1.5 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
        {group.inputs.length}
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
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
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
  const [activeTeamLabel, setActiveTeamLabel] = useState<string | null>(null);
  const activeSignal = activeSignalLabel ? SIGNALS.find((s) => s.label === activeSignalLabel) ?? null : null;
  const activeTeam = activeTeamLabel
    ? TEAMS.find((t) => t.label === activeTeamLabel) ?? null
    : null;
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
  const activeDetail = activeSignal ?? activeTeam ?? activeSource;
  const activeDetailKind = activeSignal
    ? "Signal family"
    : activeTeam
    ? "Team"
    : activeSource
    ? "Source"
    : null;
  const activeDetailCountNoun = activeSignal
    ? "detections"
    : activeTeam
    ? "responsibilities"
    : activeSource
    ? "inputs"
    : "";
  const ActiveIcon = activeDetail?.icon;
  const visibleDestinations = activeTeamLabel
    ? DESTINATIONS.filter((d) => getTeamDestinations(activeTeamLabel).includes(d.label))
    : DESTINATIONS;
  const selectSignal = (label: string) => {
    setActiveTeamLabel(null);
    setActiveSourceLabel(null);
    setActiveSignalLabel((prev) => (prev === label ? null : label));
  };
  const selectTeam = (label: string) => {
    setActiveSignalLabel(null);
    setActiveSourceLabel(null);
    setActiveTeamLabel((prev) => (prev === label ? null : label));
  };
  const selectSource = (label: string) => {
    setActiveSignalLabel(null);
    setActiveTeamLabel(null);
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
          label="Connected sources"
          dot="#2563EB"
          value={String(totalSourceInputs)}
          foot={`${sourceGroups.length} provider groups`}
          spark={{ points: "M1 17L10 15L19 16L28 11L37 12L46 6L59 3", stroke: "#2563EB" }}
        />
        <Kpi
          label="Signal families"
          dot="#1E9E6A"
          value={String(SIGNALS.length)}
          foot="life event · behavioral · financial · demographic · risk"
        />
        <Kpi
          label="Detections (24h)"
          dot="#1E9E6A"
          value={totalDetections.toLocaleString()}
          foot="classified across all rails"
          spark={{ points: "M1 14L10 16L19 9L28 12L37 7L46 9L59 4", stroke: "#1E9E6A" }}
        />
        <Kpi
          label="Activation destinations"
          dot="#6D4AD4"
          value={String(DESTINATIONS.length)}
          foot={`${TEAMS.length} internal teams activating`}
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

      <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-6">
        {/* Column headers */}
        <div className="grid grid-cols-[220px_minmax(360px,1fr)_220px] gap-5 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Data sources
            </span>
            <span className="ml-auto font-mono text-[11px] text-slate-400">
              {sourceGroups.length} groups · {totalSourceInputs}
            </span>
          </div>
          <div className="text-center min-w-0">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
              Ventus AI intelligence core
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Activation destinations
            </span>
            <span className="ml-auto font-mono text-[11px] text-slate-400">{DESTINATIONS.length}</span>
          </div>
        </div>


        {/* Network canvas */}
        <div className="relative">
          <NetworkWires leftCount={sourceGroups.length} rightCount={visibleDestinations.length} centered={!!activeTeamLabel} />

          <div className="relative z-10 grid grid-cols-[220px_minmax(360px,1fr)_220px] gap-5 items-stretch overflow-hidden">
            {/* Sources */}
            <div className="flex min-w-0 flex-col gap-2 justify-around px-1">
              {sourceGroups.map((g) => (
                <SourceGroupCard
                  key={g.provider}
                  group={g}
                  isActive={activeSourceLabel === g.provider}
                  onSelect={() => selectSource(g.provider)}
                />
              ))}
            </div>

            {/* Core */}
            <div className="flex min-w-0 items-center justify-center overflow-hidden">
              <div
                className="w-full max-w-[520px] rounded-2xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-indigo-900 p-4 shadow-xl mx-auto overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 0 6px rgba(99,102,241,0.08), 0 25px 60px -15px rgba(30,58,138,0.5), 0 0 80px rgba(99,102,241,0.25)",
                }}
              >
                <div className="flex flex-col items-center text-center pb-4 border-b border-white/15">
                  <img
                    src={ventusLogoTransparent}
                    alt="Ventus"
                    className="h-6 w-auto brightness-0 invert opacity-95"
                  />
                  <p className="text-[15px] font-bold text-white mt-2">Behavioral Intelligence & Personalization Core</p>
                  <p className="text-[10px] text-blue-200/80 mt-1">
                    &nbsp;
                  </p>
                </div>

                {/* Inner 2-band grid: signals → applications */}
                <div className="relative mt-4 grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] gap-1 items-stretch">
                  {/* Signals column — cool indigo "what we detect" */}
                  <div className="flex flex-col min-w-0 rounded-lg bg-gradient-to-b from-indigo-500/15 to-transparent p-2 -m-1">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-indigo-200">
                        Signals · what we detect
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 px-1">
                      {SIGNALS.map((s) => {
                        const Icon = s.icon;
                        const isActive = s.label === activeSignalLabel;
                        return (
                          <button
                            type="button"
                            key={s.label}
                            onClick={() => selectSignal(s.label)}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-left transition-all min-w-0 w-full",
                              "bg-white/5 border-indigo-300/25 text-indigo-50",
                              isActive
                                ? "ring-2 ring-indigo-200/70 bg-white/10 shadow-lg scale-[1.02]"
                                : "opacity-85 hover:opacity-100 hover:bg-white/10",
                            )}
                          >
                            <div className={cn("flex items-center justify-center w-5 h-5 rounded shrink-0", s.color)}>
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="min-w-0 text-[11px] font-semibold flex-1 truncate">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manifold bus connector */}
                  <div className="relative">
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="core-bus-in" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(165,180,252,0.55)" />
                          <stop offset="100%" stopColor="rgba(224,231,255,0.85)" />
                        </linearGradient>
                        <linearGradient id="core-bus-out" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(253,230,138,0.85)" />
                          <stop offset="100%" stopColor="rgba(252,211,77,0.55)" />
                        </linearGradient>
                        <linearGradient id="core-bus-bar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(165,180,252,0.8)" />
                          <stop offset="100%" stopColor="rgba(252,211,77,0.8)" />
                        </linearGradient>
                        <filter id="bus-glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Inbound stubs: signal row → bus (x=50) */}
                      {SIGNALS.map((s, i) => {
                        const y = ((i + 0.5) / SIGNALS.length) * 100;
                        const active =
                          s.label === activeSignalLabel || activeTeamLabel !== null;
                        return (
                          <path
                            key={`in-${i}`}
                            d={`M 0 ${y} C 28 ${y}, 28 50, 50 50`}
                            fill="none"
                            stroke={active ? "rgba(255,255,255,0.95)" : "url(#core-bus-in)"}
                            strokeWidth={active ? 1.75 : 1}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            style={{ transition: "stroke 200ms, stroke-width 200ms" }}
                          />
                        );
                      })}

                      {/* Vertical bus bar */}
                      <line
                        x1="50"
                        y1="10"
                        x2="50"
                        y2="90"
                        stroke="url(#core-bus-bar)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        filter="url(#bus-glow)"
                      />
                      {/* (removed flowing dashed overlay) */}


                      {/* Center hub */}
                      <circle cx="50" cy="50" r="2.2" fill="rgba(255,255,255,0.95)" filter="url(#bus-glow)">
                        <animate
                          attributeName="r"
                          values="2.2;2.8;2.2"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Outbound stubs: bus → team row */}
                      {TEAMS.map((t, j) => {
                        const y = ((j + 0.5) / TEAMS.length) * 100;
                        const active =
                          t.label === activeTeamLabel || activeSignalLabel !== null;
                        return (
                          <path
                            key={`out-${j}`}
                            d={`M 50 50 C 72 ${y}, 72 ${y}, 100 ${y}`}
                            fill="none"
                            stroke={active ? "rgba(255,255,255,0.95)" : "url(#core-bus-out)"}
                            strokeWidth={active ? 1.75 : 1}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            style={{ transition: "stroke 200ms, stroke-width 200ms" }}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Teams column — warm amber "who we serve" */}
                  <div className="flex flex-col min-w-0 rounded-lg bg-gradient-to-b from-amber-400/15 to-transparent p-2 -m-1">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-200">
                        Teams · who we serve
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 px-1">
                      {TEAMS.map((t) => {
                        const Icon = t.icon;
                        const isActive = t.label === activeTeamLabel;
                        return (
                          <button
                            type="button"
                            key={t.label}
                            onClick={() => selectTeam(t.label)}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-left transition-all min-w-0 w-full flex-1",
                              "bg-white/10 border-amber-300/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                              isActive
                                ? "ring-2 ring-amber-200/70 bg-white/20 shadow-lg scale-[1.02]"
                                : "opacity-90 hover:opacity-100 hover:bg-white/15",
                            )}
                          >
                            <div className={cn("flex items-center justify-center w-5 h-5 rounded shrink-0", t.color)}>
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="min-w-0 text-[11px] font-semibold flex-1 truncate">
                              {t.shortLabel ?? t.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinations */}
            <div className={cn(
              "flex min-w-0 flex-col gap-2 px-1",
              activeTeamLabel ? "justify-center" : "justify-around"
            )}>
              {visibleDestinations.map((d) => (
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


            {activeTeam?.workflow && activeTeam.workflow.length > 0 && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50/60 p-4 flex-1 flex flex-col min-h-[280px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                    Workflow · left to right
                  </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-2 flex-1">
                  {activeTeam.workflow.map((step, i) => (
                    <div key={step.stage} className="flex lg:flex-1 items-stretch gap-2">
                      <div className="flex-1 rounded-md border border-slate-200 bg-white p-5 min-w-0 h-full flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-700 leading-tight">
                            {step.stage}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-600 leading-snug">{step.text}</p>
                        {step.chips && step.chips.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.chips.map((chip) => (
                              <span
                                key={chip.label}
                                className={cn(
                                  "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                                  chipClass(chip),
                                )}
                              >
                                {chip.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {i < activeTeam.workflow!.length - 1 && (
                        <div className="hidden lg:flex items-center text-slate-300 text-sm shrink-0">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!activeTeam && (
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
            )}
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

