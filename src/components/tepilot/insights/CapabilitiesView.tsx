import { useId, useState } from "react";
import { TabHeader } from "./TabHeader";
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
  Activity,
  DollarSign,
  AlertTriangle,
  Users,
  Gift,
  Bot,
  Megaphone,
  Briefcase,
  ShieldAlert,
  Home,
  PiggyBank,
  Package,
  ArrowUpRight,
  ChevronDown,
  BarChart3,
  Tag,
  Sparkles,
  MessageSquare,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import { BANK_PRODUCT_CATEGORIES, BANK_PRODUCT_TOTAL } from "@/lib/bankProductCatalog";

type SourceInput = {
  label: string;
  icon: React.ElementType;
  nonFcra?: boolean;
};

type SourceGroup = {
  provider: string;
  sublabel: string;
  icon: React.ElementType;
  inputs: SourceInput[];
  onOpen?: () => void;
  openLabel?: string;
};

type Destination = {
  label: string;
  sublabel: string;
  icon: React.ElementType;
};

const SOURCE_GROUPS: SourceGroup[] = [
  {
    provider: "Core Banking",
    sublabel: "FIS",
    icon: Database,
    inputs: [
      { label: "KYC & Profile", icon: UserCircle },
      { label: "ACH & Wires", icon: ArrowLeftRight },
      { label: "Deposits & Statements", icon: Database },
    ],
  },
  {
    provider: "Card Processor",
    sublabel: "Fiserv",
    icon: CreditCard,
    inputs: [{ label: "Card Transactions", icon: CreditCard }],
  },
  {
    provider: "Payments Network",
    sublabel: "Early Warning Services",
    icon: Send,
    inputs: [{ label: "Zelle", icon: Send }],
  },
  {
    provider: "Digital Banking",
    sublabel: "App & web telemetry",
    icon: Smartphone,
    inputs: [{ label: "Digital Telemetry", icon: Smartphone }],
  },
  {
    provider: "Credit Bureau",
    sublabel: "Experian / TransUnion",
    icon: Gauge,
    inputs: [
      { label: "Credit File", icon: Gauge },
      { label: "Wealth Data", icon: PiggyBank, nonFcra: true },
      { label: "Property Data", icon: Home, nonFcra: true },
      { label: "Demographics Data", icon: Users, nonFcra: true },
    ],
  },
];

const TOTAL_SOURCE_INPUTS = SOURCE_GROUPS.reduce((n, g) => n + g.inputs.length, 0);

type SignalDetail = {
  label: string;
  icon: React.ElementType;
  color: string;
  tint: string;
  dot: string;
  description: string;
  items: { label: string; sublabel: string }[];
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
    description: "Household and life-stage attributes inferred from spend patterns, going beyond KYC fields.",
    items: [
      { label: "Age range", sublabel: "18–24 · 25–34 · 35–44 · 45–54 · 55–64 · 65+" },
      { label: "Income band", sublabel: "<$50K · $50–100K · $100–150K · $150K+ (payroll + spend volume)" },
      { label: "Region", sublabel: "Northeast · Southeast · Midwest · Southwest · West · Northwest" },
      { label: "Account tenure", sublabel: "New (<1y), Established (1–5y), Loyal (5+y)" },
      { label: "Likely homeowner", sublabel: "Mortgage, Home Depot/Lowe's, HOA fees" },
      { label: "Parent of young children", sublabel: "Daycare, pediatric, Carter's, infant formula volume" },
      { label: "Parent of school-age", sublabel: "Tuition, kids activities, SAT/ACT prep" },
      { label: "Dual-income household", sublabel: "Two distinct payroll streams to one household" },
      { label: "Pre-retiree / empty nester", sublabel: "Medicare supplement, downsizing, no dependent-linked spend" },
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

type ApplicationDetail = {
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  color: string;
  tint: string;
  dot: string;
  description: string;
  items: { label: string; sublabel: string }[];
};

const APPLICATIONS: ApplicationDetail[] = [
  {
    label: "Analytics & Targeting",
    icon: BarChart3,
    color: "bg-indigo-500",
    tint: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    description: "Self-serve analytics console for ad-hoc business questions and segment building, powered by the same enriched signal layer.",
    items: [
      { label: "AI-assisted SQL", sublabel: "Natural language → SQL → results, grounded in the Ventus schema" },
      { label: "Pre-built reports library", sublabel: "15+ ready-to-run reports across Lifestyle, Outflow, Retention, Opportunities" },
      { label: "Cohort CSV export", sublabel: "Any query result can be rewritten to a DISTINCT customer_id list for activation" },
      { label: "Per-segment cohort export", sublabel: "GROUP BY results split into per-segment cohorts for targeting" },
      { label: "AI takeaway + email summary", sublabel: "Business-friendly interpretation of every result, shareable inline" },
    ],
  },
  {
    label: "Next-Offer",
    icon: Tag,
    color: "bg-emerald-500",
    tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    description: "Personalized deal and reward recommendations matched to lifestyle pillars, recent behavior, and local context.",
    items: [
      { label: "Lifestyle-matched deals", sublabel: "Offers selected from the active rewards catalog using dominant pillars" },
      { label: "Local experiences", sublabel: "City-aware perks ranked by detected travel destinations and home metro" },
      { label: "Behavioral re-ranking", sublabel: "Recency, frequency, and tier signals reorder the top picks per customer" },
      { label: "Vaguely-specific copy", sublabel: "AI-generated headlines that feel hand-picked without exposing transaction detail" },
      { label: "Channel-ready payloads", sublabel: "Hero card + collection feed for mobile, web, and rewards provider APIs" },
    ],
  },
  {
    label: "Next-Product",
    icon: Sparkles,
    color: "bg-violet-500",
    tint: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    description: "Lifecycle-aware product recommendations triggered by life events, financial posture, and behavioral tier.",
    items: [
      { label: "Product catalog mapping", sublabel: "HELOC, 529, Wealth, Auto, Mortgage, HYSA, Travel Card, SBL, Term Life" },
      { label: "Life-event triggers", sublabel: "Home purchase, new baby, college prep, retirement, business formation" },
      { label: "Financial-posture gates", sublabel: "Investable-assets tier, DTI, low utilization, payroll cadence" },
      { label: "Behavioral evidence per match", sublabel: "Specific transaction clusters justify each product recommendation" },
      { label: "Automated flows + Campaign Builder", sublabel: "Product-first segments routed to marketing automation and CRM" },
    ],
  },
  {
    label: "Next-Conversation (Regular)",
    shortLabel: "Next-Conversation",
    icon: MessageSquare,
    color: "bg-amber-500",
    tint: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    description: "Branch and contact-center talking points for everyday customers, surfaced when a customer is already on the line.",
    items: [
      { label: "10-word AI action items", sublabel: "Tight, decision-ready prompts for the next interaction" },
      { label: "Outreach pointers", sublabel: "Why this customer, why now, what to mention first" },
      { label: "Behavioral context summary", sublabel: "Dominant pillars + recent activity without exposing raw transactions" },
      { label: "Life-event acknowledgements", sublabel: "Cues to congratulate or check in on detected life moments" },
      { label: "AI Banking Assistant handoff", sublabel: "Same context available to the in-app copilot for self-service" },
    ],
  },
  {
    label: "Next-Conversation (Wealth)",
    shortLabel: "Next-Conversation · Wealth",
    icon: Crown,
    color: "bg-rose-500",
    tint: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    description: "Relationship-manager copilot for high-net-worth clients: portfolio context, life-event prep, and meeting briefs.",
    items: [
      { label: "Meeting prep brief", sublabel: "One-page AI briefing covering posture, events, and conversation hooks" },
      { label: "Wallet-share intelligence", sublabel: "Outbound flows to Schwab, Fidelity, Robinhood flagged for win-back" },
      { label: "Life-event windows", sublabel: "Inheritance, business sale, retirement signals timed for advisor outreach" },
      { label: "Portfolio-aware suggestions", sublabel: "Asset-tier and posture signals matched to wealth products" },
      { label: "Financial Planning workspace", sublabel: "RM-side notes, follow-ups, and scheduled check-ins" },
    ],
  },
];

const DESTINATIONS: Destination[] = [
  { label: "CRM", sublabel: "Salesforce Financial Cloud", icon: Users },
  { label: "Rewards Provider", sublabel: "Augeo / Premium Payback", icon: Gift },
  { label: "Digital Banking App", sublabel: "Mobile + Web", icon: Smartphone },
  { label: "Marketing Automation", sublabel: "Marketing Cloud / Braze", icon: Megaphone },
  { label: "Advisor Console", sublabel: "Banker Workstation", icon: Briefcase },
  { label: "Risk Ops", sublabel: "Actimize / SAS", icon: ShieldAlert },
  { label: "AI Banking Assistant", sublabel: "In-app Copilot", icon: Bot },
];

function NetworkWires({ leftCount, rightCount }: { leftCount: number; rightCount: number }) {
  const gradId = useId().replace(/:/g, "");
  const SRC_X = 0;
  const CORE_LEFT = 38;
  const CORE_RIGHT = 62;
  const DST_X = 100;

  const leftYs = Array.from({ length: leftCount }, (_, i) => ((i + 0.5) / leftCount) * 100);
  const rightYs = Array.from({ length: rightCount }, (_, i) => ((i + 0.5) / rightCount) * 100);

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
          side === "left" ? "right-2 bg-emerald-500" : "left-2 bg-indigo-500",
          "animate-pulse",
        )}
      />
    </div>
  );
}

function SourceGroupCard({
  group,
  isOpen,
  onToggle,
}: {
  group: SourceGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  return (
    <div className="relative rounded-lg border border-slate-200 bg-white shadow-sm hover:border-emerald-300 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-md shrink-0 border bg-slate-100 text-slate-600 border-slate-200">
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
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-3 py-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {group.inputs.map((input) => {
            const InputIcon = input.icon;
            return (
              <div key={input.label} className="flex items-center gap-2">
                <InputIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11.5px] font-medium text-slate-700 flex-1 truncate">
                  {input.label}
                </span>
                {input.nonFcra && (
                  <span className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    non-FCRA
                  </span>
                )}
              </div>
            );
          })}
          {group.onOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                group.onOpen?.();
              }}
              className="mt-1 w-full flex items-center justify-between gap-1 text-[10.5px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-1.5 py-1 rounded transition-colors"
            >
              <span>{group.openLabel ?? "Open"}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CapabilitiesView({ onOpenProducts }: { onOpenProducts?: () => void } = {}) {
  const [activeSignalLabel, setActiveSignalLabel] = useState<string | null>(null);
  const sourceGroups: SourceGroup[] = [
    ...SOURCE_GROUPS,
    {
      provider: "Bank Product",
      sublabel: "Internal catalog · single source of truth",
      icon: Package,
      onOpen: onOpenProducts,
      openLabel: `Open Products tab · ${BANK_PRODUCT_TOTAL} products`,
      inputs: BANK_PRODUCT_CATEGORIES.map((c) => ({ label: c.label, icon: Package })),
    },
  ];
  const totalSourceInputs = sourceGroups.reduce((n, g) => n + g.inputs.length, 0);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());
  const [activeApplicationLabel, setActiveApplicationLabel] = useState<string | null>(null);
  const activeSignal = activeSignalLabel ? SIGNALS.find((s) => s.label === activeSignalLabel) ?? null : null;
  const activeApplication = activeApplicationLabel
    ? APPLICATIONS.find((a) => a.label === activeApplicationLabel) ?? null
    : null;
  const activeDetail = activeSignal ?? activeApplication;
  const activeDetailKind = activeSignal ? "Signal family" : activeApplication ? "Application" : null;
  const ActiveIcon = activeDetail?.icon;
  const selectSignal = (label: string) => {
    setActiveApplicationLabel(null);
    setActiveSignalLabel((prev) => (prev === label ? null : label));
  };
  const selectApplication = (label: string) => {
    setActiveSignalLabel(null);
    setActiveApplicationLabel((prev) => (prev === label ? null : label));
  };

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Layers className="w-4 h-4" />}
        title="System"
        subtitle="Network view: bank-native sources flow through Ventus and back out to activation systems"
        howItWorks="Ventus wires into the cores, processors, and digital channels your bank already runs. Transactions, KYC, telemetry, and bureau data stream into the Behavioral Intelligence Core, get classified into five signal families, and then feed five applications — Analytics & Targeting, Next-Offer, Next-Product, and Next-Conversation for regular and wealth clients — that fan back out to the CRM, rewards provider, digital banking app, marketing automation, advisor consoles, and risk ops."
        whyItMatters="One enrichment layer feeds every channel of record. No bespoke pipelines per destination — each system reads from the same canonical customer signal."
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        {/* Column headers */}
        <div className="grid grid-cols-[220px_minmax(380px,1fr)_220px] gap-6 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
              Bank-native sources · {totalSourceInputs} inputs across {sourceGroups.length} providers
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
              Ventus AI System
            </p>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
              Activation destinations · {DESTINATIONS.length} wired
            </p>
          </div>
        </div>

        {/* Network canvas */}
        <div className="relative">
          <NetworkWires leftCount={sourceGroups.length} rightCount={DESTINATIONS.length} />

          <div className="relative z-10 grid grid-cols-[220px_minmax(380px,1fr)_220px] gap-6 items-stretch">
            {/* Sources */}
            <div className="flex flex-col gap-2 justify-around">
              {sourceGroups.map((g) => (
                <SourceGroupCard
                  key={g.provider}
                  group={g}
                  isOpen={openGroups.has(g.provider)}
                  onToggle={() =>
                    setOpenGroups((prev) => {
                      const next = new Set(prev);
                      if (next.has(g.provider)) next.delete(g.provider);
                      else next.add(g.provider);
                      return next;
                    })
                  }
                />
              ))}
            </div>

            {/* Core */}
            <div className="flex items-center justify-center">
              <div
                className="rounded-2xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-indigo-900 p-5 shadow-xl w-full mx-auto overflow-hidden"
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
                  <p className="text-[15px] font-bold text-white mt-2">Behavioral Intelligence Core</p>
                  <p className="text-[10px] text-blue-200/80 mt-1">
                    Classifies · Enriches · Scores · Distributes
                  </p>
                </div>

                {/* Inner 2-band grid: signals → applications */}
                <div className="relative mt-4 grid grid-cols-[1fr_32px_1fr] gap-1 items-stretch">
                  {/* Signals column */}
                  <div className="flex flex-col min-w-0">
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider text-blue-200/80 mb-2 text-center">
                      Signal families · click
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SIGNALS.map((s) => {
                        const Icon = s.icon;
                        const isActive = s.label === activeSignalLabel;
                        return (
                          <button
                            type="button"
                            key={s.label}
                            onClick={() => selectSignal(s.label)}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-white text-left transition-all min-w-0 w-full",
                              s.tint,
                              isActive
                                ? "ring-2 ring-white/60 shadow-lg scale-[1.02]"
                                : "opacity-80 hover:opacity-100 hover:brightness-105",
                            )}
                          >
                            <div className={cn("flex items-center justify-center w-5 h-5 rounded shrink-0", s.color)}>
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-[11.5px] font-semibold flex-1 truncate">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fan-line SVG */}
                  <div className="relative">
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="core-fan" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(165,180,252,0.7)" />
                          <stop offset="100%" stopColor="rgba(196,181,253,0.7)" />
                        </linearGradient>
                      </defs>
                      {SIGNALS.map((_, i) =>
                        APPLICATIONS.map((__, j) => {
                          const y1 = ((i + 0.5) / SIGNALS.length) * 100;
                          const y2 = ((j + 0.5) / APPLICATIONS.length) * 100;
                          return (
                            <path
                              key={`f${i}-${j}`}
                              d={`M 0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                              fill="none"
                              stroke="url(#core-fan)"
                              strokeWidth="0.6"
                              strokeLinecap="round"
                              strokeDasharray="1.2 1.6"
                              opacity="0.55"
                              vectorEffect="non-scaling-stroke"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                from="0"
                                to="-10"
                                dur="2.8s"
                                begin={`${((i + j) * 0.1).toFixed(2)}s`}
                                repeatCount="indefinite"
                              />
                            </path>
                          );
                        }),
                      )}
                    </svg>
                  </div>

                  {/* Applications column */}
                  <div className="flex flex-col">
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider text-blue-200/80 mb-2 text-center">
                      Applications · click
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {APPLICATIONS.map((a) => {
                        const Icon = a.icon;
                        const isActive = a.label === activeApplicationLabel;
                        return (
                          <button
                            type="button"
                            key={a.label}
                            onClick={() => selectApplication(a.label)}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-white text-left transition-all",
                              a.tint,
                              isActive
                                ? "ring-2 ring-white/60 shadow-lg scale-[1.02]"
                                : "opacity-80 hover:opacity-100 hover:brightness-105",
                            )}
                          >
                            <div className={cn("flex items-center justify-center w-5 h-5 rounded shrink-0", a.color)}>
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-[11.5px] font-semibold flex-1 truncate">
                              {a.shortLabel ?? a.label}
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
            <div className="flex flex-col gap-2 justify-around">
              {DESTINATIONS.map((d) => (
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

            {/* Destinations */}
            <div className="flex flex-col gap-2 justify-around">
              {DESTINATIONS.map((d) => (
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
            className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200"
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
                    {activeDetail.items.length} {activeSignal ? "detections" : "capabilities"}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1 leading-snug">
                  {activeDetail.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {activeDetail.items.map((item) => (
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
              ))}
            </div>
          </div>
        )}


        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Live streams · packets shown flowing left to right</span>
          <span>One enrichment layer · many channels of record</span>
        </div>
      </div>
    </div>
  );
}
