import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Coins,
  Cpu,
  Eye,
  FileText,
  GitBranch,
  Landmark,
  Layers,
  LayoutDashboard,
  LineChart,
  Loader2,
  MessageSquare,
  Megaphone,
  Network,
  Repeat,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRoundCheck,
  Video,
  Wand2,
  X,
} from "lucide-react";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import salesforceLogo from "@/assets/salesforce-logo.png";
import { supabase } from "@/integrations/supabase/client";

const NAVY = "#012169";
const RED = "#E31837";
const GREEN = "#0B6B43";
const AMBER = "#b45309";

const PILLAR_COLOR: Record<string, string> = {
  Income: "#0B6B43",
  Wealth: "#012169",
  Cash: "#0369a1",
  Business: "#7c3aed",
  "Family & Community": "#db2777",
  "Travel & Exploration": "#2563eb",
  Review: "#94a3b8",
};

type DestId = "advisor" | "queue" | "rewards" | "campaign";
type Mode = "frontline" | "leadership";

type RawTxn = {
  raw: string;
  merchant: string;
  category: string;
  pillar: string;
  tag: string;
  conf: number;
};

type Opportunity = {
  id: string;
  type: string;
  client: string;
  value: string;
  valueLabel: string;
  confidence: number;
  icon: typeof Sparkles;
  reason: string;
  whyNow: string;
  rawTransactions: RawTxn[];
  action: string;
  outcome: string;
  talkingPoints: string[];
  owner: string;
  ownerRole: string;
  ownerInitials: string;
  ownerReason: string;
  destination: DestId;
  destinationWhy: string;
  outflow?: string; // wallet-share leak (folded from Outflow Analysis) — retention evidence
  fvi?: "low" | "elevated"; // financial vulnerability (folded from FVI) — drives customer-protection suppression
};

const opportunities: Opportunity[] = [
  {
    id: "transition",
    type: "One-Bank transition",
    client: "Alvarez household",
    value: "$420K",
    valueLabel: "NNA at risk",
    confidence: 86,
    icon: TrendingUp,
    reason: "BofA deposits are surging while assets quietly leak to an outside brokerage — a One-Bank household ready for Merrill.",
    whyNow: "The outbound transfer pattern usually completes within ~30 days.",
    rawTransactions: [
      { raw: "ACH DEP PAYROLL — UP 24%", merchant: "Payroll deposit", category: "Income · Payroll", pillar: "Income", tag: "Income ↑ 24%", conf: 0.97 },
      { raw: "BofA CHECKING BAL +$56K (90d)", merchant: "BofA deposits", category: "Deposits · Idle balance", pillar: "Cash", tag: "Deposits surging on-bank", conf: 0.92 },
      { raw: "WEB XFER → EXTERNAL BROKERAGE", merchant: "External brokerage", category: "Investments · Outbound transfer", pillar: "Wealth", tag: "Assets leaking off-bank", conf: 0.93 },
    ],
    action: "Refer to a Merrill advisor for a consolidation + planning review.",
    outcome: "Keep $420K of net new assets inside the franchise.",
    talkingPoints: [
      "Lead with the banking relationship — they already trust BofA.",
      "Offer a consolidation review vs. the external brokerage.",
      "Frame Preferred Rewards fee discounts as a reason to bring assets home.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Mapped relationship owner for this market and household.",
    destination: "advisor",
    destinationWhy: "Advisor-led One-Bank referral with a time-sensitive leak to stop.",
    outflow: "$5.2K/mo → external IRA (Fidelity)",
  },
  {
    id: "liquidity",
    type: "Business-sale liquidity",
    client: "Okafor household",
    value: "$1.2M",
    valueLabel: "new liquidity",
    confidence: 92,
    icon: Sparkles,
    reason: "A BofA Business Banking client just received an escrow wire and shut down payroll — a business sale closed.",
    whyNow: "The proceeds are sitting idle in checking right now.",
    rawTransactions: [
      { raw: "WIRE IN — ESCROW (BofA BIZ client)", merchant: "Escrow disbursement", category: "Deposits · One-time wire", pillar: "Cash", tag: "$1.2M inflow", conf: 0.96 },
      { raw: "ACH PAYROLL OUT — STOPPED", merchant: "Business payroll", category: "Income · Ended", pillar: "Business", tag: "Payroll outflow halted", conf: 0.91 },
      { raw: "ACCT CLOSE — LLC OPERATING", merchant: "LLC operating acct", category: "Accounts · Closed", pillar: "Business", tag: "Business wind-down", conf: 0.89 },
    ],
    action: "Introduce BofA Private Bank for liquidity and tax planning.",
    outcome: "Capture $1.2M before it leaves for a competitor.",
    talkingPoints: [
      "Lead with tax planning on the sale proceeds.",
      "Introduce trust and concentrated-position strategies.",
      "Warm handoff from the business banker to a Private Bank RM.",
    ],
    owner: "Marcus Reed",
    ownerRole: "Private Bank RM",
    ownerInitials: "MR",
    ownerReason: "Liquidity exceeds the Private Bank referral threshold.",
    destination: "queue",
    destinationWhy: "Above threshold — routes to the BofA Private Bank specialist pool.",
  },
  {
    id: "rewards",
    type: "Preferred Rewards on the cusp",
    client: "Park household",
    value: "$680K",
    valueLabel: "to deepen",
    confidence: 84,
    icon: Coins,
    reason: "Combined BofA + Merrill balances are near the Diamond threshold, but the household still self-directs.",
    whyNow: "Crossing the tier unlocks fee discounts now — a concrete reason to deepen.",
    rawTransactions: [
      { raw: "COMBINED BAL ~ $1M THRESHOLD", merchant: "BofA + Merrill balances", category: "Relationship · Tier", pillar: "Cash", tag: "Diamond tier on the cusp", conf: 0.9 },
      { raw: "MERRILL GUIDED INVESTING — SELF", merchant: "Merrill Guided Investing", category: "Investments · Self-directed", pillar: "Wealth", tag: "No advisor yet", conf: 0.86 },
      { raw: "DEPOSIT + CARD + MORTGAGE HELD", merchant: "Multi-product household", category: "Relationship · Depth", pillar: "Cash", tag: "Deep banking relationship", conf: 0.84 },
    ],
    action: "Introduce an advisor and cross the Diamond threshold.",
    outcome: "Unlock Diamond benefits and deepen to advised.",
    talkingPoints: [
      "Quantify the Preferred Rewards fee discount at Diamond.",
      "Show the value of advice vs. self-directed today.",
      "Bundle the banking + investing relationship into one plan.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "One-Bank deepening — banking relationship ready for advice.",
    destination: "rewards",
    destinationWhy: "Deepening play — route to Preferred Rewards / banking with an advisor intro.",
  },
  {
    id: "college",
    type: "College-planning life event",
    client: "Bennett household",
    value: "529 plan",
    valueLabel: "opportunity",
    confidence: 78,
    icon: Target,
    reason: "Test-prep and application spending signal a college-bound child in the household.",
    whyNow: "Application season — 529 contributions are time-sensitive for the tax year.",
    rawTransactions: [
      { raw: "SQ *KAPLAN TEST PREP", merchant: "Kaplan", category: "Education · Test prep", pillar: "Family & Community", tag: "College-bound", conf: 0.9 },
      { raw: "COMMON APP *FEE x7", merchant: "Application fees", category: "Education · Admissions", pillar: "Family & Community", tag: "Applying broadly", conf: 0.88 },
      { raw: "DELTA AIR 0061 + HOTEL", merchant: "Campus-visit travel", category: "Travel · Trip cluster", pillar: "Travel & Exploration", tag: "Campus visits", conf: 0.79 },
    ],
    action: "Enroll in a 529 education-planning nurture.",
    outcome: "Open a long-horizon education-planning relationship.",
    talkingPoints: [
      "Educational, not salesy — tax-year deadline reminder.",
      "Advisor-branded, fully consent-based outreach.",
      "Hand to an advisor only on engagement.",
    ],
    owner: "Lifecycle marketing",
    ownerRole: "Campaign owner",
    ownerInitials: "LM",
    ownerReason: "Lower-intensity signal — best nurtured, not cold-called.",
    destination: "campaign",
    destinationWhy: "Early-stage intent — nurtured until the client engages.",
  },
  {
    id: "inheritance",
    type: "Intergenerational transfer",
    client: "Nguyen household",
    value: "$310K",
    valueLabel: "retention risk",
    confidence: 81,
    icon: Repeat,
    reason: "An estate distribution landed, and the beneficiary is already a BofA customer — a Great Wealth Transfer moment.",
    whyNow: "Heirs move assets out within months unless engaged early.",
    rawTransactions: [
      { raw: "ACH DEP — ESTATE DISTRIBUTION", merchant: "Estate distribution", category: "Deposits · Inheritance", pillar: "Cash", tag: "Inheritance inflow", conf: 0.92 },
      { raw: "BENEFICIARY = BofA CUSTOMER", merchant: "Linked BofA household", category: "Relationship · Next-gen", pillar: "Family & Community", tag: "Heir already on-bank", conf: 0.88 },
      { raw: "IDLE CASH POST-INFLOW", merchant: "Uninvested cash", category: "Deposits · Idle balance", pillar: "Cash", tag: "Needs a plan", conf: 0.8 },
    ],
    action: "Open an intergenerational planning conversation with the heir.",
    outcome: "Retain $310K across generations — don't lose the next-gen client.",
    talkingPoints: [
      "Lead with estate settlement and tax sensitivity.",
      "Keep the heir's existing BofA relationship at the center.",
      "Offer a single banking + wealth plan for the next generation.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Retention-critical; the heir already banks with BofA.",
    destination: "advisor",
    destinationWhy: "Great Wealth Transfer retention — advisor-led, heir already on-bank.",
    outflow: "$310K inflow at risk → heir's outside advisor",
  },
];

// Prospects — emerging-affluent, One-Bank-sourced net-new households, folded into the
// advisor's book alongside existing clients.
const prospectOpportunities: Opportunity[] = [
  {
    id: "newjob",
    type: "New-job deposit surge",
    client: "Reyes household",
    value: "$38K",
    valueLabel: "to start investing",
    confidence: 84,
    icon: TrendingUp,
    reason: "A new employer's payroll just started and cash is building at BofA — but there's no investing relationship yet.",
    whyNow: "First paychecks are the moment to set up automatic investing.",
    rawTransactions: [
      { raw: "ACH DEP — NEW EMPLOYER *5521", merchant: "New employer payroll", category: "Income · Payroll", pillar: "Income", tag: "New job", conf: 0.95 },
      { raw: "BofA CHECKING +$9K / MONTH", merchant: "BofA deposits", category: "Deposits · Building", pillar: "Cash", tag: "Cash building on-bank", conf: 0.9 },
      { raw: "NO INVESTMENT ACCOUNT FOUND", merchant: "Held products", category: "Relationship · Banking only", pillar: "Cash", tag: "Banking-only today", conf: 0.86 },
    ],
    action: "Open a first investment account with automated investing.",
    outcome: "Win a 30-year relationship at the very start.",
    talkingPoints: [
      "Congratulate the new role — keep it human, not a pitch.",
      "Start small with automatic monthly investing.",
      "Show how Preferred Rewards grows with them.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "New relationship — not yet a client.",
    destination: "advisor",
    destinationWhy: "Net-new household — yours to win.",
  },
  {
    id: "firsthome",
    type: "First-home saver",
    client: "Tran household",
    value: "$60K",
    valueLabel: "idle savings",
    confidence: 81,
    icon: Coins,
    reason: "Steady saving and a mortgage pre-qual inquiry point to a first-home buyer with idle cash.",
    whyNow: "The down-payment timeline makes this a now conversation, not later.",
    rawTransactions: [
      { raw: "SAVINGS +$60K (12 mo)", merchant: "BofA savings", category: "Deposits · Idle balance", pillar: "Cash", tag: "Idle savings", conf: 0.9 },
      { raw: "MORTGAGE PRE-QUAL INQUIRY", merchant: "Home-loan interest", category: "Lending · Inquiry", pillar: "Cash", tag: "First-home intent", conf: 0.85 },
      { raw: "RENT PAYMENTS RECURRING", merchant: "Rent", category: "Housing · Rent", pillar: "Family & Community", tag: "Renter today", conf: 0.82 },
    ],
    action: "Connect home-buying help and invest the surplus.",
    outcome: "Become their advisor before the biggest purchase of their life.",
    talkingPoints: [
      "Lead with the home goal — money has a purpose.",
      "Coordinate with BofA home lending (One-Bank).",
      "Invest the cash that isn't needed for the down payment.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "New relationship — not yet a client.",
    destination: "advisor",
    destinationWhy: "Net-new household — yours to win.",
  },
  {
    id: "rsu",
    type: "Recent grad · first RSU vest",
    client: "Okonkwo household",
    value: "$22K",
    valueLabel: "first equity",
    confidence: 79,
    icon: Sparkles,
    reason: "A young saver just had their first RSU vest from a tech employer and is paying down student loans.",
    whyNow: "First equity comp is the moment to build good habits — before it's spent.",
    rawTransactions: [
      { raw: "EMPLOYER RSU VEST", merchant: "Equity comp", category: "Investments · RSU", pillar: "Wealth", tag: "First RSU vest", conf: 0.9 },
      { raw: "STUDENT LOAN PAYMENT", merchant: "Student loan", category: "Lending · Repayment", pillar: "Cash", tag: "Paying down debt", conf: 0.84 },
      { raw: "NO RETIREMENT ACCOUNT", merchant: "Held products", category: "Relationship · Gap", pillar: "Cash", tag: "No Roth yet", conf: 0.8 },
    ],
    action: "Coach on RSUs and open a Roth IRA.",
    outcome: "Capture an early-career professional on the rise.",
    talkingPoints: [
      "Explain RSU basics — taxes, diversification, holding.",
      "Open a Roth IRA while income still qualifies.",
      "Balance loan payoff with starting to invest.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "New relationship — not yet a client.",
    destination: "advisor",
    destinationWhy: "Net-new household — yours to win.",
  },
  {
    id: "smallinherit",
    type: "Small inheritance · on-bank",
    client: "Garcia household",
    value: "$45K",
    valueLabel: "first relationship",
    confidence: 82,
    icon: Repeat,
    reason: "A modest estate distribution landed for someone who already banks at BofA but has never been advised.",
    whyNow: "New money sits idle for a few weeks — then it moves or gets spent.",
    rawTransactions: [
      { raw: "ACH DEP — ESTATE (SMALL)", merchant: "Estate distribution", category: "Deposits · Inheritance", pillar: "Cash", tag: "Inheritance inflow", conf: 0.9 },
      { raw: "EXISTING BofA CUSTOMER", merchant: "Linked BofA household", category: "Relationship · On-bank", pillar: "Family & Community", tag: "Already banks here", conf: 0.88 },
      { raw: "IDLE CASH POST-INFLOW", merchant: "Uninvested cash", category: "Deposits · Idle balance", pillar: "Cash", tag: "Needs a plan", conf: 0.8 },
    ],
    action: "Offer a simple plan for the inherited cash.",
    outcome: "Turn a banking-only customer into your first advised client.",
    talkingPoints: [
      "Be sensitive — there was a loss behind this money.",
      "Keep it simple: emergency fund, then invest.",
      "Use the existing BofA trust to make it easy.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "New relationship — not yet a client.",
    destination: "advisor",
    destinationWhy: "Net-new household — yours to win.",
  },
  {
    id: "sidebiz",
    type: "Side-income on the rise",
    client: "Pham household",
    value: "$30K",
    valueLabel: "to organize",
    confidence: 78,
    icon: LineChart,
    reason: "Recurring transfer-app inflows show growing side income with no retirement account in place.",
    whyNow: "Self-employment income needs a plan before tax season.",
    rawTransactions: [
      { raw: "ZELLE / CASH APP INFLOWS (RECURRING)", merchant: "Side income", category: "Income · Self-employment", pillar: "Income", tag: "Side income growing", conf: 0.86 },
      { raw: "INCOME IRREGULAR — TRENDING UP", merchant: "Cash flow", category: "Income · Variable", pillar: "Income", tag: "Variable cash flow", conf: 0.82 },
      { raw: "NO RETIREMENT ACCOUNT", merchant: "Held products", category: "Relationship · Gap", pillar: "Cash", tag: "No SEP/solo yet", conf: 0.79 },
    ],
    action: "Set up cash-flow planning and a SEP/solo retirement plan.",
    outcome: "Anchor a future business owner early.",
    talkingPoints: [
      "Help smooth irregular income with a simple system.",
      "Open a SEP or solo 401(k) for the side income.",
      "Tee up BofA small-business banking if it grows.",
    ],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "New relationship — not yet a client.",
    destination: "advisor",
    destinationWhy: "Net-new household — yours to win.",
    fvi: "elevated",
  },
];

// The advisor works one book: existing clients + prospects.
const advisorBook: Opportunity[] = [...opportunities, ...prospectOpportunities];
const PROSPECT_IDS = new Set(prospectOpportunities.map((o) => o.id));

const destinations: { id: DestId; label: string; short: string; sub: string; icon: typeof Sparkles }[] = [
  { id: "advisor", label: "Client Engagement Workstation", short: "CEW", sub: "Book 360 priority task · Ask Merrill", icon: Building2 },
  { id: "queue", label: "Private Bank queue", short: "Private Bank", sub: "BofA Private Bank specialist pool", icon: Landmark },
  { id: "rewards", label: "Preferred Rewards / banking", short: "Preferred Rewards", sub: "One-Bank deepening + advisor intro", icon: Coins },
  { id: "campaign", label: "Lifecycle campaign", short: "Campaign", sub: "Consent-based, advisor-branded", icon: Megaphone },
];

const scenes = [
  { key: "find", nav: "Opportunities", question: "What opportunities did Ventus find?" },
  { key: "confidence", nav: "Confidence", question: "How confident are we?" },
  { key: "action", nav: "Action", question: "What is the recommended action?" },
  { key: "review", nav: "Review", question: "Who should review it?" },
  { key: "route", nav: "Route", question: "Where does it go next?" },
  { key: "book", nav: "Whole book", question: "What is the whole book telling you?" },
  { key: "pilot", nav: "Pilot", question: "What would a 90-day pilot look like?" },
];

const totalBook = 1240;

export default function EnterpriseGrowthDemoPage({ embedded = false }: { embedded?: boolean }) {
  const [entered, setEntered] = useState(false);
  const [mode, setMode] = useState<Mode>("frontline");
  const [scene, setScene] = useState(0);
  const [selectedId, setSelectedId] = useState(opportunities[0].id);
  const [routed, setRouted] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [cewTasks, setCewTasks] = useState<{ id: string; client: string; type: string; action: string }[]>([]);
  const [cewOpen, setCewOpen] = useState(false);
  const [accepts, setAccepts] = useState(0);
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [governanceTab, setGovernanceTab] = useState<"monitor" | "policy">("policy");
  const [focusId, setFocusId] = useState<string>(opportunities[0].id);

  const addToCew = (items: { id: string; client: string; type: string; action: string }[]) =>
    setCewTasks((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      return [...prev, ...items.filter((t) => !ids.has(t.id))];
    });
  const cewIds = new Set(cewTasks.map((t) => t.id));

  const activeOpps = advisorBook;
  const opp = activeOpps.find((o) => o.id === selectedId) ?? activeOpps[0];

  const altMeta =
    mode === "leadership"
      ? { Icon: LineChart, label: "Leadership view" }
      : { Icon: UserRoundCheck, label: "Advisor view" };
  const AltIcon = altMeta.Icon;

  const enterAt = (s: number, m: Mode) => {
    setMode(m);
    setSelectedId(advisorBook[0].id);
    setScene(s);
    setEntered(true);
  };

  const go = useCallback(
    (next: number) => setScene((s) => Math.min(scenes.length - 1, Math.max(0, next))),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!entered) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return; // don't hijack the live-test field
      if (e.key === "ArrowRight") {
        if (scene === 0) {
          if (focusId) setSelectedId(focusId); // worklist: → opens the top household
          go(1);
        } else {
          go(scene + 1);
        }
      }
      if (e.key === "ArrowLeft") go(scene - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, go, entered, focusId]);

  useEffect(() => setRouted(false), [selectedId]);

  return (
    <main
      className={`flex flex-col overflow-hidden bg-gradient-to-b from-white via-white to-slate-50 text-slate-950 ${embedded ? "h-full w-full rounded-xl border border-slate-200" : "h-screen w-screen"}`}
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <header className="flex flex-none items-center justify-between gap-3 border-b border-slate-200 px-6 py-3 sm:px-10">
        <div className="flex items-center gap-3">
          <img src={ventusLogo} className="h-5 w-auto" alt="Ventus AI" />
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-black text-white" style={{ backgroundColor: NAVY }}>
            M
          </span>
          <span className="hidden text-sm font-semibold sm:inline" style={{ color: NAVY }}>
            Merrill Wealth Signals
          </span>
          {entered && (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: `${NAVY}0d`, color: NAVY }}
            >
              <AltIcon className="h-3 w-3" /> {altMeta.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {entered && scene > 0 && scene < 5 && (
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:flex">
              <Eye className="h-3.5 w-3.5" style={{ color: GREEN }} />
              <span className="font-semibold text-slate-700">Following:</span>
              <span className="text-slate-500">
                {opp.client} · {opp.value}
              </span>
            </div>
          )}
          {entered && (
            <button
              onClick={() => setEntered(false)}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <GitBranch className="h-3.5 w-3.5" style={{ color: NAVY }} /> Switch view
            </button>
          )}
          {entered && (
            <button
              onClick={() => {
                setGovernanceTab("policy");
                setGovernanceOpen(true);
              }}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: NAVY }} /> Governance
            </button>
          )}
          {entered && (
            <button
              onClick={() => setCewOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LayoutDashboard className="h-3.5 w-3.5" style={{ color: NAVY }} /> CEW
              {cewTasks.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: GREEN }}>
                  {cewTasks.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setLiveOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Wand2 className="h-3.5 w-3.5" style={{ color: GREEN }} /> Live enricher
          </button>
        </div>
      </header>

      {!entered ? (
        <Cover onPick={enterAt} />
      ) : (
        <>
          <div className="relative min-h-0 flex-1">
            <SceneFade sceneKey={scene}>
              {scene === 0 && (
                <FindScene
                  opps={activeOpps}
                  cewIds={cewIds}
                  onAddToCew={addToCew}
                  onFocus={setFocusId}
                  onOpen={(id) => {
                    setSelectedId(id);
                    setScene(1);
                  }}
                />
              )}
              {scene === 1 && <ConfidenceScene opp={opp} />}
              {scene === 2 && <ActionScene opp={opp} accepts={accepts} />}
              {scene === 3 && <ReviewScene opp={opp} policy={policy} />}
              {scene === 4 && (
                <RouteScene
                  opp={opp}
                  routed={routed}
                  accepts={accepts}
                  onRoute={() => {
                    setRouted(true);
                    setAccepts((n) => n + 1);
                    if (opp.destination === "advisor") {
                      addToCew([{ id: opp.id, client: opp.client, type: opp.type, action: opp.action }]);
                    }
                  }}
                />
              )}
              {scene === 5 && <BookScene />}
              {scene === 6 && <PilotScene />}
            </SceneFade>
          </div>

          <footer className="flex flex-none items-center justify-between gap-4 border-t border-slate-200 bg-white/80 px-6 py-3 backdrop-blur sm:px-10">
            <button
              onClick={() => go(scene - 1)}
              disabled={scene === 0}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {scenes.map((s, i) => {
                const active = i === scene;
                const done = i < scene;
                return (
                  <button key={s.key} onClick={() => go(i)} className="group flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white transition"
                      style={{ backgroundColor: active ? NAVY : done ? GREEN : "#cbd5e1" }}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={`hidden text-xs font-semibold transition lg:inline ${active ? "text-slate-900" : "text-slate-400"}`}>
                      {s.nav}
                    </span>
                  </button>
                );
              })}
            </div>

            {scene === 0 ? (
              <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
                Open a household to begin <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <button
                onClick={() => go(scene + 1)}
                disabled={scene === scenes.length - 1}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
                style={{ backgroundColor: NAVY }}
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </footer>
        </>
      )}

      {liveOpen && <LiveEnricher onClose={() => setLiveOpen(false)} />}
      {cewOpen && (
        <CewPanel
          tasks={cewTasks}
          onRemove={(id) => setCewTasks((prev) => prev.filter((t) => t.id !== id))}
          onClose={() => setCewOpen(false)}
        />
      )}
      {governanceOpen && (
        <GovernancePanel
          policy={policy}
          onChange={setPolicy}
          tab={governanceTab}
          onTab={setGovernanceTab}
          onClose={() => setGovernanceOpen(false)}
        />
      )}
    </main>
  );
}

/* ───────────────────────── Scene 1 · Opportunities ───────────────────────── */

type Goal = "nna" | "retention" | "growth" | "deepen";

// One example to seed the idea — free-form: works as a priority or a filter query.
const PRIORITY_EXAMPLE = "Households with idle cash and no advisor yet";

// Differentiated local reason per opportunity (used when ranking offline).
function localReason(o: Opportunity): string {
  const goals = OPP_GOALS[o.id] ?? [];
  if (goals.includes("retention")) return "retention risk";
  if (goals.includes("deepen")) return "deepen relationship";
  if (valueNum(o.value) >= 500_000) return "high value";
  if (goals.includes("growth")) return "new relationship";
  return "qualified signal";
}

// Which objectives each opportunity advances — drives ranking + the "why ranked" chip.
const OPP_GOALS: Record<string, Goal[]> = {
  transition: ["nna", "retention", "growth"],
  liquidity: ["nna", "growth"],
  rewards: ["deepen", "nna"],
  college: ["growth"],
  inheritance: ["retention", "growth"],
  newjob: ["growth", "nna"],
  firsthome: ["growth"],
  rsu: ["growth", "nna"],
  smallinherit: ["retention", "growth"],
  sidebiz: ["growth", "deepen"],
};

function valueNum(v: string): number {
  const m = v.match(/([\d.]+)\s*([MK])?/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  const u = (m[2] || "").toUpperCase();
  if (u === "M") n *= 1_000_000;
  else if (u === "K") n *= 1_000;
  return n;
}

// Offline fallback for ranking when no backend is reachable — keyword overlap between
// the stated priority and each opportunity, plus a value × confidence base.
type RankEntry = { score: number; why: string; match: boolean };

function localRank(priority: string, list: Opportunity[]): Record<string, RankEntry> {
  const tokens = (priority.toLowerCase().match(/[a-z]+/g) ?? []).filter((t) => t.length > 3);
  const map: Record<string, RankEntry> = {};
  list.forEach((o) => {
    const hay = `${o.type} ${o.reason} ${(OPP_GOALS[o.id] ?? []).join(" ")}`.toLowerCase();
    let overlap = 0;
    for (const t of tokens) if (hay.includes(t)) overlap++;
    const base = Math.min(40, (valueNum(o.value) * o.confidence) / 3_000_000);
    const score = Math.round(Math.min(100, overlap * 14 + base));
    map[o.id] = { score, why: localReason(o), match: true };
  });
  return map;
}

const BULK_ACTIONS: { label: string; icon: typeof Sparkles }[] = [
  { label: "Add to CEW tasks", icon: Building2 },
  { label: "Assign to teammate", icon: UserRoundCheck },
  { label: "Dismiss", icon: X },
];
const TEAMMATE = "Priya N. (CA)";

function FindScene({
  opps,
  onOpen,
  onFocus,
  cewIds,
  onAddToCew,
}: {
  opps: Opportunity[];
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
  cewIds: Set<string>;
  onAddToCew: (items: { id: string; client: string; type: string; action: string }[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState("");
  const [ranking, setRanking] = useState<Record<string, RankEntry>>({});
  const [aiRanked, setAiRanked] = useState(false);
  const [aiModel, setAiModel] = useState<string>("");
  const [rankLoading, setRankLoading] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [undoIds, setUndoIds] = useState<string[] | null>(null);

  // Initial order (and on seat change) ranks locally — no API spend until the user asks.
  useEffect(() => {
    setRanking(localRank(priority, opps));
    setAiRanked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opps]);

  const runPriority = async (text: string) => {
    const t = text.trim();
    if (!t || rankLoading) return;
    setPriority(t);
    setRankLoading(true);
    const items = opps.map((o) => ({
      id: o.id,
      type: o.type,
      client: o.client,
      value: o.value,
      valueLabel: o.valueLabel,
      confidence: o.confidence,
      reason: o.reason,
    }));
    const res = await invokePrioritize({ priority: t, items });
    if (res?.ranking?.length) {
      const map: Record<string, RankEntry> = {};
      res.ranking.forEach((r) => (map[r.id] = { score: r.score, why: r.why, match: r.match !== false }));
      setRanking(map);
      setAiRanked(true);
      setAiModel(res.model ?? "");
    } else {
      setRanking(localRank(t, opps));
      setAiRanked(false);
    }
    setRankLoading(false);
  };

  const visible = opps.filter((o) => !dismissed.has(o.id));
  const ranked = [...visible].sort((a, b) => {
    const am = ranking[a.id]?.match === false ? 0 : 1;
    const bm = ranking[b.id]?.match === false ? 0 : 1;
    if (am !== bm) return bm - am;
    return (ranking[b.id]?.score ?? 0) - (ranking[a.id]?.score ?? 0);
  });
  const isFilter = aiRanked && visible.some((o) => ranking[o.id]?.match === false);
  const matchCount = visible.filter((o) => ranking[o.id]?.match !== false).length;
  const selectedNames = opps.filter((o) => sel.has(o.id)).map((o) => o.client);

  // Group the book into Clients then Prospects for scannability (ranked within each).
  const clientRows = ranked.filter((o) => !PROSPECT_IDS.has(o.id));
  const prospectRows = ranked.filter((o) => PROSPECT_IDS.has(o.id));
  const grouped = [...clientRows, ...prospectRows];

  // "Next" follows the top-priority household: the top-ranked selected one, else the top of the list.
  const focusId = (sel.size > 0 ? ranked.find((o) => sel.has(o.id))?.id : ranked[0]?.id) ?? "";
  useEffect(() => {
    if (focusId) onFocus(focusId);
  }, [focusId, onFocus]);

  const toggle = (id: string) =>
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const doBulk = (label: string) => {
    const chosen = opps.filter((o) => sel.has(o.id));
    const ids = chosen.map((o) => o.id);
    setUndoIds(null);
    if (label === "Add to CEW tasks") {
      onAddToCew(chosen.map((o) => ({ id: o.id, client: o.client, type: o.type, action: o.action })));
    } else if (label === "Assign to teammate") {
      setAssigned((prev) => {
        const next = { ...prev };
        ids.forEach((id) => (next[id] = TEAMMATE));
        return next;
      });
    } else if (label === "Dismiss") {
      setDismissed((prev) => new Set([...prev, ...ids]));
      setUndoIds(ids);
    }
    setBulkMsg(`${chosen.length} household${chosen.length === 1 ? "" : "s"} · ${label}`);
    setSel(new Set());
  };

  return (
    <SceneShell>
      <div className="flex flex-col gap-4">
        <div>
          <Eyebrow>Your book · this week</Eyebrow>
          <Question>What should you act on today?</Question>
        </div>

        {/* Provenance + free-form, AI-ranked priority */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{totalBook.toLocaleString()} households</span> →{" "}
              <span className="font-semibold text-slate-800">{opps.length} qualified — clients + prospects</span>
            </div>
            {aiRanked && (
              <AiTag
                label={`${isFilter ? `${matchCount} of ${opps.length} match` : "ranked by AI"}${aiModel ? ` · ${shortModel(aiModel)}` : ""}`}
                title={`Routed to ${aiModel || "the ranking model"} — structured reasoning over the book.`}
              />
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runPriority(draft)}
              placeholder="Ask the book, or tell Ventus what to prioritize…"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
            />
            <button
              onClick={() => runPriority(draft)}
              disabled={rankLoading}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
            >
              {rankLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {rankLoading ? "Ranking" : "Re-rank"}
            </button>
          </div>

          <button
            onClick={() => {
              setDraft(PRIORITY_EXAMPLE);
              runPriority(PRIORITY_EXAMPLE);
            }}
            className="mt-2 text-[11px] text-slate-400 transition hover:text-slate-600"
          >
            e.g. “{PRIORITY_EXAMPLE}” →
          </button>
        </div>

        {/* selection actions live in a floating overlay bar (below) to avoid layout shift */}

        {isFilter && matchCount === 0 && (
          <p className="text-xs font-medium text-amber-700">No matches for that — try different words.</p>
        )}

        {/* Worklist rows */}
        <div className="scrollbar-light max-h-[42vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
          {ranked.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">All clear — no opportunities in view.</p>
          ) : (
            grouped.map((o, i) => {
            const Icon = o.icon;
            const checked = sel.has(o.id);
            const why = ranking[o.id]?.why ?? "";
            const noMatch = ranking[o.id]?.match === false;
            const expanded = expandedId === o.id;
            const isProspect = PROSPECT_IDS.has(o.id);
            const showHeader = i === 0 || isProspect !== PROSPECT_IDS.has(grouped[i - 1].id);
            return (
              <div key={o.id}>
                {showHeader && (
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {isProspect ? "Prospects · win new" : "Clients · deepen & retain"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{isProspect ? prospectRows.length : clientRows.length}</span>
                  </div>
                )}
                <div className={`${showHeader ? "" : "border-t border-slate-100"} ${noMatch ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o.id)}
                    className="h-4 w-4 flex-none cursor-pointer rounded"
                    style={{ accentColor: GREEN }}
                  />
                  <div className="hidden rounded-lg border border-slate-200 bg-slate-50 p-2 sm:block">
                    <Icon className="h-4 w-4" style={{ color: GREEN }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {o.type} <span className="font-normal text-slate-400">· {o.client}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{o.action}</p>
                  </div>
                  <div className="hidden w-20 flex-none text-right sm:block">
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {o.value}
                    </p>
                    <p className="text-[10px] text-slate-400">{o.valueLabel}</p>
                  </div>
                  <ConfidencePill value={o.confidence} />
                  {/* Status cues — full detail lives in the evidence drawer; row stays scan-light. */}
                  {(cewIds.has(o.id) || assigned[o.id]) && (
                    <span className="hidden flex-none items-center gap-1 sm:flex">
                      {cewIds.has(o.id) && (
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} title="In CEW tasks" />
                      )}
                      {assigned[o.id] && (
                        <span className="h-2 w-2 rounded-full bg-slate-400" title={`Assigned to ${assigned[o.id]}`} />
                      )}
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedId(expanded ? null : o.id)}
                    aria-label="Show evidence"
                    className="flex flex-none items-center rounded-lg border border-slate-200 px-2 py-1.5 text-slate-500 transition hover:bg-slate-50"
                    title="Evidence"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={() => onOpen(o.id)}
                    className="flex flex-none items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
                    style={{ backgroundColor: NAVY }}
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    {/* Secondary status moved off the row — surfaced here on expand. */}
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {o.outflow && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${RED}14`, color: RED }}>
                          Outflow · {o.outflow}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={why ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                        title={why}
                      >
                        Why ranked · {why || "—"}
                      </span>
                      {cewIds.has(o.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${GREEN}14`, color: GREEN }}>
                          <Check className="h-2.5 w-2.5" /> In CEW
                        </span>
                      )}
                      {assigned[o.id] && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          <UserRoundCheck className="h-2.5 w-2.5" /> {assigned[o.id]}
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Evidence — raw transactions behind this signal
                    </p>
                    <div className="space-y-1">
                      {o.rawTransactions.map((tx) => {
                        const c = PILLAR_COLOR[tx.pillar] ?? PILLAR_COLOR.Review;
                        return (
                          <div key={tx.raw} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5">
                            <span className="w-44 flex-none truncate font-mono text-[10px] text-slate-500" title={tx.raw}>
                              {tx.raw}
                            </span>
                            <ArrowRight className="h-3 w-3 flex-none text-slate-300" />
                            <span className="truncate text-[11px] font-semibold text-slate-800">{tx.merchant}</span>
                            <span className="ml-auto flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${c}1a`, color: c }}>
                              {tx.tag}
                            </span>
                            <span className="flex-none rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${c}14`, color: c }}>
                              {Math.round(tx.conf * 100)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Floating selection bar — overlays near the bottom of the scene, so the list never shifts */}
      <div
        className={`fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 transition-all duration-200 ${
          sel.size > 0 || bulkMsg ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="flex max-w-[92vw] flex-wrap items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 shadow-lg" style={{ borderColor: `${NAVY}22` }}>
          {sel.size > 0 ? (
            <>
              <span className="text-sm font-semibold" style={{ color: NAVY }}>
                {sel.size} selected
              </span>
              <span className="hidden max-w-[36vw] truncate text-xs text-slate-500 md:inline">{selectedNames.join(", ")}</span>
              {BULK_ACTIONS.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.label}
                    onClick={() => doBulk(b.label)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Icon className="h-3.5 w-3.5" /> {b.label}
                  </button>
                );
              })}
              <button onClick={() => setSel(new Set())} className="text-xs text-slate-400">
                clear
              </button>
            </>
          ) : bulkMsg ? (
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: GREEN }}>
              <Check className="h-3.5 w-3.5" />
              <span>{bulkMsg}</span>
              {undoIds && (
                <button
                  onClick={() => {
                    setDismissed((prev) => {
                      const next = new Set(prev);
                      undoIds.forEach((id) => next.delete(id));
                      return next;
                    });
                    setUndoIds(null);
                    setBulkMsg(null);
                  }}
                  className="text-slate-500 underline"
                >
                  undo
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Scene 2 · Confidence (enrichment in action) ───────────────────────── */

function ConfidenceScene({ opp }: { opp: Opportunity }) {
  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div>
          <Eyebrow>The signal · {opp.client}</Eyebrow>
          <Question>How confident are we?</Question>
          <p className="mt-4 text-lg font-semibold leading-7 text-slate-900">{opp.reason}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold" style={{ color: AMBER }}>
            <Clock className="h-4 w-4" /> Why now: {opp.whyNow}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Gauge value={opp.confidence} />
            <div className="space-y-1.5 text-xs text-slate-500">
              <AuthorityRow icon={Cpu} text="Benchmarked across 5 models" />
              <AuthorityRow icon={ShieldCheck} text="Best model auto-selected · 86% accuracy" />
              <AuthorityRow icon={Clock} text="~0.3s per transaction · de-identified" />
            </div>
          </div>
        </div>

        <EnrichmentPanel opp={opp} />
      </div>
    </SceneShell>
  );
}

const MERCHANT_MAP: { match: string[]; merchant: string; category: string; pillar: string; tag: string; conf: number }[] = [
  { match: ["gusto", "adp", "paychex", "payroll", "direct dep"], merchant: "Payroll deposit", category: "Income · Payroll", pillar: "Income", tag: "Recurring income", conf: 0.97 },
  { match: ["fidelity", "schwab", "vanguard", "etrade", "brokerage", "ira", "401k"], merchant: "Brokerage transfer", category: "Investments · Transfer", pillar: "Wealth", tag: "Held-away assets", conf: 0.92 },
  { match: ["coinbase", "kraken", "binance", "crypto", "gemini.com"], merchant: "Crypto on-ramp", category: "Investments · Digital assets", pillar: "Wealth", tag: "Digital-asset interest", conf: 0.88 },
  { match: ["delta", "united", "american air", "airbnb", "marriott", "hilton", "expedia"], merchant: "Travel booking", category: "Travel · Air/Lodging", pillar: "Travel & Exploration", tag: "Trip detected", conf: 0.9 },
  { match: ["whole foods", "trader joe", "safeway", "kroger", "instacart"], merchant: "Grocery", category: "Food · Grocery", pillar: "Family & Community", tag: "Weekly staple", conf: 0.94 },
  { match: ["starbucks", "blue bottle", "chipotle", "doordash", "uber eats"], merchant: "Dining", category: "Food · Restaurants", pillar: "Family & Community", tag: "Frequent dining", conf: 0.93 },
  { match: ["kaplan", "common app", "tuition", "529", "sat", "act prep"], merchant: "Education", category: "Education · Admissions", pillar: "Family & Community", tag: "College-planning signal", conf: 0.9 },
  { match: ["escrow", "wire in"], merchant: "Escrow disbursement", category: "Deposits · One-time wire", pillar: "Cash", tag: "Liquidity event", conf: 0.95 },
];

function enrichRaw(input: string): RawTxn {
  const lower = input.toLowerCase();
  const hit = MERCHANT_MAP.find((m) => m.match.some((k) => lower.includes(k)));
  if (hit) return { raw: input, merchant: hit.merchant, category: hit.category, pillar: hit.pillar, tag: hit.tag, conf: hit.conf };
  return {
    raw: input,
    merchant: input.replace(/[^a-zA-Z ]/g, " ").trim().slice(0, 22) || "Unrecognized merchant",
    category: "Unclassified",
    pillar: "Review",
    tag: "Low confidence — routes to live model",
    conf: 0.42,
  };
}

const SAMPLE_RAWS = ["ACH DEP GUSTO PAY *8829", "SQ *BLUE BOTTLE COFFEE", "COINBASE.COM *8829", "WEB XFER VANGUARD *4471"];

function EnrichmentPanel({ opp }: { opp: Opportunity }) {
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState(0);

  const rawCount = opp.rawTransactions.length;
  useEffect(() => {
    setDone(0);
    if (rawCount === 0) return;
    const t = setInterval(() => {
      setDone((d) => {
        if (d >= rawCount) {
          clearInterval(t);
          return d;
        }
        return d + 1;
      });
    }, 650);
    return () => clearInterval(t);
  }, [opp.id, runKey, rawCount]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: NAVY }} />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Enrichment in action</p>
          <AiTag label="multi-model" title="High-volume classification — raced across models; the most confident wins." />
        </div>
        <button
          onClick={() => setRunKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replay
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {opp.rawTransactions.map((tx, i) => (
          <EnrichRow key={`${runKey}-${i}`} tx={tx} state={i < done ? "done" : i === done ? "active" : "queued"} />
        ))}
      </div>

    </div>
  );
}

type ModelVerdict = {
  model: string;
  ok: boolean;
  latencyMs: number;
  merchant?: string;
  pillar?: string;
  category?: string;
  confidence?: number;
  error?: string;
};

type RowState = "pending" | "done" | "timeout" | "error";
type RaceRow = { model: string; state: RowState; verdict?: ModelVerdict };

// Frontend fans out one call per model so each result renders the instant it returns
// (progressive reveal) — fast models land in ~0.5s instead of waiting for the slowest.
const RACE_MODELS = [
  "openai/gpt-4.1-mini",
  "google/gemini-2.5-flash-lite",
  "qwen/qwen3-235b-a22b-2507",
  "z-ai/glm-5.2",
];
const PER_MODEL_TIMEOUT_MS = 5000;
const MAX_FILE_ROWS = 25; // cap rows enriched from an uploaded file to control API cost
const FILE_MODEL = "openai/gpt-4.1-mini"; // single fast model for batch file enrichment

const shortModel = (m: string) => m.split("/").pop() ?? m;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

// Per-session safety cap so a demo can't rack up unbounded API spend.
let apiCalls = 0;
const MAX_API_CALLS = 60;
function budgetOk(): boolean {
  if (apiCalls >= MAX_API_CALLS) return false;
  apiCalls += 1;
  return true;
}
function overBudget(): boolean {
  return apiCalls >= MAX_API_CALLS;
}

// Calls the Vercel /api/model-route function first (EBC-style), falling back to the
// Supabase edge function, so the same UI works on Vercel, Lovable, or Amplify.
async function invokeModelRoute(body: { input: string; model?: string }): Promise<{ data: ModelVerdict | null; error: unknown }> {
  if (!budgetOk()) return { data: null, error: new Error("budget") };
  const url = (import.meta.env.VITE_MODEL_ROUTE_URL as string | undefined) ?? "/api/model-route";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { data: (await res.json()) as ModelVerdict, error: null };
  } catch {
    // fall through to Supabase
  }
  const { data, error } = await supabase.functions.invoke("model-route", { body });
  return { data: (data as ModelVerdict) ?? null, error };
}

type RankResult = { ranking?: { id: string; score: number; why: string; match?: boolean }[]; model?: string };

// AI-native ranking: send the advisor's plain-language priority + the opportunities,
// get back an ordered list with a reason per item. Returns null so callers fall back
// to a local heuristic when no backend is reachable.
async function invokePrioritize(body: { priority: string; items: unknown[] }): Promise<RankResult | null> {
  if (!budgetOk()) return null;
  const url = (import.meta.env.VITE_PRIORITIZE_URL as string | undefined) ?? "/api/prioritize";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
      body: JSON.stringify(body),
    });
    if (res.ok) return (await res.json()) as RankResult;
  } catch {
    // fall through to local heuristic
  }
  return null;
}

type MeetingPrep = { summary?: string; agenda?: string[]; talkingPoints?: string[]; nextStep?: string; model?: string };

// Seamless AI-native indicator used across surfaces.
function AiTag({ label, title }: { label: string; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
    >
      <Sparkles className="h-3 w-3" /> {label}
    </span>
  );
}

// AI meeting-prep brief for one household (Merrill's AI-Powered Meeting Journey analogue).
async function invokeMeetingPrep(household: unknown): Promise<MeetingPrep | null> {
  if (!budgetOk()) return null;
  const url = (import.meta.env.VITE_MEETING_PREP_URL as string | undefined) ?? "/api/meeting-prep";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
      body: JSON.stringify({ household }),
    });
    if (res.ok) return (await res.json()) as MeetingPrep;
  } catch {
    // fall through — caller keeps the static brief
  }
  return null;
}

function CewPanel({
  tasks,
  onRemove,
  onClose,
}: {
  tasks: { id: string; client: string; type: string; action: string }[];
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-semibold">Client Engagement Workstation · Book 360</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Tasks · {tasks.length}
          </p>
          {tasks.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              No tasks yet. Add households from the worklist or deliver one from the journey.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.type} <span className="font-normal text-slate-400">· {t.client}</span>
                    </p>
                    <p className="text-xs text-slate-500">{t.action}</p>
                  </div>
                  <button onClick={() => onRemove(t.id)} aria-label="Remove" className="rounded-lg p-1 text-slate-400 transition hover:bg-white" title="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">In production, these land as Book 360 tasks in Salesforce.</p>
        </div>
      </div>
    </div>
  );
}

function PolicyToggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
    >
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative h-5 w-9 flex-none rounded-full transition" style={{ backgroundColor: value ? GREEN : "#cbd5e1" }}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function GovernancePanel({
  policy,
  onChange,
  tab,
  onTab,
  onClose,
}: {
  policy: Policy;
  onChange: (p: Policy) => void;
  tab: "monitor" | "policy";
  onTab: (t: "monitor" | "policy") => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const TABS: { id: "monitor" | "policy"; label: string; icon: typeof Activity }[] = [
    { id: "monitor", label: "Monitor", icon: Activity },
    { id: "policy", label: "Policy", icon: ShieldCheck },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Governance · Risk & model</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1 border-b border-slate-200 px-3 pt-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className="flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-sm font-semibold transition"
                style={active ? { borderColor: NAVY, color: NAVY } : { borderColor: "transparent", color: "#64748b" }}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
        {tab === "monitor" ? <MonitorBody /> : <PolicyBody policy={policy} onChange={onChange} />}
      </div>
    </div>
  );
}

function PolicyBody({ policy, onChange }: { policy: Policy; onChange: (p: Policy) => void }) {
  return (
        <div className="p-5">
          <div className="rounded-xl border p-3" style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}0d` }}>
            <p className="text-sm leading-6 text-slate-700">
              Controls the <span className="font-semibold">gate</span>, not the <span className="font-semibold">recommendations</span>.
            </p>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Enhanced suitability review at / above</p>
          <div className="mt-2 flex gap-2">
            {SUITABILITY_OPTIONS.map((v) => {
              const active = policy.suitabilityThreshold === v;
              return (
                <button
                  key={v}
                  onClick={() => onChange({ ...policy, suitabilityThreshold: v })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${active ? "text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  style={active ? { backgroundColor: NAVY } : undefined}
                >
                  {fmtUsd(v)}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-2">
            <PolicyToggle
              label="Financial-health suppression (customer protection)"
              value={policy.fhSuppression}
              onToggle={() => onChange({ ...policy, fhSuppression: !policy.fhSuppression })}
            />
            <PolicyToggle
              label="Marketing consent required (campaigns)"
              value={policy.campaignConsent}
              onToggle={() => onChange({ ...policy, campaignConsent: !policy.campaignConsent })}
            />
          </div>

          <p className="mt-4 text-[11px] text-slate-400">Merrill tunes the rules; every change is logged. Applies live to Review.</p>
        </div>
  );
}

const healthChecks: { label: string; value: string; status: "ok" | "watch"; note: string }[] = [
  { label: "Signal precision", value: "92%", status: "ok", note: "within tolerance" },
  { label: "Advisor acceptance", value: "41%", status: "ok", note: "7-day avg" },
  { label: "Model drift", value: "Low", status: "watch", note: "Charlotte market" },
  { label: "Fairness / disparate impact", value: "Passed", status: "ok", note: "no protected-class skew" },
  { label: "Model risk (SR 11-7)", value: "Validated", status: "ok", note: "documented · monitored" },
  { label: "Data handling", value: "Isolated", status: "ok", note: "de-identified · tenant-only" },
];

function MonitorBody() {
  const watch = healthChecks.filter((c) => c.status === "watch").length;
  return (
        <div className="p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={watch ? { backgroundColor: `${AMBER}1a`, color: AMBER } : { backgroundColor: `${GREEN}14`, color: GREEN }}>
              {watch ? `Within tolerance · ${watch} to watch` : "All within tolerance"}
            </span>
            <span className="text-[11px] text-slate-400">monitored continuously</span>
          </div>
          <div className="mt-3 space-y-2">
            {healthChecks.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                {c.status === "ok" ? (
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full" style={{ backgroundColor: GREEN }}>
                    <Check className="h-3 w-3 text-white" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: AMBER }}>
                    !
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{c.label}</p>
                  <p className="text-[11px] text-slate-400">{c.note}</p>
                </div>
                <span className="flex-none text-sm font-semibold" style={{ color: c.status === "ok" ? "#0f172a" : AMBER }}>
                  {c.value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Alerts route to model-risk governance. Tenant-isolated, de-identified.</p>
        </div>
  );
}

function LiveEnricher({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<RaceRow[]>([]);
  const [sim, setSim] = useState<RawTxn | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [fileRows, setFileRows] = useState<{ raw: string; state: RowState; verdict?: ModelVerdict }[]>([]);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  // Pre-warm the function on open so the first real run doesn't eat a cold start.
  useEffect(() => {
    invokeModelRoute({ input: "WARMUP", model: RACE_MODELS[0] }).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const run = async (val: string) => {
    const v = val.trim();
    if (!v || running) return;
    setRunning(true);
    setSim(null);
    setNote(null);
    setRows(RACE_MODELS.map((m) => ({ model: m, state: "pending" })));

    let anyOk = false;
    await Promise.all(
      RACE_MODELS.map(async (m) => {
        try {
          const { data, error } = await withTimeout(invokeModelRoute({ input: v, model: m }), PER_MODEL_TIMEOUT_MS);
          const verdict = data;
          if (error || !verdict || !verdict.ok) throw new Error("fail");
          anyOk = true;
          setRows((prev) => prev.map((r) => (r.model === m ? { model: m, state: "done", verdict } : r)));
        } catch (e) {
          const timedOut = e instanceof Error && e.message === "timeout";
          setRows((prev) => prev.map((r) => (r.model === m ? { model: m, state: timedOut ? "timeout" : "error" } : r)));
        }
      }),
    );

    if (!anyOk) {
      setRows([]);
      setSim(enrichRaw(v));
      setNote(
        overBudget()
          ? "Session API limit reached (demo safety cap) — showing a simulated result."
          : "Simulated locally — deploy model-route with OPENROUTER_API_KEY for a live multi-model race.",
      );
    }
    setRunning(false);
  };

  const onFile = async (file: File | null) => {
    if (!file || fileBusy) return;
    if (overBudget()) {
      setFileInfo("Session API limit reached (demo safety cap). Try again later.");
      return;
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    // Drop a header row if the first line looks like column names.
    let bodyLines = lines;
    if (bodyLines.length && /description|merchant|memo|payee|amount|date/i.test(bodyLines[0]) && !/\d{3,}/.test(bodyLines[0])) {
      bodyLines = bodyLines.slice(1);
    }
    // For CSVs, take the longest field per row (usually the descriptor); else the whole line.
    const pick = (line: string) =>
      line.includes(",")
        ? line.split(",").map((s) => s.trim().replace(/^"|"$/g, "")).reduce((a, b) => (b.length > a.length ? b : a), "")
        : line;
    const descriptors = bodyLines.map(pick).filter(Boolean);
    const total = descriptors.length;
    const capped = descriptors.slice(0, MAX_FILE_ROWS);
    setFileInfo(
      total > MAX_FILE_ROWS
        ? `Enriched the first ${MAX_FILE_ROWS} of ${total} rows (capped to control cost).`
        : `Enriched ${capped.length} row${capped.length === 1 ? "" : "s"}.`,
    );
    setFileRows(capped.map((r) => ({ raw: r, state: "pending" as RowState })));
    setFileBusy(true);

    let idx = 0;
    const worker = async () => {
      while (idx < capped.length) {
        const i = idx++;
        try {
          const { data } = await withTimeout(invokeModelRoute({ input: capped[i], model: FILE_MODEL }), PER_MODEL_TIMEOUT_MS);
          if (data?.ok) setFileRows((prev) => prev.map((r, j) => (j === i ? { ...r, state: "done", verdict: data } : r)));
          else throw new Error("fail");
        } catch {
          setFileRows((prev) => prev.map((r, j) => (j === i ? { ...r, state: "error" } : r)));
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]); // 3 concurrent, capped rows
    setFileBusy(false);
  };

  const done = rows.filter((r) => r.state === "done" && r.verdict);
  const pillarCounts: Record<string, number> = {};
  done.forEach((r) => (pillarCounts[r.verdict!.pillar ?? "Review"] = (pillarCounts[r.verdict!.pillar ?? "Review"] ?? 0) + 1));
  const consensusPillar = Object.entries(pillarCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const agreement = done.length ? Math.round(((pillarCounts[consensusPillar ?? ""] ?? 0) / done.length) * 100) : 0;
  const selectedModel = done.length
    ? done.slice().sort((a, b) => (b.verdict!.confidence ?? 0) - (a.verdict!.confidence ?? 0))[0].model
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" style={{ color: GREEN }} />
            <div>
              <p className="text-base font-semibold text-slate-900">Live enricher — multi-model</p>
              <p className="text-xs text-slate-400">Enrich any transaction across models, live</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(input)}
            placeholder="e.g. SQ *KAPLAN TEST PREP"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
          <button
            onClick={() => run(input)}
            disabled={running}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: NAVY }}
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            {running ? "Racing" : "Enrich"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_RAWS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                run(s);
              }}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] text-slate-500 transition hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>

        {rows.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">
                {done.length}/{rows.length} answered
              </span>
              {done.length > 0 && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{agreement}% agree</span>
                  {consensusPillar && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">consensus: {consensusPillar}</span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="space-y-1.5">
              {rows.map((r) => (
                <ModelRaceRow key={r.model} row={r} selected={selectedModel === r.model} />
              ))}
            </div>
          </div>
        )}

        {/* Sample-file enrichment — single model, capped for cost */}
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" style={{ color: NAVY }} />
              <p className="text-sm font-semibold text-slate-700">Enrich a sample file</p>
            </div>
            <label
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${fileBusy ? "opacity-60" : ""}`}
              style={{ backgroundColor: NAVY }}
            >
              {fileBusy ? "Enriching…" : "Upload CSV"}
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                disabled={fileBusy}
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            CSV / TXT · one transaction per row · first {MAX_FILE_ROWS} rows enriched · de-identified, no PII.
          </p>
          {fileInfo && (
            <p className="mt-1 text-[11px] font-medium" style={{ color: GREEN }}>
              {fileInfo}
            </p>
          )}
          {fileRows.length > 0 && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {fileRows.map((r, i) => {
                const color = (r.verdict?.pillar && PILLAR_COLOR[r.verdict.pillar]) ?? PILLAR_COLOR.Review;
                return (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="w-40 flex-none truncate font-mono text-[10px] text-slate-500" title={r.raw}>
                      {r.raw}
                    </span>
                    <ArrowRight className="h-3 w-3 flex-none text-slate-300" />
                    {r.state === "pending" && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                    {r.state === "error" && <span className="text-[10px] text-slate-300">—</span>}
                    {r.state === "done" && r.verdict && (
                      <>
                        <span className="truncate text-[11px] font-semibold text-slate-800">{r.verdict.merchant}</span>
                        <span className="ml-auto flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}1a`, color }}>
                          {r.verdict.pillar}
                        </span>
                        <span className="flex-none rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}14`, color }}>
                          {Math.round((r.verdict.confidence ?? 0) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {sim && (
          <div className="mt-4">
            <EnrichRow tx={sim} state="done" />
          </div>
        )}

        {note && <p className="mt-2 text-[11px] text-amber-700">{note}</p>}

        <p className="mt-5 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
          A sandbox to try any transaction. One transaction is a signal; an opportunity is many, combined.
        </p>
      </div>
    </div>
  );
}

function ModelRaceRow({ row, selected }: { row: RaceRow; selected: boolean }) {
  const v = row.verdict;
  const color = (v?.pillar && PILLAR_COLOR[v.pillar]) ?? PILLAR_COLOR.Review;
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${selected ? "bg-white ring-2" : "border-slate-200 bg-white"}`}
      style={selected ? ({ borderColor: "transparent", ["--tw-ring-color" as string]: NAVY } as React.CSSProperties) : undefined}
    >
      <span className="w-28 flex-none truncate font-mono text-[11px] font-semibold text-slate-700" title={row.model}>
        {shortModel(row.model)}
      </span>
      {row.state === "pending" && (
        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" /> querying…
        </span>
      )}
      {row.state === "timeout" && <span className="ml-auto text-[10px] font-medium text-amber-600">timed out</span>}
      {row.state === "error" && <span className="ml-auto text-[10px] text-slate-300">no response</span>}
      {row.state === "done" && v && (
        <>
          <span className="truncate text-xs text-slate-600">{v.merchant || "—"}</span>
          <span className="ml-auto flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}1a`, color }}>
            {v.pillar}
          </span>
          <span className="flex-none rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}14`, color }}>
            {Math.round((v.confidence ?? 0) * 100)}%
          </span>
          <span className="w-12 flex-none text-right text-[10px] text-slate-400">{v.latencyMs}ms</span>
          {selected && (
            <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full" style={{ backgroundColor: NAVY }}>
              <Check className="h-2.5 w-2.5 text-white" />
            </span>
          )}
        </>
      )}
    </div>
  );
}

function EnrichRow({ tx, state }: { tx: RawTxn; state: "done" | "active" | "queued" }) {
  const color = PILLAR_COLOR[tx.pillar] ?? PILLAR_COLOR.Review;
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1.4fr)] items-center gap-2 rounded-xl border px-3 py-2 transition ${
        state === "queued" ? "border-slate-100 bg-slate-50/50 opacity-50" : "border-slate-200 bg-white"
      }`}
    >
      <span className="truncate font-mono text-[11px] text-slate-500" title={tx.raw}>
        {tx.raw}
      </span>
      <ArrowRight className={`h-3 w-3 ${state === "active" ? "animate-pulse" : ""}`} style={{ color: state === "queued" ? "#cbd5e1" : NAVY }} />
      {state === "done" ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-slate-900">{tx.merchant}</span>
          <span className="hidden rounded px-1.5 py-0.5 text-[10px] font-semibold sm:inline" style={{ backgroundColor: `${color}1a`, color }}>
            {tx.pillar}
          </span>
          <span className="ml-auto flex-none rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}14`, color }}>
            {(tx.conf * 100).toFixed(0)}%
          </span>
        </div>
      ) : state === "active" ? (
        <span className="text-xs font-medium text-slate-400">enriching…</span>
      ) : (
        <span className="text-xs text-slate-300">queued</span>
      )}
    </div>
  );
}

function AuthorityRow({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
      <span>{text}</span>
    </div>
  );
}

/* ───────────────────────── Scene 3 · Action ───────────────────────── */

function ActionScene({ opp, accepts }: { opp: Opportunity; accepts: number }) {
  const [prep, setPrep] = useState<MeetingPrep | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState(false);
  const precision = Math.min(96, 86 + accepts * 2);

  useEffect(() => {
    setPrep(null);
    setPrepError(false);
  }, [opp.id]);

  const generate = async () => {
    if (prepLoading) return;
    setPrepLoading(true);
    setPrepError(false);
    const res = await invokeMeetingPrep({
      type: opp.type,
      client: opp.client,
      value: opp.value,
      reason: opp.reason,
      action: opp.action,
      evidence: opp.rawTransactions.map((t) => t.tag),
    });
    if (res) setPrep(res);
    else setPrepError(true);
    setPrepLoading(false);
  };

  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Next best action</Eyebrow>
          <Question>What is the recommended action?</Question>
          <p className="mt-4 text-2xl font-semibold leading-9 text-slate-900">{opp.action}</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}0d` }}>
            <Target className="h-5 w-5 flex-none" style={{ color: GREEN }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Outcome at stake</p>
              <p className="text-base font-semibold text-slate-900">{opp.outcome}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: NAVY }} />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {prep ? "AI meeting prep" : "Meeting prep"}
              </p>
              {prep?.model && (
                <AiTag label={shortModel(prep.model)} title={`Routed to ${prep.model} — instruction-following generation.`} />
              )}
            </div>
            <button
              onClick={generate}
              disabled={prepLoading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
            >
              {prepLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {prepLoading ? "Generating" : prep ? "Regenerate" : "Generate meeting prep"}
            </button>
          </div>

          {prepLoading ? (
            <div className="mt-4 space-y-2.5">
              {[88, 72, 80, 64].map((w, k) => (
                <div key={k} className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${w}%` }} />
              ))}
              <p className="pt-1 text-[11px] text-slate-400">Drafting a prep tailored to {opp.client}…</p>
            </div>
          ) : prep ? (
            <>
              {prep.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{prep.summary}</p>}
              {prep.agenda?.length ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Agenda</p>
                  <ul className="mt-2 space-y-1.5">
                    {prep.agenda.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                        <Check className="mt-1 h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Talking points</p>
              <ol className="mt-3 space-y-2.5">
                {(prep.talkingPoints?.length ? prep.talkingPoints : opp.talkingPoints).map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-6 text-slate-700">{t}</span>
                  </li>
                ))}
              </ol>
              {prep.nextStep && (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Next step:</span> {prep.nextStep}
                </p>
              )}
            </>
          ) : prepError ? (
            <>
              <p className="mt-3 text-xs font-medium text-amber-700">
                Couldn't reach the AI — showing the standard brief. (Check OPENROUTER_API_KEY, or the session cap.)
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Talking points</p>
              <ol className="mt-3 space-y-2.5">
                {opp.talkingPoints.map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-6 text-slate-700">{t}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
              <Sparkles className="mx-auto h-5 w-5" style={{ color: NAVY }} />
              <p className="mt-2 text-sm font-medium text-slate-700">No brief yet</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Generate an AI meeting prep tailored to {opp.client} — summary, agenda, talking points, and a next step.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-3.5 w-3.5" style={{ color: GREEN }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Gets sharper with every decision</p>
              <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${GREEN}14`, color: GREEN }}>
                precision {precision}%
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Learns from your advisors' accepts and rejects — tuned to your book, on your data only.
            </p>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Scene 4 · Review ───────────────────────── */

type Guard = { label: string; status: "pass" | "flag"; note?: string };

// Controlled policy the Merrill risk team can tune — within bounds Ventus defines.
type Policy = {
  suitabilityThreshold: number; // flag Reg BI enhanced review at/above this value
  fhSuppression: boolean;
  campaignConsent: boolean;
};
const DEFAULT_POLICY: Policy = {
  suitabilityThreshold: 1_000_000,
  fhSuppression: true,
  campaignConsent: true,
};
const SUITABILITY_OPTIONS = [500_000, 1_000_000, 2_000_000];

// Guardrails are evaluated per household, against the current (tunable) policy.
function evaluateGuardrails(opp: Opportunity, policy: Policy): Guard[] {
  const complex = valueNum(opp.value) >= policy.suitabilityThreshold || opp.destination === "queue";
  const campaign = opp.destination === "campaign";
  const guards: Guard[] = [{ label: "Relationship owner + Reg BI best-interest", status: "pass", note: opp.owner }];
  if (campaign && policy.campaignConsent) {
    guards.push({ label: "Marketing consent + opt-in verified", status: "pass" });
  } else if (!campaign) {
    guards.push({ label: "Client consent + Preferred Rewards eligibility", status: "pass" });
  }
  if (policy.fhSuppression) {
    const vulnerable = opp.fvi === "elevated";
    guards.push({
      label: "Financial-health suppression (customer protection)",
      status: vulnerable ? "flag" : "pass",
      note: vulnerable ? "FVI elevated — suppress until reviewed" : "no protection flags",
    });
  }
  guards.push({
    label: "Reg BI suitability",
    status: complex ? "flag" : "pass",
    note: complex ? `Enhanced review ≥ ${fmtUsd(policy.suitabilityThreshold)}` : "best-interest aligned",
  });
  guards.push({ label: "Market supervision (OSJ) before outreach", status: "pass", note: "required" });
  return guards;
}

function clearActionLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("co-sign")) return "Request co-sign";
  if (l.includes("suitability")) return "Submit for review";
  return "Resolve";
}

function ReviewScene({ opp, policy }: { opp: Opportunity; policy: Policy }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [showChecks, setShowChecks] = useState(false);
  useEffect(() => {
    setResolved(new Set());
    setShowChecks(false);
  }, [opp.id, policy]);

  const guards = evaluateGuardrails(opp, policy);
  const flags = guards.filter((g) => g.status === "flag" && !resolved.has(g.label));
  const passes = guards.filter((g) => g.status === "pass" || resolved.has(g.label));
  const cleared = flags.length === 0;
  const resolve = (label: string) => setResolved((prev) => new Set(prev).add(label));

  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Routing & accountability</Eyebrow>
          <Question>Who should review it?</Question>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: NAVY }}>
              {opp.ownerInitials}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{opp.owner}</p>
              <p className="text-sm text-slate-500">{opp.ownerRole}</p>
              <p className="mt-1 text-xs text-slate-400">{opp.ownerReason}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: cleared ? GREEN : RED }} />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Guardrails</p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={cleared ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: `${RED}14`, color: RED }}
            >
              {cleared ? "Cleared for review" : `Hold · ${flags.length} to clear`}
            </span>
          </div>

          {cleared ? (
            /* Ambient: guardrails ran and passed — no full review needed */
            <div className="mt-4">
              <div className="flex items-center gap-3 rounded-2xl border-2 px-4 py-4" style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}08` }}>
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ backgroundColor: GREEN }}>
                  <Check className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">Cleared to act — no holds</p>
                  <p className="text-xs text-slate-500">Reg BI, consent, suppression, and supervision passed automatically.</p>
                </div>
              </div>
              <button onClick={() => setShowChecks((v) => !v)} className="mt-2 text-[11px] font-medium text-slate-400 transition hover:text-slate-600">
                {showChecks ? "Hide checks" : `View ${passes.length} checks`}
              </button>
              {showChecks && (
                <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {passes.map((g) => (
                    <div key={g.label} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                      <span className="truncate" title={g.label}>
                        {g.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Exception: something needs to clear — surface the full review */
            <>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: RED }}>
                  Needs to clear
                </p>
                <div className="mt-2 space-y-2">
                  {flags.map((g) => (
                    <div key={g.label} className="flex items-center gap-3 rounded-xl border-2 px-4 py-3" style={{ borderColor: `${RED}33`, backgroundColor: `${RED}08` }}>
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: RED }}>
                        !
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{g.label}</p>
                        {g.note && <p className="text-xs text-slate-500">{g.note}</p>}
                      </div>
                      <button
                        onClick={() => resolve(g.label)}
                        className="flex-none rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition"
                        style={{ backgroundColor: NAVY }}
                      >
                        {clearActionLabel(g.label)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Cleared · {passes.length}</p>
                <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {passes.map((g) => (
                    <div key={g.label} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                      <span className="truncate" title={g.label}>
                        {g.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
            <ClipboardCheck className="h-4 w-4" /> Associate validates → Advisor acts in CEW → Risk monitors. Logged at each step.
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Scene 5 · Route ───────────────────────── */

type RouteAction = { label: string; verb: string; system: string; desc: string; icon: typeof Sparkles; primary?: boolean };

function routeActions(opp: Opportunity): RouteAction[] {
  switch (opp.destination) {
    case "queue":
      return [
        { label: "Route to specialist queue", verb: "Route", system: "Private Bank · Salesforce", desc: "Hands off to the Private Bank specialist pool.", icon: Landmark, primary: true },
        { label: "Schedule intro", verb: "Schedule", system: "Zoom", desc: "Books an intro call with the specialist.", icon: Video },
      ];
    case "rewards":
      return [
        { label: "Flag for deepening", verb: "Flag", system: "Preferred Rewards", desc: "Queues a Preferred Rewards deepening review.", icon: Coins, primary: true },
        { label: "Notify advisor", verb: "Notify", system: "CEW · Book 360", desc: "Pings the relationship advisor in CEW.", icon: LayoutDashboard },
      ];
    case "campaign":
      return [
        { label: "Enroll in nurture", verb: "Enroll", system: "Marketing Cloud", desc: "Adds to a consent-based, advisor-branded nurture.", icon: Megaphone, primary: true },
        { label: "Set consent reminder", verb: "Set", system: "Salesforce", desc: "Schedules a consent-check reminder.", icon: ShieldCheck },
      ];
    default:
      return [
        { label: "Create task", verb: "Create", system: "CEW · Book 360", desc: "Adds a priority task to the advisor's Book 360.", icon: LayoutDashboard, primary: true },
        { label: "Schedule meeting", verb: "Schedule", system: "Zoom", desc: "Books a Zoom meeting; AI prep + notes sync to Salesforce.", icon: Video },
        { label: "Pull collateral", verb: "Pull", system: "Seismic", desc: "Attaches approved talking materials from Seismic.", icon: FileText },
      ];
  }
}

function RouteScene({ opp, routed, accepts, onRoute }: { opp: Opportunity; routed: boolean; accepts: number; onRoute: () => void }) {
  const target = destinations.find((d) => d.id === opp.destination) ?? destinations[0];
  const TargetIcon = target.icon;
  const precision = Math.min(96, 86 + accepts * 2);
  const actions = routeActions(opp);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  useEffect(() => {
    setActionMsg(null);
    setDoneActions(new Set());
  }, [opp.id]);

  const handle = (a: { label: string; system: string; primary?: boolean }) => {
    if (a.primary) {
      onRoute();
    } else {
      setDoneActions((p) => new Set(p).add(a.label));
      setActionMsg(`${a.label} · ${a.system}`);
    }
  };

  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <Eyebrow>Delivery</Eyebrow>
          <Question>Where does it go next?</Question>
          <div className="mt-5 rounded-2xl border-2 bg-white p-4" style={{ borderColor: `${NAVY}22` }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Routes to</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="rounded-xl p-2.5" style={{ backgroundColor: `${NAVY}0d` }}>
                <TargetIcon className="h-5 w-5" style={{ color: NAVY }} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{target.label}</p>
                <p className="text-xs text-slate-500">{opp.destinationWhy}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Next actions</p>
          <div className="mt-2 space-y-2">
            {actions.map((a) => {
              const Icon = a.icon;
              const isDone = a.primary ? routed : doneActions.has(a.label);
              return (
                <div key={a.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                  <Icon className="h-4 w-4 flex-none" style={{ color: NAVY }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{a.system}</span>
                    </div>
                    <p className="text-xs text-slate-500">{a.desc}</p>
                  </div>
                  <button
                    onClick={() => handle(a)}
                    disabled={isDone}
                    className="flex flex-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-100"
                    style={
                      isDone
                        ? { backgroundColor: `${GREEN}14`, color: GREEN }
                        : a.primary
                          ? { backgroundColor: NAVY, color: "#fff" }
                          : { border: "1px solid #e2e8f0", color: NAVY }
                    }
                  >
                    {isDone ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Done
                      </>
                    ) : (
                      a.verb
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {routed && (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: GREEN }}>
              <Repeat className="h-4 w-4" /> Learned from your accept — precision now {precision}%.
            </p>
          )}
          {actionMsg && (
            <p className="mt-2 flex items-center gap-2 text-xs font-medium" style={{ color: GREEN }}>
              <Check className="h-3.5 w-3.5" /> {actionMsg}
            </p>
          )}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {destinations.map((d) => {
              const Icon = d.icon;
              const isTarget = d.id === opp.destination;
              return (
                <span
                  key={d.id}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${isTarget ? "" : "opacity-40"}`}
                  style={
                    isTarget
                      ? { borderColor: "transparent", backgroundColor: `${NAVY}0d`, color: NAVY }
                      : { borderColor: "#e2e8f0", color: "#64748b" }
                  }
                >
                  <Icon className="h-3 w-3" /> {d.short}
                </span>
              );
            })}
          </div>
          {doneActions.has("Schedule meeting") ? (
            <MeetingJourneyCard opp={opp} />
          ) : (
            <DestinationPreview opp={opp} routed={routed} />
          )}
        </div>
      </div>
    </SceneShell>
  );
}

function MeetingJourneyCard({ opp }: { opp: Opportunity }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          <span className="text-xs font-semibold">AI-Powered Meeting Journey</span>
        </div>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">Zoom</span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{opp.type}</p>
            <p className="text-xs text-slate-400">{opp.client}</p>
          </div>
          <span className="flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${NAVY}0d`, color: NAVY }}>
            Thu · 2:00 PM
          </span>
        </div>
        <div className="mt-2">
          <AiTag label="AI prep attached" />
        </div>
        <ul className="mt-2 space-y-1">
          {opp.talkingPoints.slice(0, 3).map((t) => (
            <li key={t} className="flex items-start gap-2 text-xs text-slate-600">
              <Check className="mt-0.5 h-3 w-3 flex-none" style={{ color: GREEN }} /> {t}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-slate-400">Auto-notes sync to Salesforce after the call.</p>
      </div>
    </div>
  );
}

function DestinationPreview({ opp, routed }: { opp: Opportunity; routed: boolean }) {
  if (opp.destination === "advisor") return <Book360Mock opp={opp} routed={routed} />;
  return <RecipientCard opp={opp} routed={routed} />;
}

function Book360Mock({ opp, routed }: { opp: Opportunity; routed: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-xs font-semibold">Client Engagement Workstation</span>
        </div>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">Book 360</span>
      </div>

      <div className="flex gap-1 border-b border-slate-200 px-3 pt-2 text-[11px]">
        {["Overview", "Insights", "Tasks"].map((t, i) => (
          <span
            key={t}
            className={i === 1 ? "rounded-t-md bg-slate-100 px-2 py-1 font-semibold text-slate-800" : "px-2 py-1 text-slate-400"}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Insights</p>
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${GREEN}14`, color: GREEN }}>
            <Sparkles className="h-3 w-3" /> via Ventus
          </span>
        </div>

        <div className="rounded-xl border-2 p-3" style={{ borderColor: routed ? GREEN : `${NAVY}22` }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{opp.client}</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{opp.confidence}%</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{opp.reason}</p>
          <p className="mt-2 text-[11px] font-semibold" style={{ color: NAVY }}>
            {opp.value} · {opp.valueLabel}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: NAVY }}>
              Create priority task
            </span>
            <span className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <MessageSquare className="h-3 w-3" /> Open in Ask Merrill
            </span>
          </div>
          {routed && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-medium" style={{ color: GREEN }}>
              <Check className="h-3 w-3" /> Added to Book 360 just now
            </p>
          )}
        </div>

        <p className="mt-2 text-[10px] text-slate-400">1 new insight today · sits beside your reviews &amp; birthdays</p>
      </div>
    </div>
  );
}

function RecipientCard({ opp, routed }: { opp: Opportunity; routed: boolean }) {
  const target = destinations.find((d) => d.id === opp.destination) ?? destinations[0];
  const Icon = target.icon;
  return (
    <div className="rounded-2xl border-2 bg-white p-5 shadow-sm" style={{ borderColor: routed ? GREEN : `${NAVY}22` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ backgroundColor: `${NAVY}0d` }}>
            <Icon className="h-5 w-5" style={{ color: NAVY }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{target.label}</p>
            <p className="text-xs text-slate-400">{target.sub}</p>
          </div>
        </div>
        <span
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={routed ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: `${NAVY}0d`, color: NAVY }}
        >
          {routed ? <Check className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
          {routed ? "Received" : "Incoming"}
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">{opp.client}</span>
          <span className="text-[11px] font-semibold" style={{ color: NAVY }}>{opp.value}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-600">{opp.reason}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Scene 6 · Whole book (leadership) ───────────────────────── */

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

// Market-executive KPIs computed from the live book (clients + prospects).
function bookMetrics() {
  const book = advisorBook;
  const pipeline = book.reduce((s, o) => s + valueNum(o.value), 0);
  const atRisk = book
    .filter((o) => (OPP_GOALS[o.id] ?? []).includes("retention"))
    .reduce((s, o) => s + valueNum(o.value), 0);
  return [
    { value: fmtUsd(pipeline), label: "Pipeline in motion", sub: `${book.length} qualified this week` },
    { value: fmtUsd(atRisk), label: "Assets at risk", sub: "could leave the book" },
    { value: "62%", label: "Coverage", sub: "opportunities being worked" },
    { value: "41%", label: "Advisor acceptance", sub: "7-day average" },
  ];
}

type StrategicObjective = "retain" | "speed" | "control";

type ResponsePath = {
  name: string;
  impact: string;
  tradeoff: string;
};

type ObjectiveRecommendation = {
  path: string;
  impact: string;
  rationale: string;
  source?: string;
  confidence?: number;
  keyRisks?: string[];
};

type DemandPlay = {
  icon: typeof Sparkles;
  signal: string;
  qualitative: string;
  guardrail: string;
  households: string;
  product: string;
  proof: string;
  execMove: string;
  aiAction: string;
  nextStep: string;
  owner: string;
  scenarios: ResponsePath[];
  recommendations: Record<StrategicObjective, ObjectiveRecommendation>;
};

const strategicObjectives: { id: StrategicObjective; label: string }[] = [
  { id: "retain", label: "Max NNA" },
  { id: "speed", label: "Speed" },
  { id: "control", label: "Control" },
];

const preferredStrategyByObjective: Record<StrategicObjective, string> = {
  retain: "Private-credit coverage strategy",
  speed: "Private-market access strategy",
  control: "Digital-asset coverage strategy",
};

function objectiveFromText(text: string): StrategicObjective {
  const normalized = text.toLowerCase();
  if (/(fast|quick|speed|pilot|test|launch|learn)/.test(normalized)) return "speed";
  if (/(risk|control|compliance|suitability|supervision|policy|safe)/.test(normalized)) return "control";
  return "retain";
}

const demandPlays: DemandPlay[] = [
  {
    icon: Coins,
    signal: "$210M moving to private-market & alt platforms",
    qualitative: "Advisor notes: founders asking about pre-IPO liquidity.",
    guardrail: "Eligibility, suitability, and product approval required.",
    households: "1,840 households",
    product: "Private-market access strategy",
    proof: "Citi is already tokenizing private shares.",
    execMove: "Size product case",
    aiAction: "Ranks objective, demand, speed, and control.",
    nextStep: "Recommended focus",
    owner: "Product Strategy",
    scenarios: [
      { name: "Watch only", impact: "$42M leakage risk", tradeoff: "No learning" },
      { name: "Partner access pilot", impact: "$74M upside", tradeoff: "Diligence needed" },
      { name: "Build tokenized Merrill access", impact: "$118M upside", tradeoff: "Longer approval" },
    ],
    recommendations: {
      retain: {
        path: "Build tokenized Merrill access",
        impact: "$118M upside",
        rationale: "Clients are already moving toward private-market access, and Citi is pushing tokenized private shares. Merrill should test its own access path before assets and mindshare move to external platforms.",
      },
      speed: {
        path: "Partner access pilot",
        impact: "$74M upside",
        rationale: "Citi's tokenization move suggests the category is forming now. A partner pilot lets Merrill learn demand and controls quickly without waiting on a full internal build.",
      },
      control: {
        path: "Eligibility rulebook + partner diligence",
        impact: "$74M controlled upside",
        rationale: "Because access products carry eligibility and suitability risk, Merrill should define the rulebook before exposing clients to any partner or proprietary option.",
      },
    },
  },
  {
    icon: LineChart,
    signal: "Crypto on-ramp outflows up 37% (mass-affluent)",
    qualitative: "Service notes: clients asking advisors how to hold digital assets safely.",
    guardrail: "Suitability, education, and risk disclosures first.",
    households: "3,200 households",
    product: "Digital-asset coverage strategy",
    proof: "Money leaving for venues you don't monetize.",
    execMove: "Choose coverage model",
    aiAction: "Ranks sophistication, risk, suitability, and readiness.",
    nextStep: "Recommended focus",
    owner: "Investment Solutions",
    scenarios: [
      { name: "Education only", impact: "Low risk", tradeoff: "Limited capture" },
      { name: "Advisor referral", impact: "$51M upside", tradeoff: "Training needed" },
      { name: "Managed sleeve pilot", impact: "$92M demand", tradeoff: "More approvals" },
    ],
    recommendations: {
      retain: {
        path: "Managed sleeve pilot",
        impact: "$92M demand",
        rationale: "Crypto on-ramp outflows show assets leaving for unmanaged venues. A managed sleeve gives Merrill a supervised retention path instead of ceding the relationship to Coinbase, ETFs, or outside advisors.",
      },
      speed: {
        path: "Advisor referral",
        impact: "$51M upside",
        rationale: "The quickest near-term move is not a new product; it is routing high-fit clients to trained advisors with approved education and referral language.",
      },
      control: {
        path: "Digital-asset education guardrails",
        impact: "Lower risk",
        rationale: "Client demand is visible, but suitability risk is high. Education guardrails let Merrill keep the relationship warm without implying a product recommendation.",
      },
    },
  },
  {
    icon: Layers,
    signal: "Rising private-credit interest (HNW)",
    qualitative: "CRM notes: HNW clients asking for yield beyond public markets.",
    guardrail: "Accreditation, liquidity, and concentration limits apply.",
    households: "640 households",
    product: "Private-credit coverage strategy",
    proof: "Concentrated, addressable demand.",
    execMove: "Commission pilot",
    aiAction: "Finds best-fit households, advisors, and markets.",
    nextStep: "Recommended focus",
    owner: "Market Leadership",
    scenarios: [
      { name: "Advisor education track", impact: "Advisor ready", tradeoff: "Weak capture" },
      { name: "Specialist-led review", impact: "$63M routed", tradeoff: "Capacity needed" },
      { name: "Private-credit pilot", impact: "$145M tested", tradeoff: "Committee path" },
    ],
    recommendations: {
      retain: {
        path: "Private-credit pilot",
        impact: "$145M tested",
        rationale: "HNW clients are signaling demand for yield beyond public markets while private-credit platforms compete for allocation. A controlled pilot lets Merrill test capture before that demand leaves the franchise.",
      },
      speed: {
        path: "Specialist triage desk",
        impact: "$63M routed",
        rationale: "If speed matters, Merrill can use existing specialists now instead of waiting for a full product rollout. The AI routes only high-fit cases with clear evidence.",
      },
      control: {
        path: "Supervised specialist review",
        impact: "$63M supervised",
        rationale: "Private credit has liquidity and concentration risk, so the safest route is a supervised specialist review before any broader coverage motion.",
      },
    },
  },
];

async function rankStrategyResponse(play: DemandPlay, objectiveLabel: string): Promise<ObjectiveRecommendation> {
  const response = await fetch("/api/strategy-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ventus-client": "web-app",
    },
    body: JSON.stringify({
      objective: objectiveLabel,
      signal: play.signal,
      households: play.households,
      candidateResponse: play.product,
      evidence: play.proof,
      owner: play.owner,
      responsePaths: play.scenarios,
    }),
  });

  if (!response.ok) throw new Error(`strategy route failed: ${response.status}`);
  const data = (await response.json()) as {
    recommendedPath?: unknown;
    impactForecast?: unknown;
    rationale?: unknown;
    confidence?: unknown;
    keyRisks?: unknown;
    model?: unknown;
    latencyMs?: unknown;
  };

  return {
    path: typeof data.recommendedPath === "string" && data.recommendedPath ? data.recommendedPath : play.recommendations.retain.path,
    impact: typeof data.impactForecast === "string" && data.impactForecast ? data.impactForecast : play.recommendations.retain.impact,
    rationale: typeof data.rationale === "string" && data.rationale ? data.rationale : play.recommendations.retain.rationale,
    confidence: typeof data.confidence === "number" ? data.confidence : undefined,
    keyRisks: Array.isArray(data.keyRisks) ? (data.keyRisks.filter((r) => typeof r === "string") as string[]).slice(0, 3) : undefined,
    source: typeof data.model === "string" ? shortModel(data.model) : undefined,
  };
}

function BookScene() {
  const bookOutcomes = bookMetrics();
  const [objective, setObjective] = useState<StrategicObjective>("retain");
  const [customObjective, setCustomObjective] = useState("");
  const [analyses, setAnalyses] = useState<Set<string>>(new Set());
  const [rankedRecommendations, setRankedRecommendations] = useState<Record<string, ObjectiveRecommendation>>({});
  const [rankingBusy, setRankingBusy] = useState<string | null>(null);
  const selectedObjective = strategicObjectives.find((item) => item.id === objective) ?? strategicObjectives[0];
  const isCustom = customObjective.trim().length > 0;
  const objectiveText = customObjective.trim() || selectedObjective.label;
  const localObjective = customObjective.trim() ? objectiveFromText(customObjective) : objective;
  const selectedPlay = demandPlays.find((p) => p.product === preferredStrategyByObjective[localObjective]) ?? demandPlays[0];
  const runAnalysis = useCallback(
    async (play: DemandPlay) => {
      const key = `${play.product}:${objectiveText}`;
      setRankingBusy(key);
      try {
        const ranked = await rankStrategyResponse(play, objectiveText);
        setRankedRecommendations((prev) => ({ ...prev, [key]: ranked }));
      } catch {
        const fallback = play.recommendations[localObjective];
        setRankedRecommendations((prev) => ({
          ...prev,
          [key]: { ...fallback, source: "Local fallback · OpenRouter route unavailable in this session" },
        }));
      } finally {
        setAnalyses((prev) => new Set(prev).add(key));
        setRankingBusy(null);
      }
    },
    [localObjective, objectiveText],
  );

  return (
    <SceneShell fill>
      <div className="grid h-full max-h-full grid-cols-[260px_minmax(0,1fr)] items-stretch gap-5">
        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Eyebrow>Leadership view</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight" style={{ color: NAVY }}>
            Whole-book signal.
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Market demand, product whitespace, and coverage capacity.</p>

          <div className="mt-5 grid flex-1 content-start gap-3">
            {bookOutcomes.map((o) => (
              <div key={o.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold leading-tight" style={{ color: NAVY }}>
                  {o.value}
                </p>
                <p className="mt-1 text-xs font-semibold leading-4 text-slate-700">{o.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" style={{ color: GREEN }} />
                <p className="text-sm font-semibold text-slate-900">Define objective</p>
              </div>
              <input
                value={customObjective}
                onChange={(event) => setCustomObjective(event.target.value)}
                placeholder="e.g. grow UHNW pipeline without new product approval"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300"
              />
            </div>
            <button
              onClick={() => runAnalysis(selectedPlay)}
              disabled={rankingBusy === `${selectedPlay.product}:${objectiveText}`}
              className="self-end rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              {rankingBusy === `${selectedPlay.product}:${objectiveText}` ? "Thinking" : "Ask Ventus"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {/* Custom text overrides the presets — dim the chips so it's clear which is driving. */}
            <div className={`flex gap-2 transition ${isCustom ? "opacity-40" : ""}`}>
              {strategicObjectives.map((item) => {
                const active = !isCustom && item.id === objective;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCustomObjective("");
                      setObjective(item.id);
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold transition"
                    style={{ borderColor: active ? NAVY : "#e2e8f0", backgroundColor: active ? `${NAVY}0d` : "white", color: active ? NAVY : "#334155" }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {isCustom && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <span>Custom objective overrides the presets</span>
                <button
                  onClick={() => setCustomObjective("")}
                  className="rounded-md border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {(() => {
            const p = selectedPlay;
            const analysisKey = `${p.product}:${objectiveText}`;
            const recommendation = rankedRecommendations[analysisKey] ?? p.recommendations[localObjective];
            const Icon = p.icon;
            return (
              <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 flex-none" style={{ color: NAVY }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Context</p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{p.signal}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <BriefMetric label="Households" value={p.households} />
                    <BriefMetric label="Area" value={p.product} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{p.qualitative}</p>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-1 flex-col rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Ventus recommends</p>
                      {recommendation.source ? (
                        <AiTag label={recommendation.source} title="Generated live for your objective" />
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Ask Ventus for a live take →</span>
                      )}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-950">{recommendation.path}</h2>
                    <p className="mt-2 text-sm font-semibold" style={{ color: NAVY }}>{recommendation.impact}</p>
                    <p className="mt-2 text-sm leading-5 text-slate-700">{recommendation.rationale}</p>

                    {recommendation.keyRisks?.length ? (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Key risks</p>
                        <ul className="mt-1 space-y-1">
                          {recommendation.keyRisks.map((r) => (
                            <li key={r} className="flex items-start gap-1.5 text-xs leading-4 text-slate-600">
                              <span className="mt-1 h-1 w-1 flex-none rounded-full bg-slate-400" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-slate-400">
                      <span>Evolves with your objective</span>
                      {typeof recommendation.confidence === "number" && (
                        <span className="font-semibold" style={{ color: NAVY }}>
                          {Math.round(recommendation.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>

                  {analyses.size > 0 && (
                    <p className="mt-3 text-xs font-medium" style={{ color: GREEN }}>
                      {analyses.size} recommendation{analyses.size > 1 ? "s" : ""} saved to learning loop.
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </section>
      </div>
    </SceneShell>
  );
}

function BriefMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-4 text-slate-800">{value}</p>
    </div>
  );
}

function SignalChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 line-clamp-3 text-xs font-semibold leading-4 text-slate-800">{value}</p>
    </div>
  );
}

/* ───────────────────────── Cover · persona fork ───────────────────────── */

function Cover({ onPick }: { onPick: (scene: number, mode: Mode) => void }) {
  return (
    <div className="flex h-full w-full items-center px-6 py-6 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Eyebrow>Guided walk-through · Ventus × Merrill</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: NAVY, lineHeight: 1.35 }}>
          One engine. Every seat at Merrill. Pick yours.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
          One Ventus engine. Start from any seat — switch any time.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CoverCard
            icon={UserRoundCheck}
            badge="Advisor"
            who="Advisor & client associate"
            body="Work your book — clients and prospects — from signal to action to routing."
            cta="Start the journey"
            onClick={() => onPick(0, "frontline")}
          />
          <CoverCard
            icon={LineChart}
            badge="Leadership"
            who="Market executive & strategy"
            body="Net new assets, coverage, retention, and the demand the market is signaling."
            cta="Go to the book view"
            onClick={() => onPick(5, "leadership")}
          />
        </div>

        <button onClick={() => onPick(0, "frontline")} className="mt-6 flex items-center gap-1.5 text-sm font-semibold" style={{ color: NAVY }}>
          Or play the full sequence <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CoverCard({
  icon: Icon,
  badge,
  who,
  body,
  cta,
  onClick,
}: {
  icon: typeof Sparkles;
  badge: string;
  who: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: `${NAVY}0d` }}>
          <Icon className="h-5 w-5" style={{ color: NAVY }} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{badge}</p>
          <p className="text-xs text-slate-400">{who}</p>
        </div>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{body}</p>
      <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5" style={{ color: GREEN }}>
        {cta} <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/* ───────────────────────── Scene 7 · Full system (three loops) ───────────────────────── */

const systemLoops = [
  { n: "1", title: "Discover", tag: "Sense demand, design the play", color: "#7c3aed", steps: ["Spot demand in the book", "Design the product or offer", "Pick the right cohort", "Build the business case"] },
  { n: "2", title: "Act", tag: "Work each household", color: "#2563eb", current: true, steps: ["Read the signals", "Surface the opportunity", "Recommend the move", "Clear the guardrails", "Route to the right place"] },
  { n: "3", title: "Run & learn", tag: "Across the whole book", color: "#b45309", steps: ["Run every household", "Watch precision & fairness", "Track net new assets", "Learn from outcomes"] },
];

function FullSystemScene() {
  return (
    <SceneShell>
      <div>
        <Eyebrow>The bigger picture</Eyebrow>
        <Question>From one household to the whole engine.</Question>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          You just worked <span className="font-semibold text-slate-900">one household</span> — the middle step. Around it:
          sensing <span className="font-semibold text-slate-900">what to build</span>, and running and learning across the{" "}
          <span className="font-semibold text-slate-900">whole book</span>.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {systemLoops.map((loop) => (
            <div
              key={loop.title}
              className="relative rounded-2xl bg-white p-5"
              style={{ border: `${loop.current ? 2 : 1}px solid ${loop.current ? loop.color : "#e2e8f0"}` }}
            >
              {loop.current && (
                <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: loop.color }}>
                  You just saw this
                </span>
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: loop.color }}>
                {loop.n}
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900">{loop.title}</p>
              <p className="text-xs text-slate-400">{loop.tag}</p>
              <ul className="mt-3 space-y-1.5">
                {loop.steps.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: loop.color }} /> {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
          <Repeat className="h-4 w-4" style={{ color: GREEN }} /> Every outcome feeds back — tuning recommendations and informing what to build next.
        </p>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Scene 8 · 90-day pilot ───────────────────────── */

const pilotPhases = [
  {
    weeks: "Weeks 1–2",
    title: "Wire-up",
    body: "Ingest a sanitized, de-identified sample (BofA-provided). Calibrate against your golden labels.",
  },
  {
    weeks: "Weeks 3–8",
    title: "Shadow run",
    body: "One market, ~5,000 households. Signals routed to Salesforce; advisors accept / reject in their normal flow.",
  },
  {
    weeks: "Weeks 9–12",
    title: "Proof",
    body: "Measure precision, advisor hours saved, qualified conversations, and AUM-in-motion. Tune from outcomes.",
  },
];

function PilotScene() {
  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Make it real</Eyebrow>
          <Question>What would a 90-day pilot look like?</Question>
          <p className="mt-4 text-base leading-7 text-slate-600">Start narrow, prove the loop, expand on evidence.</p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">What we need from BofA</p>
            </div>
            <div className="mt-3 space-y-2">
              {[
                "A sanitized, de-identified transaction sample for one market",
                "A golden-label set to grade against",
                "A Salesforce sandbox for routing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 flex-none" style={{ color: GREEN }} />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Nothing leaves your environment un-governed.</p>
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Target className="h-4 w-4" style={{ color: NAVY }} />
            Decision gate: scale to the next market if precision ≥ 90% and advisor accept-rate ≥ 35%.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-4 w-4" style={{ color: NAVY }} />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">The 90 days</p>
          </div>
          <div className="space-y-3">
            {pilotPhases.map((p, i) => (
              <div key={p.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                    {i + 1}
                  </span>
                  {i < pilotPhases.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" />}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{p.weeks}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Shared pieces ───────────────────────── */

function SceneShell({ children, fill }: { children: React.ReactNode; fill?: boolean }) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden px-6 py-6 sm:px-10">
      <div className={`mx-auto w-full max-w-6xl ${fill ? "h-full" : ""}`}>{children}</div>
    </div>
  );
}

function SceneFade({ sceneKey, children }: { sceneKey: number; children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [sceneKey]);
  return (
    <div
      className="h-full w-full"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateX(0)" : "translateX(16px)",
        transition: "opacity 380ms ease, transform 380ms ease",
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: NAVY }}>
      {children}
    </p>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl" style={{ color: NAVY }}>
      {children}
    </h1>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-4xl font-bold" style={{ color: accent ? GREEN : NAVY }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">{value}%</span>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative h-32 w-32 flex-none">
      <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={GREEN} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: NAVY }}>
          {value}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">confidence</span>
      </div>
    </div>
  );
}
