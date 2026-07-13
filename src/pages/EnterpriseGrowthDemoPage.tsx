import { useCallback, useEffect, useRef, useState } from "react";
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
  Home,
  Landmark,
  Layers,
  LayoutDashboard,
  LineChart,
  Loader2,
  LockKeyhole,
  MessageSquare,
  Megaphone,
  Network,
  Repeat,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Smartphone,
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
import { buildDeliveryPayload, type DeliveryPayload } from "@/lib/integrations";
import { appendEvents, ledgerRollup, verifyChain, isPipelineKind, type LedgerEvent, type LedgerKind, type LedgerDraft } from "@/lib/ledger";
import { pipelineEvents, runPipeline, type PipelineInput, type PipelineDerived } from "@/lib/pipeline";
import { leadershipCapabilities } from "@/lib/capabilities";
import { buildOpportunityFromPlaid, type DetectedOpportunity, type PlaidTransaction } from "@/lib/plaid";
import {
  compileObjectiveToSkill,
  promoteSkill,
  validateSkill,
  canPromote,
  promotionBlockers,
  nextStage,
  skillToSource,
  SKILL_STAGES,
  DEPOSIT_PRIMACY_SKILL,
  CONSUMER_MERRILL_SKILL,
  MERRILL_RELATIONSHIP_GROWTH_SKILL,
  type SkillArtifact,
} from "@/lib/skills";

const NAVY = "#012169";
const RED = "#E31837"; // risk/hold states + the BofA brand mark only
const GREEN = "#0B6B43"; // Merrill + the Ventus AI tag
const BLUE = "#0073CF"; // Consumer & Small Business accent
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

type DestId = "advisor" | "queue" | "rewards" | "campaign" | "banker" | "erica" | "lending" | "merrill";
type Mode = "consumer" | "frontline" | "operator" | "leadership";
type Lob = "consumer" | "wealth";
type LeadershipPath = "wealth-growth" | "deposit-retention";

type RawTxn = {
  raw: string;
  merchant: string;
  category: string;
  pillar: string;
  tag: string;
  conf: number;
  src?: string; // system of origin — retained so every recommendation can be traced to permitted evidence
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
  lob?: Lob; // which business owns the moment — defaults to wealth
  moat?: string; // concise explanation of the decision capability Ventus adds
  outflow?: string; // wallet-share leak (folded from Outflow Analysis) — retention evidence
  fvi?: "low" | "elevated"; // financial vulnerability (folded from FVI) — drives customer-protection suppression
};

const oppLob = (o: Opportunity): Lob => o.lob ?? "wealth";

const opportunities: Opportunity[] = [
  {
    id: "merrill-growth",
    type: "Qualified advisory conversion",
    client: "Harrington household",
    value: "$275K",
    valueLabel: "prospective NNA",
    confidence: 89,
    icon: TrendingUp,
    reason: "A self-directed Merrill client started an outside-asset transfer and engaged with planning content. No advisor is assigned.",
    whyNow: "The transfer is still in progress and the planning need is active.",
    moat: "Ventus turns Merrill's transfer, relationship, and engagement evidence into one governed advisor action.",
    rawTransactions: [
      { raw: "ACATS TRANSFER STARTED — $275K", merchant: "External asset transfer", category: "Investments · Transfer intent", pillar: "Wealth", tag: "$275K transfer initiated", conf: 0.96, src: "Merrill transfer workflow" },
      { raw: "MERRILL EDGE — SELF-DIRECTED", merchant: "Merrill Edge relationship", category: "Investments · Self-directed", pillar: "Wealth", tag: "No advisor assigned", conf: 0.94, src: "Merrill books" },
      { raw: "RETIREMENT PLANNING — 3 SESSIONS", merchant: "Planning engagement", category: "Digital · Advice intent", pillar: "Wealth", tag: "Planning intent rising", conf: 0.88, src: "Merrill digital" },
    ],
    action: "Assign the best-fit advisor and prepare a consolidation review.",
    outcome: "Capture $275K NNA and establish an advised relationship.",
    talkingPoints: ["Start with the planning need.", "Review the in-progress transfer together.", "Make the first meeting specific, not generic."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Capacity, market, and planning specialty match.",
    destination: "advisor",
    destinationWhy: "Qualified Merrill demand → named advisor.",
  },
  {
    id: "transition",
    type: "One-Bank transition",
    client: "Alvarez household",
    value: "$420K",
    valueLabel: "NNA at risk",
    confidence: 86,
    icon: TrendingUp,
    reason: "Deposits surging on-bank. Assets quietly leaking to an outside brokerage.",
    whyNow: "Transfer pattern completes in ~30 days.",
    moat: "Deposits and brokerage flows in one view — only a bank with both sides catches the leak.",
    rawTransactions: [
      { raw: "ACH DEP PAYROLL — UP 24%", merchant: "Payroll deposit", category: "Income · Payroll", pillar: "Income", tag: "Income ↑ 24%", conf: 0.97, src: "Deposit core" },
      { raw: "BofA CHECKING BAL +$56K (90d)", merchant: "BofA deposits", category: "Deposits · Idle balance", pillar: "Cash", tag: "Deposits surging on-bank", conf: 0.92, src: "Deposit core" },
      { raw: "WEB XFER → EXTERNAL BROKERAGE", merchant: "External brokerage", category: "Investments · Outbound transfer", pillar: "Wealth", tag: "Assets leaking off-bank", conf: 0.93, src: "Payments" },
    ],
    action: "Refer to Merrill: consolidation + planning review.",
    outcome: "Keep $420K NNA in the franchise.",
    talkingPoints: ["Lead with the banking relationship.", "Consolidation review vs. the outside brokerage.", "Diamond-tier discounts sweeten coming home."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Owns this market + household.",
    destination: "advisor",
    destinationWhy: "Advisor-led · time-sensitive leak.",
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
    reason: "Escrow wire in. Payroll stopped. A business just sold.",
    whyNow: "$1.2M idle in checking right now.",
    moat: "You banked the business — so you see the sale first, before any outside advisor hears about it.",
    rawTransactions: [
      { raw: "WIRE IN — ESCROW (BofA BIZ client)", merchant: "Escrow disbursement", category: "Deposits · One-time wire", pillar: "Cash", tag: "$1.2M inflow", conf: 0.96, src: "Business banking" },
      { raw: "ACH PAYROLL OUT — STOPPED", merchant: "Business payroll", category: "Income · Ended", pillar: "Business", tag: "Payroll outflow halted", conf: 0.91, src: "Business banking" },
      { raw: "ACCT CLOSE — LLC OPERATING", merchant: "LLC operating acct", category: "Accounts · Closed", pillar: "Business", tag: "Business wind-down", conf: 0.89, src: "Business banking" },
    ],
    action: "Introduce Private Bank: liquidity + tax planning.",
    outcome: "Capture $1.2M before a competitor does.",
    talkingPoints: ["Lead with tax on the proceeds.", "Trust + concentrated-position strategies.", "Warm handoff from the business banker."],
    owner: "Marcus Reed",
    ownerRole: "Private Bank RM",
    ownerInitials: "MR",
    ownerReason: "Above Private Bank threshold.",
    destination: "queue",
    destinationWhy: "Above threshold → specialist pool.",
  },
  {
    id: "rewards",
    type: "Preferred Rewards on the cusp",
    client: "Park household",
    value: "$680K",
    valueLabel: "to deepen",
    confidence: 84,
    icon: Coins,
    reason: "Near the Diamond threshold. Still self-directed.",
    whyNow: "Crossing the tier unlocks discounts now.",
    moat: "Tier math spans banking + Merrill balances. One franchise holds both — no competitor does.",
    rawTransactions: [
      { raw: "COMBINED BAL ~ $1M THRESHOLD", merchant: "BofA + Merrill balances", category: "Relationship · Tier", pillar: "Cash", tag: "Diamond tier on the cusp", conf: 0.9, src: "Rewards engine" },
      { raw: "MERRILL GUIDED INVESTING — SELF", merchant: "Merrill Guided Investing", category: "Investments · Self-directed", pillar: "Wealth", tag: "No advisor yet", conf: 0.86, src: "Merrill books" },
      { raw: "DEPOSIT + CARD + MORTGAGE HELD", merchant: "Multi-product household", category: "Relationship · Depth", pillar: "Cash", tag: "Deep banking relationship", conf: 0.84, src: "Deposit core" },
    ],
    action: "Introduce an advisor. Cross the Diamond threshold.",
    outcome: "Deepen to advised, at Diamond.",
    talkingPoints: ["Quantify the Diamond discount.", "Advice vs. self-directed, in numbers.", "One plan: banking + investing."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "One-Bank deepening play.",
    destination: "rewards",
    destinationWhy: "Tier moment → Preferred Rewards.",
  },
  {
    id: "college",
    type: "College-planning life event",
    client: "Bennett household",
    value: "529 plan",
    valueLabel: "opportunity",
    confidence: 78,
    icon: Target,
    reason: "Test prep + application fees. A college-bound household.",
    whyNow: "529 contributions are tax-year sensitive.",
    moat: "Card spend shows the life event years before assets move — signal only you own.",
    rawTransactions: [
      { raw: "SQ *KAPLAN TEST PREP", merchant: "Kaplan", category: "Education · Test prep", pillar: "Family & Community", tag: "College-bound", conf: 0.9, src: "Card rails" },
      { raw: "COMMON APP *FEE x7", merchant: "Application fees", category: "Education · Admissions", pillar: "Family & Community", tag: "Applying broadly", conf: 0.88, src: "Card rails" },
      { raw: "DELTA AIR 0061 + HOTEL", merchant: "Campus-visit travel", category: "Travel · Trip cluster", pillar: "Travel & Exploration", tag: "Campus visits", conf: 0.79, src: "Card rails" },
    ],
    action: "Enroll in a 529 education nurture.",
    outcome: "Open a long-horizon planning relationship.",
    talkingPoints: ["Educational, never salesy.", "Advisor-branded, consent-based.", "Hand to an advisor on engagement."],
    owner: "Lifecycle marketing",
    ownerRole: "Campaign owner",
    ownerInitials: "LM",
    ownerReason: "Early signal — nurture it.",
    destination: "campaign",
    destinationWhy: "Early intent → nurture.",
  },
  {
    id: "inheritance",
    type: "Intergenerational transfer",
    client: "Nguyen household",
    value: "$310K",
    valueLabel: "retention risk",
    confidence: 81,
    icon: Repeat,
    reason: "Estate distribution landed. The heir already banks here.",
    whyNow: "Heirs move assets within months.",
    moat: "The estate lands in your checking; the heir already banks with you. You see it first.",
    rawTransactions: [
      { raw: "ACH DEP — ESTATE DISTRIBUTION", merchant: "Estate distribution", category: "Deposits · Inheritance", pillar: "Cash", tag: "Inheritance inflow", conf: 0.92, src: "Deposit core" },
      { raw: "BENEFICIARY = BofA CUSTOMER", merchant: "Linked BofA household", category: "Relationship · Next-gen", pillar: "Family & Community", tag: "Heir already on-bank", conf: 0.88, src: "Household graph" },
      { raw: "IDLE CASH POST-INFLOW", merchant: "Uninvested cash", category: "Deposits · Idle balance", pillar: "Cash", tag: "Needs a plan", conf: 0.8, src: "Deposit core" },
    ],
    action: "Open the intergenerational conversation with the heir.",
    outcome: "Retain $310K across generations.",
    talkingPoints: ["Lead with estate settlement.", "Keep their BofA relationship central.", "One next-gen plan: bank + wealth."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Retention-critical heir.",
    destination: "advisor",
    destinationWhy: "Great-Wealth-Transfer retention.",
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
    reason: "New payroll started. Cash building. No investing yet.",
    whyNow: "First paychecks set the habits.",
    moat: "The first paycheck lands with you — decades before a wirehouse would meet them.",
    rawTransactions: [
      { raw: "ACH DEP — NEW EMPLOYER *5521", merchant: "New employer payroll", category: "Income · Payroll", pillar: "Income", tag: "New job", conf: 0.95, src: "Deposit core" },
      { raw: "BofA CHECKING +$9K / MONTH", merchant: "BofA deposits", category: "Deposits · Building", pillar: "Cash", tag: "Cash building on-bank", conf: 0.9, src: "Deposit core" },
      { raw: "NO INVESTMENT ACCOUNT FOUND", merchant: "Held products", category: "Relationship · Banking only", pillar: "Cash", tag: "Banking-only today", conf: 0.86, src: "Product catalog" },
    ],
    action: "Open a first investment account, automated.",
    outcome: "Win a 30-year relationship at day one.",
    talkingPoints: ["Congratulate the new role.", "Start small, automatic.", "Preferred Rewards grows with them."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Net-new household.",
    destination: "advisor",
    destinationWhy: "Yours to win.",
  },
  {
    id: "firsthome",
    type: "First-home saver",
    client: "Tran household",
    value: "$60K",
    valueLabel: "idle savings",
    confidence: 81,
    icon: Coins,
    reason: "Saving steadily. Pre-qual inquiry in. Renting today.",
    whyNow: "The down-payment clock is running.",
    moat: "Savings pattern + lending inquiry — the full-picture read only One Bank has.",
    rawTransactions: [
      { raw: "SAVINGS +$60K (12 mo)", merchant: "BofA savings", category: "Deposits · Idle balance", pillar: "Cash", tag: "Idle savings", conf: 0.9, src: "Deposit core" },
      { raw: "MORTGAGE PRE-QUAL INQUIRY", merchant: "Home-loan interest", category: "Lending · Inquiry", pillar: "Cash", tag: "First-home intent", conf: 0.85, src: "Home lending" },
      { raw: "RENT PAYMENTS RECURRING", merchant: "Rent", category: "Housing · Rent", pillar: "Family & Community", tag: "Renter today", conf: 0.82, src: "Deposit core" },
    ],
    action: "Connect home-buying help. Invest the surplus.",
    outcome: "Their advisor before the biggest buy of their life.",
    talkingPoints: ["Lead with the home goal.", "Coordinate with BofA home lending.", "Invest what the down payment doesn't need."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Net-new household.",
    destination: "advisor",
    destinationWhy: "Yours to win.",
  },
  {
    id: "rsu",
    type: "Recent grad · first RSU vest",
    client: "Okonkwo household",
    value: "$22K",
    valueLabel: "first equity",
    confidence: 79,
    icon: Sparkles,
    reason: "First RSU vest. Paying down student loans. No Roth.",
    whyNow: "First equity sets habits — before it's spent.",
    moat: "Equity comp lands in your deposit core — you meet the rising professional first.",
    rawTransactions: [
      { raw: "EMPLOYER RSU VEST", merchant: "Equity comp", category: "Investments · RSU", pillar: "Wealth", tag: "First RSU vest", conf: 0.9, src: "Deposit core" },
      { raw: "STUDENT LOAN PAYMENT", merchant: "Student loan", category: "Lending · Repayment", pillar: "Cash", tag: "Paying down debt", conf: 0.84, src: "Payments" },
      { raw: "NO RETIREMENT ACCOUNT", merchant: "Held products", category: "Relationship · Gap", pillar: "Cash", tag: "No Roth yet", conf: 0.8, src: "Product catalog" },
    ],
    action: "Coach on RSUs. Open a Roth IRA.",
    outcome: "Capture a rising professional early.",
    talkingPoints: ["RSU basics: taxes, diversify.", "Roth while income qualifies.", "Balance payoff with investing."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Net-new household.",
    destination: "advisor",
    destinationWhy: "Yours to win.",
  },
  {
    id: "smallinherit",
    type: "Small inheritance · on-bank",
    client: "Garcia household",
    value: "$45K",
    valueLabel: "first relationship",
    confidence: 82,
    icon: Repeat,
    reason: "Modest estate landed. Banks here. Never advised.",
    whyNow: "New money moves within weeks.",
    moat: "Below every wealth manager's radar — visible to the bank that already holds the deposit.",
    rawTransactions: [
      { raw: "ACH DEP — ESTATE (SMALL)", merchant: "Estate distribution", category: "Deposits · Inheritance", pillar: "Cash", tag: "Inheritance inflow", conf: 0.9, src: "Deposit core" },
      { raw: "EXISTING BofA CUSTOMER", merchant: "Linked BofA household", category: "Relationship · On-bank", pillar: "Family & Community", tag: "Already banks here", conf: 0.88, src: "Household graph" },
      { raw: "IDLE CASH POST-INFLOW", merchant: "Uninvested cash", category: "Deposits · Idle balance", pillar: "Cash", tag: "Needs a plan", conf: 0.8, src: "Deposit core" },
    ],
    action: "Offer a simple plan for the cash.",
    outcome: "First advised client from banking-only.",
    talkingPoints: ["Be sensitive — there's a loss here.", "Simple: emergency fund, then invest.", "Existing trust makes it easy."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Net-new household.",
    destination: "advisor",
    destinationWhy: "Yours to win.",
  },
  {
    id: "sidebiz",
    type: "Side-income on the rise",
    client: "Pham household",
    value: "$30K",
    valueLabel: "to organize",
    confidence: 78,
    icon: LineChart,
    reason: "Recurring P2P inflows. Side income growing. No retirement plan.",
    whyNow: "Self-employment needs a plan before tax season.",
    moat: "The side business runs on your payment rails — visible to you alone.",
    rawTransactions: [
      { raw: "ZELLE / CASH APP INFLOWS (RECURRING)", merchant: "Side income", category: "Income · Self-employment", pillar: "Income", tag: "Side income growing", conf: 0.86, src: "Payments" },
      { raw: "INCOME IRREGULAR — TRENDING UP", merchant: "Cash flow", category: "Income · Variable", pillar: "Income", tag: "Variable cash flow", conf: 0.82, src: "Deposit core" },
      { raw: "NO RETIREMENT ACCOUNT", merchant: "Held products", category: "Relationship · Gap", pillar: "Cash", tag: "No SEP/solo yet", conf: 0.79, src: "Product catalog" },
    ],
    action: "Cash-flow plan + SEP / solo 401(k).",
    outcome: "Anchor a future business owner early.",
    talkingPoints: ["Smooth the irregular income.", "SEP or solo 401(k).", "Tee up small-business banking."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Net-new household.",
    destination: "advisor",
    destinationWhy: "Yours to win.",
    fvi: "elevated",
  },
];

// The advisor works one book: existing clients + prospects.
const advisorBook: Opportunity[] = [...opportunities, ...prospectOpportunities];
const PROSPECT_IDS = new Set(prospectOpportunities.map((o) => o.id));

// Consumer & Small Business works its own market — primacy, deepening, lending,
// and the One-Bank handoffs that feed Merrill. Same engine, different surfaces.
const consumerOpportunities: Opportunity[] = [
  {
    id: "primacy",
    type: "Checking primacy at risk",
    client: "Whitaker household",
    value: "$84K",
    valueLabel: "deposits at risk",
    confidence: 88,
    icon: TrendingUp,
    lob: "consumer",
    reason: "Direct deposit split to a fintech. Spend migrating off-bank.",
    whyNow: "Second paycheck off-bank = primacy gone.",
    moat: "Payroll, card, and P2P rails in one franchise — no fintech sees what you see.",
    rawTransactions: [
      { raw: "ACH DEP PAYROLL — SPLIT 60/40", merchant: "Payroll deposit", category: "Income · Split direct deposit", pillar: "Income", tag: "Direct deposit splitting", conf: 0.95, src: "Deposit core" },
      { raw: "CHIME *DEBIT — RECURRING", merchant: "Fintech banking app", category: "Banking · Off-bank", pillar: "Cash", tag: "Spend moving off-bank", conf: 0.9, src: "Card rails" },
      { raw: "BofA CHECKING BAL −38% (60d)", merchant: "BofA checking", category: "Deposits · Drawdown", pillar: "Cash", tag: "Balances draining", conf: 0.92, src: "Deposit core" },
    ],
    action: "Book a banker conversation. Retention offer staged.",
    outcome: "Keep the checking that anchors everything.",
    talkingPoints: ["Ask what the app does better.", "Show the Rewards value they'd lose.", "Move the direct deposit back in-session."],
    owner: "Jordan Ellis",
    ownerRole: "Relationship Banker",
    ownerInitials: "JE",
    ownerReason: "Their home financial center.",
    destination: "banker",
    destinationWhy: "Retention is a human conversation.",
    outflow: "$3.1K/mo → fintech debit + external P2P",
  },
  {
    id: "idlecash",
    type: "Raise landed · cash idle",
    client: "Mehta household",
    value: "$28K",
    valueLabel: "earning nothing",
    confidence: 85,
    icon: Coins,
    lob: "consumer",
    reason: "Raise landed. Checking up 3 straight months. No goal attached.",
    whyNow: "Idle cash is a rate ad's target.",
    moat: "A raise never hits a CRM. It hits your deposit core — and now it acts.",
    rawTransactions: [
      { raw: "ACH DEP PAYROLL — UP 18%", merchant: "Payroll deposit", category: "Income · Payroll", pillar: "Income", tag: "Raise detected", conf: 0.96, src: "Deposit core" },
      { raw: "CHECKING BAL +$28K (90d)", merchant: "BofA checking", category: "Deposits · Idle balance", pillar: "Cash", tag: "Cash accumulating", conf: 0.93, src: "Deposit core" },
      { raw: "NO SAVINGS GOAL / CD FOUND", merchant: "Held products", category: "Relationship · Gap", pillar: "Cash", tag: "Nothing working for them", conf: 0.87, src: "Product catalog" },
    ],
    action: "Erica nudge: auto-transfer into a goal.",
    outcome: "Deepen before a competitor's rate ad does.",
    talkingPoints: ["Anchor the goal to the raise.", "Default to automatic.", "Show the tier the balance unlocks."],
    owner: "Erica",
    ownerRole: "Proactive insight · mobile app",
    ownerInitials: "E",
    ownerReason: "Digital-first: 41 app sessions, zero branch visits.",
    destination: "erica",
    destinationWhy: "They live in the app.",
  },
  {
    id: "homeintent",
    type: "First-home intent",
    client: "Douglas household",
    value: "$310K",
    valueLabel: "mortgage in play",
    confidence: 82,
    icon: Home,
    lob: "consumer",
    reason: "Rent up 12%. Saving $2.5K/mo. Browsing listings daily.",
    whyNow: "Pre-approval happens somewhere within 30 days.",
    moat: "Rent + savings + card reveal intent weeks before any credit pull — a head start only you get.",
    rawTransactions: [
      { raw: "RENT ACH — UP 12% AT RENEWAL", merchant: "Rent payment", category: "Housing · Rent", pillar: "Family & Community", tag: "Rent pressure", conf: 0.9, src: "Deposit core" },
      { raw: "SAVINGS XFER $2.5K/MO — 10 MO", merchant: "BofA savings", category: "Deposits · Goal saving", pillar: "Cash", tag: "Down-payment pattern", conf: 0.88, src: "Deposit core" },
      { raw: "ZILLOW / REDFIN — DAILY", merchant: "Home-search activity", category: "Lending · Research", pillar: "Family & Community", tag: "Actively shopping", conf: 0.8, src: "Card rails" },
    ],
    action: "Route to home lending for pre-approval.",
    outcome: "Win the mortgage — and the next decade.",
    talkingPoints: ["Lead with the house, not the loan.", "Pre-approval first.", "Rewards mortgage benefits on-bank."],
    owner: "Home Lending",
    ownerRole: "Lending specialist pool",
    ownerInitials: "HL",
    ownerReason: "Licensed conversation.",
    destination: "lending",
    destinationWhy: "Credit routes to specialists.",
  },
  {
    id: "prtier",
    type: "Preferred Rewards cusp",
    client: "Silva household",
    value: "$96K",
    valueLabel: "to bring on-bank",
    confidence: 84,
    icon: Sparkles,
    lob: "consumer",
    reason: "$4K below Platinum Honors. Savings sitting at another bank.",
    whyNow: "Tier math moves money this month.",
    moat: "Your payment rails reveal the held-away savings no rate ad ever will.",
    rawTransactions: [
      { raw: "COMBINED BAL — $4K BELOW TIER", merchant: "Preferred Rewards", category: "Relationship · Tier", pillar: "Cash", tag: "Platinum Honors cusp", conf: 0.92, src: "Rewards engine" },
      { raw: "XFER → EXTERNAL SAVINGS (ALLY)", merchant: "External savings", category: "Deposits · Off-bank", pillar: "Cash", tag: "Held-away savings", conf: 0.88, src: "Payments" },
      { raw: "CARD + AUTO LOAN ON-BANK", merchant: "Multi-product household", category: "Relationship · Depth", pillar: "Cash", tag: "Deep relationship already", conf: 0.86, src: "Product catalog" },
    ],
    action: "Show the tier math. Move savings on-bank.",
    outcome: "Deepen a loyal household.",
    talkingPoints: ["Do the math together.", "One transfer crosses the tier.", "Tee up Merrill Edge after."],
    owner: "Jordan Ellis",
    ownerRole: "Relationship Banker",
    ownerInitials: "JE",
    ownerReason: "Bankers convert tier moments.",
    destination: "rewards",
    destinationWhy: "Preferred Rewards owns tiers.",
  },
  {
    id: "wealthready",
    type: "Wealth-ready moment",
    client: "Chen household",
    value: "$230K",
    valueLabel: "NNA to Merrill",
    confidence: 90,
    icon: Repeat,
    lob: "consumer",
    reason: "401(k) rollover landed in checking. Idle 21 days. No advisor.",
    whyNow: "Rollover cash finds an advisor fast — yours or theirs.",
    moat: "The rollover appears in the deposit relationship before an external wealth platform sees it. Ventus turns that timing advantage into a qualified, governed handoff.",
    rawTransactions: [
      { raw: "ACH DEP — 401K ROLLOVER", merchant: "Retirement rollover", category: "Deposits · Rollover", pillar: "Wealth", tag: "$230K rollover landed", conf: 0.96, src: "Deposit core" },
      { raw: "IDLE 21 DAYS — NO INVESTMENT ACCT", merchant: "Uninvested cash", category: "Deposits · Idle balance", pillar: "Cash", tag: "Sitting in checking", conf: 0.93, src: "Deposit core" },
      { raw: "12-YEAR BofA RELATIONSHIP", merchant: "Relationship tenure", category: "Relationship · Depth", pillar: "Family & Community", tag: "Trusts the bank", conf: 0.9, src: "Household graph" },
    ],
    action: "Warm banker intro to a Merrill advisor.",
    outcome: "Convert a $230K on-bank liquidity moment into measurable NNA without a cold referral.",
    talkingPoints: ["Banker makes the intro — warm, named.", "Twelve years of trust is the pitch.", "Preferred Rewards ties it together."],
    owner: "Dana Whitfield",
    ownerRole: "Merrill Advisor",
    ownerInitials: "DW",
    ownerReason: "Mapped advisor for this market.",
    destination: "merrill",
    destinationWhy: "Lands in Book 360, referred.",
  },
];

const consumerBook: Opportunity[] = consumerOpportunities;

const destinations: { id: DestId; label: string; short: string; sub: string; icon: typeof Sparkles; lob?: Lob }[] = [
  { id: "advisor", label: "Client Engagement Workstation", short: "CEW", sub: "Book 360 priority task · Ask Merrill", icon: Building2, lob: "wealth" },
  { id: "queue", label: "Private Bank queue", short: "Private Bank", sub: "BofA Private Bank specialist pool", icon: Landmark, lob: "wealth" },
  { id: "rewards", label: "Preferred Rewards / banking", short: "Preferred Rewards", sub: "One-Bank deepening + banker follow-up", icon: Coins },
  { id: "campaign", label: "Lifecycle campaign", short: "Campaign", sub: "Consent-based, advisor-branded", icon: Megaphone, lob: "wealth" },
  { id: "banker", label: "Banker workbench", short: "Banker", sub: "Financial center · appointment + call list", icon: UserRoundCheck, lob: "consumer" },
  { id: "erica", label: "Erica proactive insight", short: "Erica", sub: "In-app nudge · Life Plan goal", icon: Smartphone, lob: "consumer" },
  { id: "lending", label: "Home Lending specialists", short: "Home Lending", sub: "Licensed pre-approval pool", icon: Home, lob: "consumer" },
  { id: "merrill", label: "Merrill advisor referral", short: "Merrill handoff", sub: "CEW · Book 360 warm referral", icon: GitBranch, lob: "consumer" },
];

const scenes = [
  { key: "find", nav: "Opportunities", question: "What opportunities did Ventus find?" },
  { key: "confidence", nav: "Evidence", question: "Why does this matter now?" },
  { key: "action", nav: "Recommend", question: "What should happen next?" },
  { key: "review", nav: "Govern", question: "Can this action proceed?" },
  { key: "route", nav: "Activate", question: "Where does it go next?" },
  { key: "book", nav: "Growth OS", question: "What should the institution do next?" },
  { key: "pilot", nav: "Pilot", question: "What would a 90-day pilot look like?" },
];

const totalBook = 1240;

/* ───────────────────────── Decision Ledger — the record class Ventus owns ─────────────────────────
   The spine lives in src/lib/ledger.ts (append-only, hash-chained, full event taxonomy).
   Skills, Studio, and dashboards are all views that read/write it. This map is just the
   visual dressing for each event kind. */
const LEDGER_META: Record<LedgerKind, { label: string; color: string; Icon: typeof Sparkles }> = {
  signal: { label: "Signal", color: "#0369a1", Icon: Activity },
  enrich: { label: "Enrich", color: "#0369a1", Icon: Cpu },
  score: { label: "Score", color: "#0369a1", Icon: LineChart },
  gate: { label: "Gate", color: "#64748b", Icon: ShieldCheck },
  decision: { label: "Decision", color: NAVY, Icon: Wand2 },
  policy: { label: "Policy", color: GREEN, Icon: ShieldCheck },
  activation: { label: "Activation", color: BLUE, Icon: Network },
  outcome: { label: "Outcome", color: AMBER, Icon: Repeat },
  counterfactual: { label: "Control", color: "#7c3aed", Icon: GitBranch },
  skill: { label: "Skill", color: "#7c3aed", Icon: GitBranch },
};

function destinationLabel(id: DestId): string {
  return destinations.find((d) => d.id === id)?.label ?? "the bank's system of record";
}

type DemoAudience = "leadership" | "internal";

export default function EnterpriseGrowthDemoPage({
  embedded = false,
  audience = "leadership",
  evaluationEnabled = false,
}: {
  embedded?: boolean;
  audience?: DemoAudience;
  evaluationEnabled?: boolean;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
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
  const [ledger, setLedger] = useState<LedgerEvent[]>([]);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [leadershipPath, setLeadershipPath] = useState<LeadershipPath>("wealth-growth");
  const internal = audience === "internal";
  const modelEvaluationAllowed = internal && evaluationEnabled;

  const addToCew = (items: { id: string; client: string; type: string; action: string }[]) =>
    setCewTasks((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      return [...prev, ...items.filter((t) => !ids.has(t.id))];
    });
  const cewIds = new Set(cewTasks.map((t) => t.id));

  const appendLedger = useCallback((drafts: LedgerDraft[]) => {
    if (!internal) return;
    setLedger((prev) => appendEvents(prev, drafts));
  }, [internal]);

  const seededRef = useRef<Set<Lob>>(new Set());
  useEffect(() => {
    if (!internal || !entered) return;
    const bookKey: Lob = mode === "consumer" ? "consumer" : "wealth";
    if (seededRef.current.has(bookKey)) return;
    const book = bookKey === "consumer" ? consumerBook : advisorBook;
    const drafts = book.flatMap((o) => {
      const d = DERIVED[o.id];
      return d ? pipelineEvents(OPP_INPUT(o), d) : [];
    });
    if (drafts.length) appendLedger(drafts);
    seededRef.current.add(bookKey);
  }, [internal, entered, mode, appendLedger]);
  const showsCew = mode === "consumer" || mode === "frontline";

  const activeOpps = mode === "consumer" ? consumerBook : advisorBook;
  const opp = activeOpps.find((o) => o.id === selectedId) ?? activeOpps[0];
  const lob: Lob = mode === "consumer" ? "consumer" : "wealth";

  const altMeta =
    mode === "leadership"
      ? { Icon: LineChart, label: "Growth portfolio" }
      : mode === "operator"
        ? { Icon: Wand2, label: "Skill Studio" }
      : mode === "consumer"
        ? { Icon: Landmark, label: "Consumer banking view" }
        : { Icon: UserRoundCheck, label: "Advisor view" };
  const AltIcon = altMeta.Icon;

  const brand =
    !internal
      ? { title: "Ventus Growth Intelligence", initial: "V", flag: false }
      : !entered
        ? { title: "Internal evaluation environment", initial: "V", flag: false }
      : mode === "leadership"
        ? { title: "Enterprise Growth Portfolio", initial: "B", flag: true }
        : mode === "operator"
          ? { title: "Ventus Skill Studio", initial: "V", flag: false }
      : mode === "consumer"
        ? { title: "Consumer & Small Business", initial: "B", flag: true }
        : { title: "Merrill Wealth Signals", initial: "M", flag: false };

  const enterAt = (s: number, m: Mode) => {
    const book = m === "consumer" ? consumerBook : advisorBook;
    setMode(m);
    setSelectedId(book[0].id);
    setScene(s);
    setEntered(true);
  };

  const enterLeadership = (path: LeadershipPath) => {
    const id = path === "wealth-growth" ? "transition" : "primacy";
    setLeadershipPath(path);
    setMode("leadership");
    setSelectedId(id);
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    (document.activeElement as HTMLElement | null)?.blur();
    let parent = root.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        parent.scrollTo({ top: 0 });
        break;
      }
      parent = parent.parentElement;
    }
  }, [entered, scene]);

  return (
    <main
      ref={rootRef}
      className={`flex flex-col bg-gradient-to-b from-white via-white to-slate-50 text-slate-950 ${embedded ? "h-full w-full overflow-auto rounded-xl border border-slate-200 xl:overflow-hidden" : "h-screen w-screen overflow-auto xl:overflow-hidden"}`}
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <header className="flex flex-none items-center justify-between gap-3 border-b border-slate-200 px-6 py-3 sm:px-10">
        <div className="flex items-center gap-3">
          <img src={ventusLogo} className="h-5 w-auto" alt="Ventus AI" />
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-xs font-black text-white" style={{ backgroundColor: NAVY }}>
            {brand.flag && <span className="absolute -right-1 top-0 h-8 w-[7px] rotate-[24deg]" style={{ backgroundColor: RED }} />}
            <span className="relative">{brand.initial}</span>
          </span>
          <span className="hidden text-sm font-semibold sm:inline" style={{ color: NAVY }}>
            {brand.title}
          </span>
          {entered && (
            <span
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold lg:flex"
              style={{ backgroundColor: `${NAVY}0d`, color: NAVY }}
            >
              <AltIcon className="h-3 w-3" /> {altMeta.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {entered && internal && scene > 0 && scene < 5 && (
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:flex">
              <Eye className="h-3.5 w-3.5" style={{ color: GREEN }} />
              <span className="font-semibold text-slate-700">Following:</span>
              <span className="text-slate-500">
                {opp.client} · {opp.value}
              </span>
            </div>
          )}
          {entered && internal && (
            <button
              onClick={() => setEntered(false)}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <GitBranch className="h-3.5 w-3.5" style={{ color: NAVY }} /> Switch view
            </button>
          )}
          {entered && internal && (
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
          {entered && internal && (
            <button
              onClick={() => setLedgerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              title="Local evaluation ledger"
            >
              <Layers className="h-3.5 w-3.5" style={{ color: NAVY }} /> Ledger
              {ledger.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                  {ledger.length}
                </span>
              )}
            </button>
          )}
          {entered && showsCew && (
            <button
              onClick={() => setCewOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LayoutDashboard className="h-3.5 w-3.5" style={{ color: NAVY }} /> {lob === "consumer" ? "Queue" : "CEW"}
              {cewTasks.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: GREEN }}>
                  {cewTasks.length}
                </span>
              )}
            </button>
          )}
          {modelEvaluationAllowed && <button
            onClick={() => setLiveOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex"
          >
            <Wand2 className="h-3.5 w-3.5" style={{ color: GREEN }} /> Live enricher
          </button>}
        </div>
      </header>

      {!entered ? (
        <Cover onPick={enterAt} onLeadershipPick={enterLeadership} audience={audience} />
      ) : !internal ? (
        <LeadershipFlow path={leadershipPath} onExit={() => setEntered(false)} />
      ) : (
        <>
          <div className="relative min-h-0 flex-1">
            <SceneFade sceneKey={scene}>
              {scene === 0 && (
                <FindScene
                  opps={activeOpps}
                  lob={lob}
                  cewIds={cewIds}
                  onAddToCew={addToCew}
                  onLedger={appendLedger}
                  allowModelEvaluation={modelEvaluationAllowed}
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
                  allowSandboxDelivery={modelEvaluationAllowed}
                  onRoute={() => {
                    setRouted(true);
                    setAccepts((n) => n + 1);
                    if (opp.destination === "advisor" || opp.destination === "banker" || opp.destination === "merrill") {
                      addToCew([{ id: opp.id, client: opp.client, type: opp.type, action: opp.action }]);
                    }
                    appendLedger([
                      { eventKey: `${opp.id}:decision`, kind: "decision", title: opp.action, detail: `${opp.type} · moves ${pnlOf(opp.id)}`, ref: opp.client, skill: skillOf(opp.id), status: "simulated" },
                      { eventKey: `${opp.id}:policy`, kind: "policy", title: "Guardrails cleared", detail: oppLob(opp) === "consumer" ? "UDAAP · fair lending · consent" : "Reg BI · consent · supervision", ref: opp.client, skill: skillOf(opp.id), status: "simulated" },
                      { eventKey: `${opp.id}:activation`, kind: "activation", title: `Activated → ${destinationLabel(opp.destination)}`, detail: "Staged write to the configured system of record", ref: opp.client, skill: skillOf(opp.id), value: valueNum(opp.value), status: "simulated" },
                    ]);
                  }}
                />
              )}
              {scene === 5 && (
                <BookScene
                  mode={mode}
                  onLedger={appendLedger}
                  allowInternalTools={internal}
                  allowSimulatedEvidence={modelEvaluationAllowed}
                />
              )}
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

      {modelEvaluationAllowed && liveOpen && <LiveEnricher onClose={() => setLiveOpen(false)} />}
      {internal && ledgerOpen && <DecisionLedgerPanel events={ledger} onClose={() => setLedgerOpen(false)} />}
      {cewOpen && (
        <CewPanel
          lob={lob}
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
const PRIORITY_EXAMPLES: Record<Lob, string> = {
  wealth: "Households with idle cash and no advisor yet",
  consumer: "Households about to move their checking elsewhere",
};

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
  primacy: ["retention"],
  idlecash: ["deepen"],
  homeintent: ["growth", "deepen"],
  prtier: ["deepen", "retention"],
  wealthready: ["nna", "growth"],
};

// Exercise the stage contract with authored synthetic inputs. The derived fields prove
// deterministic UI and payload behavior; they do not establish enrichment accuracy.
const OPP_INPUT = (o: Opportunity): PipelineInput => ({
  id: o.id,
  client: o.client,
  type: o.type,
  value: o.value,
  valueLabel: o.valueLabel,
  lob: oppLob(o),
  destination: o.destination,
  goals: OPP_GOALS[o.id] ?? [],
  rawTransactions: o.rawTransactions,
});
const DERIVED: Record<string, PipelineDerived> = {};
for (const o of [...advisorBook, ...consumerBook]) {
  const d = runPipeline(OPP_INPUT(o));
  DERIVED[o.id] = d;
  o.confidence = d.confidence; // pipeline score replaces the authored placeholder
}
function derivedOf(id: string): PipelineDerived | undefined {
  return DERIVED[id];
}
function pnlOf(id: string): string {
  return DERIVED[id]?.pnlMetric ?? "Net new assets to Merrill ($)";
}
function skillOf(id: string): string {
  return DERIVED[id]?.skillSlug ?? "consumer-to-merrill-handoff";
}

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
  lob,
  onOpen,
  onFocus,
  cewIds,
  onAddToCew,
  onLedger,
  allowModelEvaluation,
}: {
  opps: Opportunity[];
  lob: Lob;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
  cewIds: Set<string>;
  onAddToCew: (items: { id: string; client: string; type: string; action: string }[]) => void;
  onLedger: (events: LedgerDraft[]) => void;
  allowModelEvaluation: boolean;
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
    if (!allowModelEvaluation) {
      setRanking(localRank(t, opps));
      setAiRanked(false);
      setAiModel("");
      return;
    }
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

  const ingestedTotal = opps.reduce((s, o) => s + (derivedOf(o.id)?.provenance.ingested ?? 0), 0);
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

  const doBulk = (label: string, display: string) => {
    const chosen = opps.filter((o) => sel.has(o.id));
    const ids = chosen.map((o) => o.id);
    setUndoIds(null);
    if (label === "Add to CEW tasks") {
      onAddToCew(chosen.map((o) => ({ id: o.id, client: o.client, type: o.type, action: o.action })));
      onLedger(chosen.map((o) => ({ kind: "activation" as const, title: display, detail: `${o.type} · ${o.value} ${o.valueLabel}`, ref: o.client })));
    } else if (label === "Assign to teammate") {
      setAssigned((prev) => {
        const next = { ...prev };
        ids.forEach((id) => (next[id] = TEAMMATE));
        return next;
      });
      onLedger(chosen.map((o) => ({ kind: "decision" as const, title: `Assigned to ${TEAMMATE}`, detail: o.type, ref: o.client })));
    } else if (label === "Dismiss") {
      setDismissed((prev) => new Set([...prev, ...ids]));
      setUndoIds(ids);
      onLedger(chosen.map((o) => ({ kind: "decision" as const, title: "Dismissed — not pursued", detail: o.type, ref: o.client })));
    }
    setBulkMsg(`${chosen.length} household${chosen.length === 1 ? "" : "s"} · ${display}`);
    setSel(new Set());
  };

  return (
    <SceneShell>
      <div className="flex flex-col gap-4">
        <div>
          <Eyebrow>{lob === "consumer" ? "Your market · this week" : "Your book · this week"}</Eyebrow>
          <Question>What should you act on today?</Question>
        </div>

        {/* Provenance + free-form, AI-ranked priority */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{ingestedTotal.toLocaleString()} transactions</span> →{" "}
              <span className="font-semibold text-slate-800">{totalBook.toLocaleString()} households</span> →{" "}
              <span className="font-semibold text-slate-800">
                {opps.length} qualified — {lob === "consumer" ? "ranked for your market" : "clients + prospects"}
              </span>
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
              setDraft(PRIORITY_EXAMPLES[lob]);
              runPriority(PRIORITY_EXAMPLES[lob]);
            }}
            className="mt-2 text-[11px] text-slate-400 transition hover:text-slate-600"
          >
            e.g. “{PRIORITY_EXAMPLES[lob]}” →
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
                      {isProspect ? "Prospects · win new" : lob === "consumer" ? "Households · defend & deepen" : "Clients · deepen & retain"}
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
                    aria-label={`${expanded ? "Hide" : "Show"} evidence for ${o.type}`}
                    className="flex flex-none items-center rounded-lg border border-slate-200 px-2 py-1.5 text-slate-500 transition hover:bg-slate-50"
                    title="Evidence"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={() => onOpen(o.id)}
                    aria-label={`Open ${o.type} for ${o.client}`}
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
                            {tx.src && (
                              <span className="hidden w-20 flex-none truncate rounded bg-slate-100 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:block" title={tx.src}>
                                {tx.src}
                              </span>
                            )}
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
                const display = b.label === "Add to CEW tasks" && lob === "consumer" ? "Add to banker queue" : b.label;
                return (
                  <button
                    key={b.label}
                    onClick={() => doBulk(b.label, display)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Icon className="h-3.5 w-3.5" /> {display}
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

          {opp.moat && (
            <div className="mt-5 rounded-2xl border-2 p-4" style={{ borderColor: `${NAVY}22`, backgroundColor: `${NAVY}05` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
                Why this signal is defensible
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-800">{opp.moat}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {[...new Set(opp.rawTransactions.map((t) => t.src).filter(Boolean))].map((s) => (
                  <span key={s} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {s}
                  </span>
                ))}
                <ArrowRight className="h-3 w-3 text-slate-300" />
                <AiTag label="activated by Ventus" title="Your systems, your perimeter, your policies — Ventus assembles the signal under your governance." />
              </div>
            </div>
          )}
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
  { match: ["chime", "varo", "current *", "sofi", "cash app card"], merchant: "Fintech banking app", category: "Banking · Off-bank", pillar: "Cash", tag: "Primacy at risk", conf: 0.9 },
  { match: ["zillow", "redfin", "rocket mortgage", "mortgage"], merchant: "Home-search activity", category: "Lending · Research", pillar: "Family & Community", tag: "Home-buying signal", conf: 0.85 },
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
  lob,
  tasks,
  onRemove,
  onClose,
}: {
  lob: Lob;
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
            <span className="text-sm font-semibold">
              {lob === "consumer" ? "Banker workbench · Priority queue" : "Client Engagement Workstation · Book 360"}
            </span>
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
          <p className="mt-3 text-[11px] text-slate-400">
            {lob === "consumer"
              ? "Pilot target: stage these in the banker's workbench and appointment scheduler."
              : "Pilot target: stage these as Book 360 tasks in Salesforce."}
          </p>
        </div>
      </div>
    </div>
  );
}

// The Decision Ledger surface — the append-only record class Ventus owns.
function DecisionLedgerPanel({ events, onClose }: { events: LedgerEvent[]; onClose: () => void }) {
  const [showPipeline, setShowPipeline] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const roll = ledgerRollup(events);
  const intact = verifyChain(events);
  const pipelineCount = events.filter((e) => isPipelineKind(e.kind)).length;
  const visible = showPipeline ? events : events.filter((e) => !isPipelineKind(e.kind));
  const rows = [...visible].reverse();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="text-sm font-semibold">Local evaluation ledger</span>
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">prototype</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs leading-5 text-slate-500">
            Session-level trace of simulated signals, decisions, and staged activations. Production persistence remains pilot work.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-lg font-bold leading-none" style={{ color: NAVY }}>{roll.total}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">events</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-lg font-bold leading-none" style={{ color: NAVY }}>{roll.decisions}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">decisions</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-lg font-bold leading-none" style={{ color: BLUE }}>{roll.valueInMotion >= 1_000_000 ? `$${(roll.valueInMotion / 1_000_000).toFixed(1)}M` : roll.valueInMotion >= 1000 ? `$${Math.round(roll.valueInMotion / 1000)}K` : "$0"}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">in motion</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-lg font-bold leading-none" style={{ color: AMBER }}>{roll.measuring}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">measuring</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={intact ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: `${RED}14`, color: RED }}>
              <ShieldCheck className="h-3 w-3" /> {intact ? "Integrity chain valid" : "Integrity check failed"}
            </span>
            {pipelineCount > 0 && (
              <button onClick={() => setShowPipeline((v) => !v)} className="text-[11px] font-semibold text-slate-400 transition hover:text-slate-600">
                {showPipeline ? "Hide" : "Show"} {pipelineCount} pipeline events
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              Nothing logged yet. Activate a recommendation or promote a skill — every step is recorded here.
            </p>
          ) : (
            <div className="mt-3 space-y-1.5">
              {rows.map((e) => {
                const m = LEDGER_META[e.kind];
                const Icon = m.Icon;
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg" style={{ backgroundColor: `${m.color}14` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${m.color}14`, color: m.color }}>
                          {m.label}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-900">{e.title}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-4 text-slate-500">
                        {e.detail}
                        {e.ref ? <span className="text-slate-400"> · {e.ref}</span> : null}
                      </p>
                    </div>
                    <span className="flex-none font-mono text-[10px] text-slate-400">#{String(e.seq).padStart(3, "0")} · {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">
            This in-memory checksum chain is for prototype evaluation only. A production ledger requires persistent storage, tenant isolation, retention controls, and cryptographic signing.
          </p>
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

          <p className="mt-4 text-[11px] text-slate-400">Your risk team tunes the rules — per business line; every change is logged. Applies live to Review.</p>
        </div>
  );
}

const healthChecks: { label: string; value: string; status: "ok" | "watch"; note: string }[] = [
  { label: "Signal precision", value: "Baseline needed", status: "watch", note: "sanctioned sample + golden labels" },
  { label: "Front-line acceptance", value: "Not measured", status: "watch", note: "shadow feedback first" },
  { label: "Model drift", value: "Baseline needed", status: "watch", note: "market and segment slices" },
  { label: "Fairness / disparate impact", value: "Review required", status: "watch", note: "before activation" },
  { label: "Model risk (SR 11-7)", value: "Validation required", status: "watch", note: "BofA governance process" },
  { label: "Data handling", value: "Architecture review", status: "watch", note: "boundary and retention controls" },
];

function MonitorBody() {
  const watch = healthChecks.filter((c) => c.status === "watch").length;
  return (
        <div className="p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={watch ? { backgroundColor: `${AMBER}1a`, color: AMBER } : { backgroundColor: `${GREEN}14`, color: GREEN }}>
              {watch ? `${watch} pilot evidence gates open` : "Evidence gates complete"}
            </span>
            <span className="text-[11px] text-slate-400">no bank performance claimed</span>
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
      <span className="min-w-0">
        {tx.src && (
          <span className="mb-0.5 block w-fit rounded bg-slate-100 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {tx.src}
          </span>
        )}
        <span className="block truncate font-mono text-[11px] text-slate-500" title={tx.raw}>
          {tx.raw}
        </span>
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
  const alternatives =
    opp.destination === "merrill"
      ? ["Cold advisor outreach — no trusted introduction", "Generic campaign — loses timing and relationship context"]
      : ["Generic campaign — lower relevance", "Immediate offer — skips employee and policy context"];

  return (
    <SceneShell>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Ventus recommendation</Eyebrow>
          <Question>What should happen next?</Question>
          <p className="mt-4 text-2xl font-semibold leading-9 text-slate-900">{opp.action}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: `${NAVY}22`, color: NAVY, backgroundColor: `${NAVY}08` }}>
            <Target className="h-3.5 w-3.5" /> Moves: {pnlOf(opp.id)}
            <span className="text-slate-400">· skill {skillOf(opp.id)}</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}0d` }}>
            <Target className="h-5 w-5 flex-none" style={{ color: GREEN }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Outcome at stake</p>
              <p className="text-base font-semibold text-slate-900">{opp.outcome}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" style={{ color: NAVY }} />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Decision package</p>
            </div>
            <AiTag label="Ventus Skill · v0.1" title="Versioned recommendation logic, policy, delivery, and measurement" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Why this action</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{opp.reason} {opp.whyNow}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Why this owner + channel</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{opp.ownerReason} {opp.destinationWhy}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Prepared for the employee</p>
              <ul className="mt-2 space-y-1.5">
                {opp.talkingPoints.slice(0, 3).map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs leading-4 text-slate-600">
                    <Check className="mt-0.5 h-3 w-3 flex-none" style={{ color: GREEN }} /> {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Alternatives not selected</p>
              <ul className="mt-2 space-y-1.5">
                {alternatives.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-4 text-slate-500">
                    <X className="mt-0.5 h-3 w-3 flex-none text-slate-300" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-3.5 w-3.5" style={{ color: GREEN }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Outcome learning</p>
              <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${GREEN}14`, color: GREEN }}>
                {accepts} simulated acceptances
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">The pilot will capture acceptance, outreach, conversion, and holdout outcomes before any Skill advances.</p>
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

// Guardrails are evaluated per household, against the current (tunable) policy —
// each business runs its own regulatory regime on the same engine.
function evaluateGuardrails(opp: Opportunity, policy: Policy): Guard[] {
  if (oppLob(opp) === "consumer") {
    const guards: Guard[] = [{ label: "Relationship owner + UDAAP review", status: "pass", note: opp.owner }];
    guards.push({
      label: "Fair lending (ECOA) — uniform offer criteria",
      status: "pass",
      note: "offer logic screened for disparate impact",
    });
    if (policy.fhSuppression) {
      const vulnerable = opp.fvi === "elevated";
      guards.push({
        label: "Financial-health suppression (customer protection)",
        status: vulnerable ? "flag" : "pass",
        note: vulnerable ? "FVI elevated — suppress until reviewed" : "no protection flags",
      });
    }
    if (opp.destination === "lending") {
      guards.push({
        label: "Credit pre-screen consent before outreach",
        status: "flag",
        note: "soft-pull consent not yet on file",
      });
    }
    if (policy.campaignConsent && (opp.destination === "erica" || opp.destination === "campaign")) {
      guards.push({ label: "Digital marketing consent (opt-in)", status: "pass" });
    }
    guards.push({ label: "Complaint & sensitive-event check", status: "pass", note: "no open complaints" });
    return guards;
  }

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
  if (l.includes("consent")) return "Request consent";
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
          <Eyebrow>Policy + accountability</Eyebrow>
          <Question>Can this action proceed?</Question>
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
              {cleared ? "Cleared to act" : `Hold · ${flags.length} to clear`}
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
                  <p className="text-xs text-slate-500">
                    {oppLob(opp) === "consumer"
                      ? "UDAAP, fair lending, consent, and suppression passed automatically."
                      : "Reg BI, consent, suppression, and supervision passed automatically."}
                  </p>
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
            <ClipboardCheck className="h-4 w-4" />
            {opp.destination === "merrill"
              ? "Banker validates → Merrill advisor accepts the referral → Compliance monitors. Logged at each step."
              : oppLob(opp) === "consumer"
                ? "Banker validates → acts from the workbench → Compliance monitors. Logged at each step."
              : "Associate validates → Advisor acts in CEW → Risk monitors. Logged at each step."}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────────────── Scene 5 · Route ───────────────────────── */

type RouteAction = { label: string; verb: string; system: string; icon: typeof Sparkles; primary?: boolean };

// Action-first: label + system of record. One primary CTA per destination.
function routeActions(opp: Opportunity): RouteAction[] {
  switch (opp.destination) {
    case "banker":
      return [
        { label: "Book financial-center appointment", verb: "Book", system: "Appointment scheduler", icon: UserRoundCheck, primary: true },
        { label: "Add to banker call list", verb: "Add", system: "Banker workbench", icon: LayoutDashboard },
        { label: "Stage retention offer", verb: "Stage", system: "Preferred Rewards", icon: Coins },
      ];
    case "erica":
      return [
        { label: "Push Erica insight", verb: "Push", system: "Erica · mobile app", icon: Smartphone, primary: true },
        { label: "Create Life Plan goal", verb: "Create", system: "Life Plan", icon: Target },
      ];
    case "lending":
      return [
        { label: "Route to lending specialist", verb: "Route", system: "Home Lending queue", icon: Home, primary: true },
        { label: "Schedule pre-approval call", verb: "Schedule", system: "Appointment scheduler", icon: Video },
      ];
    case "merrill":
      return [
        { label: "Create Merrill referral", verb: "Refer", system: "CEW · Book 360", icon: GitBranch, primary: true },
        { label: "Draft banker warm intro", verb: "Draft", system: "Banker workbench", icon: MessageSquare },
      ];
    case "queue":
      return [
        { label: "Route to specialist queue", verb: "Route", system: "Private Bank · Salesforce", icon: Landmark, primary: true },
        { label: "Schedule intro", verb: "Schedule", system: "Zoom", icon: Video },
      ];
    case "rewards":
      return [
        { label: "Flag for deepening", verb: "Flag", system: "Preferred Rewards", icon: Coins, primary: true },
        { label: "Notify advisor", verb: "Notify", system: "CEW · Book 360", icon: LayoutDashboard },
      ];
    case "campaign":
      return [
        { label: "Enroll in nurture", verb: "Enroll", system: "Marketing Cloud", icon: Megaphone, primary: true },
        { label: "Set consent reminder", verb: "Set", system: "Salesforce", icon: ShieldCheck },
      ];
    default:
      return [
        { label: "Create task", verb: "Create", system: "CEW · Book 360", icon: LayoutDashboard, primary: true },
        { label: "Schedule meeting", verb: "Schedule", system: "Zoom", icon: Video },
        { label: "Pull collateral", verb: "Pull", system: "Seismic", icon: FileText },
      ];
  }
}

// The routed opportunity as the delivery API sees it.
function toDeliveryOpp(o: Opportunity) {
  return {
    id: o.id,
    type: o.type,
    client: o.client,
    value: o.value,
    valueLabel: o.valueLabel,
    confidence: o.confidence,
    action: o.action,
    reason: o.reason,
    owner: o.owner,
    destination: o.destination,
  };
}

// Best-effort live delivery through api/deliver (Salesforce-sandbox bridgeable);
// the locally built payload is always shown regardless.
async function invokeDeliver(opp: Opportunity): Promise<{ forwarded?: boolean } | null> {
  if (!budgetOk()) return null;
  try {
    const res = await fetch("/api/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
      body: JSON.stringify({ opportunity: toDeliveryOpp(opp) }),
    });
    if (res.ok) return (await res.json()) as { forwarded?: boolean };
  } catch {
    // stay staged — payload preview still renders locally
  }
  return null;
}

function RouteScene({
  opp,
  routed,
  onRoute,
  allowSandboxDelivery,
}: {
  opp: Opportunity;
  routed: boolean;
  onRoute: () => void;
  allowSandboxDelivery: boolean;
}) {
  const target = destinations.find((d) => d.id === opp.destination) ?? destinations[0];
  const TargetIcon = target.icon;
  const actions = routeActions(opp);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const [payload, setPayload] = useState<DeliveryPayload | null>(null);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [sandboxed, setSandboxed] = useState(false);
  useEffect(() => {
    setActionMsg(null);
    setDoneActions(new Set());
    setPayload(null);
    setPayloadOpen(false);
    setSandboxed(false);
  }, [opp.id]);

  const handle = (a: { label: string; system: string; primary?: boolean }) => {
    if (a.primary) {
      onRoute();
      setPayload(buildDeliveryPayload(toDeliveryOpp(opp)));
      if (allowSandboxDelivery) void invokeDeliver(opp).then((r) => setSandboxed(Boolean(r?.forwarded)));
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
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{a.label}</p>
                    <span className="flex-none rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{a.system}</span>
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
              <Repeat className="h-4 w-4" /> Staged for pilot measurement — no outcome claimed.
            </p>
          )}
          {actionMsg && (
            <p className="mt-2 flex items-center gap-2 text-xs font-medium" style={{ color: GREEN }}>
              <Check className="h-3.5 w-3.5" /> {actionMsg}
            </p>
          )}

          {/* Integration proof: the exact write that hits the bank's system of record */}
          {payload && (
            <div className="mt-3">
              <button
                onClick={() => setPayloadOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5" style={{ color: NAVY }} />
                {payloadOpen ? "Hide payload" : `View ${payload.system.split("·")[0].trim()} payload`}
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={sandboxed ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                  {sandboxed ? "delivered to sandbox" : "staged"}
                </span>
              </button>
              {payloadOpen && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-700/60 px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{payload.object}</span>
                    <span className="truncate font-mono text-[10px] text-slate-500">{payload.endpoint}</span>
                  </div>
                  <pre className="scrollbar-light max-h-40 overflow-auto p-3 font-mono text-[10px] leading-4 text-emerald-300">
                    {JSON.stringify(payload.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {destinations.filter((d) => !d.lob || d.lob === oppLob(opp)).map((d) => {
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
  if (opp.destination === "merrill") return <Book360Mock opp={opp} routed={routed} referral />;
  if (opp.destination === "erica") return <EricaMock opp={opp} routed={routed} />;
  if (opp.destination === "banker") return <BankerDeskMock opp={opp} routed={routed} />;
  return <RecipientCard opp={opp} routed={routed} />;
}

// Erica proactive insight, rendered as the client would see it — in their app.
function EricaMock({ opp, routed }: { opp: Opportunity; routed: boolean }) {
  return (
    <div className="mx-auto w-full max-w-xs overflow-hidden rounded-[28px] border-4 border-slate-800 bg-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded text-[10px] font-black">
            <span className="absolute inset-0" style={{ backgroundColor: "#fff" }} />
            <span className="absolute -right-0.5 top-0 h-6 w-[5px] rotate-[24deg]" style={{ backgroundColor: RED }} />
            <span className="relative" style={{ color: NAVY }}>B</span>
          </span>
          <span className="text-xs font-semibold">Erica</span>
        </div>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">Mobile app</span>
      </div>
      <div className="space-y-2 p-3" style={{ backgroundColor: "#f6f8fb" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Proactive insight</p>
          <AiTag label="via Ventus" title="Signal detected and prepared by Ventus; delivered through Erica." />
        </div>
        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white p-3">
          <p className="text-xs leading-5 text-slate-700">
            Nice one — your balance is growing. Want that money working for you? I can set up an automatic transfer toward a goal.
          </p>
          <p className="mt-1.5 text-[11px] font-semibold" style={{ color: BLUE }}>
            {opp.value} {opp.valueLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: BLUE }}>
            Set up auto-save
          </span>
          <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
            Add to Life Plan
          </span>
          <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
            Talk to a banker
          </span>
        </div>
        {routed ? (
          <p className="flex items-center gap-1 text-[11px] font-medium" style={{ color: GREEN }}>
            <Check className="h-3 w-3" /> Delivered to their app just now
          </p>
        ) : (
          <p className="text-[10px] text-slate-400">Held until consent + suppression checks clear.</p>
        )}
      </div>
    </div>
  );
}

// The banker's side of the same engine — a workbench with the conversation prepared.
function BankerDeskMock({ opp, routed }: { opp: Opportunity; routed: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <UserRoundCheck className="h-4 w-4" />
          <span className="text-xs font-semibold">Banker workbench</span>
        </div>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">Financial center · Midtown</span>
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Today · {opp.owner}</p>
          <AiTag label="via Ventus" title="Prioritized and prepared by Ventus; lands in the banker's day." />
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 opacity-60">
          <Clock className="h-3.5 w-3.5 flex-none text-slate-400" />
          <p className="truncate text-xs text-slate-500">10:30 · Notary appointment — walk-in</p>
        </div>
        <div className="rounded-xl border-2 p-3" style={{ borderColor: routed ? GREEN : `${BLUE}44` }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{opp.client}</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{opp.confidence}%</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{opp.reason}</p>
          <p className="mt-2 text-[11px] font-semibold" style={{ color: BLUE }}>
            {opp.value} · {opp.valueLabel} · offer math staged
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: BLUE }}>
              Book appointment
            </span>
            <span className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <MessageSquare className="h-3 w-3" /> Start outreach call
            </span>
          </div>
          {routed && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-medium" style={{ color: GREEN }}>
              <Check className="h-3 w-3" /> On {opp.owner.split(" ")[0]}'s calendar just now
            </p>
          )}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">Talking points + retention offer attached — no cold prep.</p>
      </div>
    </div>
  );
}

function Book360Mock({ opp, routed, referral = false }: { opp: Opportunity; routed: boolean; referral?: boolean }) {
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
            <Sparkles className="h-3 w-3" /> {referral ? "Consumer Banking referral · via Ventus" : "via Ventus"}
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
              <Check className="h-3 w-3" /> {referral ? "Referred to Book 360 just now — banker intro attached" : "Added to Book 360 just now"}
            </p>
          )}
        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          {referral
            ? "One Bank at work — the moment was sensed in consumer banking, completed here"
            : "1 new insight today · sits beside your reviews & birthdays"}
        </p>
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

// One-Bank executive KPIs computed from the live books — consumer + wealth together.
function bookMetrics() {
  const book = [...advisorBook, ...consumerBook];
  const pipeline = book.reduce((s, o) => s + valueNum(o.value), 0);
  const atRisk = book
    .filter((o) => (OPP_GOALS[o.id] ?? []).includes("retention"))
    .reduce((s, o) => s + valueNum(o.value), 0);
  const handoffs = book.filter((o) => o.destination === "merrill" || o.id === "transition").length;
  return [
    { value: fmtUsd(pipeline), label: "Illustrative value surfaced", sub: `${book.length} synthetic scenarios · consumer + wealth` },
    { value: fmtUsd(atRisk), label: "Illustrative value at risk", sub: "synthetic retention scenarios" },
    { value: "≥35%", label: "Pilot acceptance gate", sub: `${handoffs} illustrative Consumer → Merrill handoffs · not measured` },
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
  { id: "retain", label: "Max relationship value" },
  { id: "speed", label: "Fastest learning" },
  { id: "control", label: "Control first" },
];

function objectiveFromText(text: string): StrategicObjective {
  const normalized = text.toLowerCase();
  if (/(fast|quick|speed|pilot|test|launch|learn)/.test(normalized)) return "speed";
  if (/(risk|control|compliance|suitability|supervision|policy|safe)/.test(normalized)) return "control";
  return "retain";
}

const demandPlays: DemandPlay[] = [
  {
    icon: GitBranch,
    signal: "Liquidity, rollover, and asset-leakage moments surfacing in consumer relationships",
    qualitative: "Relationship and service context distinguishes a timely wealth need from a large balance alone.",
    guardrail: "Consent, eligibility, vulnerability, and relationship-owner checks apply.",
    households: "1,120 qualified moments · illustrative",
    product: "Consumer-to-Merrill transition skill",
    proof: "Consumer activity reveals the need before an external wealth platform sees the transfer.",
    execMove: "Pilot warm, named referrals",
    aiAction: "Combines liquidity, relationship depth, held products, and risk into one explainable handoff.",
    nextStep: "Founding pilot focus",
    owner: "Consumer + Merrill growth",
    scenarios: [
      { name: "Observe only", impact: "Baseline capture", tradeoff: "No employee learning" },
      { name: "Shadow referral", impact: "Acceptance benchmark", tradeoff: "No customer action" },
      { name: "Controlled warm handoff", impact: "Incremental NNA", tradeoff: "Capacity + policy gate" },
    ],
    recommendations: {
      retain: {
        path: "Qualified Consumer-to-Merrill handoff",
        impact: "Incremental NNA measured in pilot",
        rationale: "Identify a real wealth need while the assets are still on-bank, then give the relationship owner one evidence-backed, policy-cleared warm introduction.",
      },
      speed: {
        path: "Shadow signals + named referral pilot",
        impact: "Acceptance baseline in eight weeks",
        rationale: "Start in shadow mode, compare Ventus moments with current referrals, and activate only after advisors and policy owners validate precision.",
      },
      control: {
        path: "Consent- and suitability-gated referral",
        impact: "Qualified cohort only",
        rationale: "Suppress vulnerable, ineligible, or poorly evidenced cases before a task reaches a banker or Merrill advisor.",
      },
    },
  },
  {
    icon: Landmark,
    signal: "$96M/yr in checking outflows to neobanks & fintech debit",
    qualitative: "Branch notes: younger households quietly splitting their direct deposit.",
    guardrail: "UDAAP review and uniform offer criteria required.",
    households: "12,400 households",
    product: "Deposit-primacy defense strategy",
    proof: "Primacy predicts every other product the bank sells.",
    execMove: "Fund retention plays",
    aiAction: "Finds at-risk households before the second paycheck moves.",
    nextStep: "Recommended focus",
    owner: "Consumer Products",
    scenarios: [
      { name: "Watch only", impact: "$96M/yr leakage", tradeoff: "Compounding loss" },
      { name: "Targeted banker outreach", impact: "$38M defended", tradeoff: "Banker capacity" },
      { name: "Primacy bundle (rate + rewards boost)", impact: "$61M defended", tradeoff: "Margin giveback" },
    ],
    recommendations: {
      retain: {
        path: "Targeted banker outreach + primacy bundle",
        impact: "$61M defended",
        rationale: "Catch at-risk households weeks early. Banker + quantified Rewards bundle defends the deposits that anchor everything else.",
      },
      speed: {
        path: "Targeted banker outreach",
        impact: "$38M defended",
        rationale: "Bankers and the scheduler already exist. Ranked outreach starts this quarter — no product approval.",
      },
      control: {
        path: "Uniform-criteria retention rulebook",
        impact: "$38M controlled defense",
        rationale: "Uniform offer criteria first — the play scales without UDAAP or pricing-fairness risk.",
      },
    },
  },
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
        rationale: "Clients are moving; Citi is already tokenizing. Test your own access path before assets and mindshare leave.",
      },
      speed: {
        path: "Partner access pilot",
        impact: "$74M upside",
        rationale: "The category is forming now. A partner pilot learns demand and controls without an internal build.",
      },
      control: {
        path: "Eligibility rulebook + partner diligence",
        impact: "$74M controlled upside",
        rationale: "Access products carry eligibility and suitability risk — define the rulebook before exposing clients.",
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
        rationale: "Assets are leaving for unmanaged venues. A supervised sleeve keeps the relationship in-house.",
      },
      speed: {
        path: "Advisor referral",
        impact: "$51M upside",
        rationale: "Fastest move: route high-fit clients to trained advisors with approved language. No new product.",
      },
      control: {
        path: "Digital-asset education guardrails",
        impact: "Lower risk",
        rationale: "Demand is visible; suitability risk is high. Education keeps it warm without implying a recommendation.",
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
        rationale: "HNW yield demand is visible now. A controlled pilot tests capture before it leaves the franchise.",
      },
      speed: {
        path: "Specialist triage desk",
        impact: "$63M routed",
        rationale: "Use existing specialists now — the AI routes only high-fit cases with clear evidence.",
      },
      control: {
        path: "Supervised specialist review",
        impact: "$63M supervised",
        rationale: "Liquidity + concentration risk → supervised specialist review before any broader motion.",
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

function BookScene({
  mode,
  onLedger,
  allowInternalTools,
  allowSimulatedEvidence,
}: {
  mode: Mode;
  onLedger: (events: LedgerDraft[]) => void;
  allowInternalTools: boolean;
  allowSimulatedEvidence: boolean;
}) {
  const isOperator = mode === "operator";
  const bookOutcomes = bookMetrics();
  const [objective, setObjective] = useState<StrategicObjective>("retain");
  const [customObjective, setCustomObjective] = useState("");
  const [analyses, setAnalyses] = useState<Set<string>>(new Set());
  const [rankedRecommendations, setRankedRecommendations] = useState<Record<string, ObjectiveRecommendation>>({});
  const [rankingBusy, setRankingBusy] = useState<string | null>(null);
  const [skillOpen, setSkillOpen] = useState(false);
  const selectedObjective = strategicObjectives.find((item) => item.id === objective) ?? strategicObjectives[0];
  const isCustom = customObjective.trim().length > 0;
  const objectiveText = customObjective.trim() || selectedObjective.label;
  const localObjective = customObjective.trim() ? objectiveFromText(customObjective) : objective;
  const ask = customObjective.toLowerCase();
  const selectedProduct = /(deposit|checking|primacy|neobank|fintech|branch|debit|erica|card)/.test(ask)
    ? "Deposit-primacy defense strategy"
    : /(token|private market|pre-ipo)/.test(ask)
      ? "Private-market access strategy"
      : /(crypto|digital asset)/.test(ask)
        ? "Digital-asset coverage strategy"
        : /(private credit|yield)/.test(ask)
          ? "Private-credit coverage strategy"
          : "Consumer-to-Merrill transition skill";
  const selectedPlay = demandPlays.find((p) => p.product === selectedProduct) ?? demandPlays[0];
  const runAnalysis = useCallback(
    (play: DemandPlay) => {
      const key = `${play.product}:${objectiveText}`;
      setRankingBusy(key);
      const fallback = play.recommendations[localObjective];
      setRankedRecommendations((prev) => ({
        ...prev,
        [key]: { ...fallback, source: "Ventus Skill Planner · prototype" },
      }));
      setAnalyses((prev) => new Set(prev).add(key));
      setRankingBusy(null);
    },
    [localObjective, objectiveText],
  );

  return (
    <SceneShell fill>
      <div className="grid h-full max-h-full grid-cols-[280px_minmax(0,1fr)] items-stretch gap-4">
        <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <Eyebrow>{isOperator ? "Ventus Skill Studio" : "Enterprise growth portfolio"}</Eyebrow>
          <h1 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight" style={{ color: NAVY }}>
            {isOperator ? "Turn an objective into a deployable skill." : "Fund what creates incremental value."}
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {isOperator
              ? "A reusable decision package: signal, audience, intervention, policy, delivery, and measurement."
              : "Consumer + wealth strategies compared on economics, capacity, control, and measured lift."}
          </p>

          {isOperator ? (
            <div className="mt-3 grid flex-1 grid-cols-2 content-start gap-1.5">
              {[
                ["1", "Objective", "The outcome the institution wants"],
                ["2", "Financial state", "The evidence that makes it timely"],
                ["3", "Intervention", "One action, owner, and channel"],
                ["4", "Policy", "Eligibility, consent, and suppression"],
                ["5", "Learning", "Control group and incremental lift"],
              ].map(([n, label, copy]) => (
                <div key={n} className="flex gap-1.5 rounded-lg bg-slate-50 p-1.5">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                    {n}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800">{label}</p>
                    <p className="text-[9px] leading-3 text-slate-500">{copy}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-1.5 text-[9px] font-semibold" style={{ color: GREEN }}>
                <Repeat className="h-3.5 w-3.5" /> Versioned · auditable · reusable across markets
              </div>
            </div>
          ) : (
            <div className="mt-3 grid flex-1 grid-cols-2 content-start gap-2">
              {bookOutcomes.map((o) => (
                <div key={o.label} className={`rounded-lg bg-slate-50 p-2.5 ${o.label === "Front-line acceptance" ? "col-span-2" : ""}`}>
                  <p className="text-xl font-bold leading-tight" style={{ color: NAVY }}>{o.value}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-700">{o.label}</p>
                  <p className="mt-0.5 text-[9px] leading-3 text-slate-400">{o.sub}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" style={{ color: GREEN }} />
                <p className="text-sm font-semibold text-slate-900">
                  {isOperator ? "Describe the business outcome" : "Set the enterprise objective"}
                </p>
              </div>
              <input
                value={customObjective}
                onChange={(event) => setCustomObjective(event.target.value)}
                placeholder="e.g. grow wealth referrals without unsuitable outreach"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300"
              />
            </div>
            <button
              onClick={() => runAnalysis(selectedPlay)}
              disabled={rankingBusy === `${selectedPlay.product}:${objectiveText}`}
              className="self-end rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              {rankingBusy === `${selectedPlay.product}:${objectiveText}` ? "Designing" : isOperator ? "Design skill" : "Ask Ventus"}
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
              <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 flex-none" style={{ color: NAVY }} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Financial state</p>
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">Illustrative data</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{p.signal}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <BriefMetric label="Eligible population" value={p.households} />
                    <BriefMetric label="Skill family" value={p.product} />
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] font-medium leading-4 text-slate-500">
                    <Sparkles className="mt-0.5 h-3 w-3 flex-none" style={{ color: GREEN }} /> {p.aiAction}
                  </p>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-1 flex-col rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                        {isOperator ? "Deployable Ventus Skill" : "Recommended portfolio move"}
                      </p>
                      {recommendation.source ? (
                        <AiTag label={recommendation.source} title="Generated from the current objective using the prototype planner" />
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Design skill to customize →</span>
                      )}
                    </div>
                    <h2 className="mt-1.5 text-xl font-bold leading-tight text-slate-950">{recommendation.path}</h2>
                    <p className="mt-1.5 text-xs font-semibold" style={{ color: NAVY }}>{recommendation.impact} · illustrative</p>
                    <p className="mt-1.5 text-xs leading-4 text-slate-700">{recommendation.rationale}</p>

                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      <BriefMetric label="Activate" value={selectedProduct === "Consumer-to-Merrill transition skill" ? "Warm named referrals" : p.execMove} />
                      <BriefMetric label="Guardrail" value={selectedProduct === "Consumer-to-Merrill transition skill" ? "Consent · eligibility · vulnerability" : "Policy-gated cohort"} />
                      <BriefMetric label="Measure" value="Lift vs control" />
                    </div>

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

                    {isOperator && allowInternalTools && (
                      <button
                        onClick={() => setSkillOpen(true)}
                        className="mt-auto flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition"
                        style={{ backgroundColor: NAVY }}
                      >
                        <GitBranch className="h-3.5 w-3.5" /> View compiled skill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </div>
      {allowInternalTools && skillOpen && (
        <SkillArtifactPanel
          play={selectedPlay}
          recommendation={rankedRecommendations[`${selectedPlay.product}:${objectiveText}`] ?? selectedPlay.recommendations[localObjective]}
          objective={objectiveText}
          onLedger={onLedger}
          onClose={() => setSkillOpen(false)}
          allowSimulatedEvidence={allowSimulatedEvidence}
        />
      )}
    </SceneShell>
  );
}

/* The compiled Skill artifact — a real, versioned SkillArtifact from src/lib/skills.ts.
   It cannot validate without naming the P&L metric it moves and a holdout %. Promotion
   walks shadow → assisted → automated with git-like version history. This is the platform
   object: parameterize it and the same file runs at the next bank. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function seedSkillFor(play: DemandPlay, objective: string, recommendation: ObjectiveRecommendation): SkillArtifact {
  if (play.product === "Deposit-primacy defense strategy") return DEPOSIT_PRIMACY_SKILL;
  if (play.product === "Consumer-to-Merrill transition skill") return CONSUMER_MERRILL_SKILL;
  return compileObjectiveToSkill(objective, {
    trigger: play.signal,
    cohort: `${play.households} · eligibility-screened`,
    evidenceRequired: play.aiAction,
    intervention: recommendation.path,
    policyPack: play.guardrail.split(/[,.]/).map((s) => s.trim()).filter(Boolean).slice(0, 4),
  });
}

function SkillArtifactPanel({
  play,
  recommendation,
  objective,
  onLedger,
  onClose,
  allowSimulatedEvidence,
}: {
  play: DemandPlay;
  recommendation: ObjectiveRecommendation;
  objective: string;
  onLedger: (events: LedgerDraft[]) => void;
  onClose: () => void;
  allowSimulatedEvidence: boolean;
}) {
  const [skill, setSkill] = useState<SkillArtifact>(() => seedSkillFor(play, objective, recommendation));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const v = validateSkill(skill);
  const stageIdx = SKILL_STAGES.indexOf(skill.stage);
  const promotionOptions = { allowSimulatedEvidence };
  const promotable = canPromote(skill, promotionOptions);
  const blockers = promotionBlockers(skill, promotionOptions);
  const simulatedEvidenceAttached = skill.promotionEvidence?.source === "simulated";
  const promote = () => {
    const next = promoteSkill(skill, simulatedEvidenceAttached ? "Simulated evaluation promotion" : "Promoted from Studio", promotionOptions);
    setSkill(next);
    onLedger([{
      eventKey: `${next.slug}:${next.version}:promotion`,
      kind: "skill",
      title: `Skill promoted → ${cap(next.stage)}`,
      detail: `${next.slug} @${next.version} · moves ${next.pnlMetric}`,
      ref: next.slug,
      skill: next.slug,
      status: simulatedEvidenceAttached ? "simulated" : "confirmed",
    }]);
  };
  const attachSimulatedEvidence = () => {
    setSkill((current) => ({
      ...current,
      promotionEvidence: {
        source: "simulated",
        evaluationApproved: true,
        sampleSize: 1200,
        precision: 0.93,
        acceptanceRate: 0.39,
        incrementalLiftPct: 4.2,
        fairnessReviewed: true,
        policyApprovalId: "SIMULATED-EVAL-001",
        holdoutActive: true,
        outcomeWindowComplete: true,
      },
    }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch className="h-4 w-4 flex-none" />
            <span className="truncate font-mono text-sm font-semibold">{skill.slug}</span>
            <span className="flex-none rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">@{skill.version} · {cap(skill.stage)}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs leading-5 text-slate-500">
            A compiled Skill: one declarative, versioned decision package — reusable across markets, portable across banks.
          </p>

          {/* P&L metric + validity — the constraint that ties every Skill to a revenue driver */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-3" style={{ borderColor: `${NAVY}22`, backgroundColor: `${NAVY}05` }}>
            <Target className="h-4 w-4 flex-none" style={{ color: NAVY }} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Moves one P&amp;L metric</p>
              <p className="truncate text-sm font-semibold text-slate-900">{skill.pnlMetric}</p>
            </div>
            <span className="flex-none rounded-full px-2 py-0.5 text-[10px] font-bold" style={v.valid ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: `${RED}14`, color: RED }}>
              {v.valid ? `valid · ${skill.measurement.holdoutPct}% holdout` : "invalid"}
            </span>
          </div>
          {!v.valid && <p className="mt-1 text-[11px] font-medium" style={{ color: RED }}>{v.errors[0]}</p>}

          {allowSimulatedEvidence && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Evaluation-only evidence</p>
                <p className="mt-0.5 text-[11px] leading-4 text-amber-800">
                  {simulatedEvidenceAttached
                    ? "Simulated sample, precision, fairness, holdout, and lift are attached. They cannot unlock production promotion."
                    : "Attach a labeled evidence package to exercise the lifecycle without claiming bank results."}
                </p>
              </div>
              <button
                onClick={attachSimulatedEvidence}
                disabled={simulatedEvidenceAttached}
                className="flex-none rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
              >
                {simulatedEvidenceAttached ? "Evidence attached" : "Attach simulated evidence"}
              </button>
            </div>
          )}

          {/* promote pipeline */}
          <div className="mt-3 flex items-center gap-1.5">
            {SKILL_STAGES.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-1.5">
                <span
                  className="flex-1 rounded-md py-1 text-center text-[10px] font-bold uppercase tracking-wide transition"
                  style={i <= stageIdx ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                >
                  {s}
                </span>
                {i < SKILL_STAGES.length - 1 && <ArrowRight className="h-3 w-3 flex-none text-slate-300" />}
              </div>
            ))}
          </div>

          {/* the artifact, verbatim */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <pre className="scrollbar-light max-h-56 overflow-auto p-3 font-mono text-[11px] leading-5 text-emerald-300">{skillToSource(skill)}</pre>
          </div>

          {/* git-like version history */}
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Version history</p>
          <div className="mt-1.5 space-y-1">
            {[...skill.history].reverse().map((h) => (
              <div key={h.version + h.stage} className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono font-semibold text-slate-700">@{h.version}</span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: `${GREEN}0d`, color: GREEN }}>{h.stage}</span>
                <span className="truncate">{h.note}</span>
                <span className="ml-auto flex-none font-mono text-slate-400">{h.ts}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[11px] leading-4 text-slate-400">
              {skill.stage === "automated"
                ? simulatedEvidenceAttached
                  ? "Simulated lifecycle complete — no production status changed."
                  : "Fully automated within the approved policy and measurement design."
                : blockers[0] ?? `Eligible to promote to ${cap(nextStage(skill.stage))}.`}
            </p>
            <button
              onClick={promote}
              disabled={!promotable}
              className="flex flex-none items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-40"
              style={{ backgroundColor: NAVY }}
            >
              {skill.stage === "automated"
                ? <><Check className="h-3.5 w-3.5" /> {simulatedEvidenceAttached ? "Simulation complete" : "Live"}</>
                : promotable
                  ? <><Rocket className="h-3.5 w-3.5" /> Promote to {cap(nextStage(skill.stage))}</>
                  : <><LockKeyhole className="h-3.5 w-3.5" /> Awaiting approval</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-1.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-[11px] font-semibold leading-4 text-slate-800">{value}</p>
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

const BOFA_SURFACES = ["Erica", "Preferred Rewards", "CEW · Book 360", "Ask Merrill", "Salesforce FSC"];

const CAPABILITY_ICONS: Record<string, typeof Activity> = {
  "financial-state": Activity,
  decisioning: Wand2,
  activation: Network,
  measurement: Repeat,
};

const VENTUS_LOOP = leadershipCapabilities().map((capability) => ({
  icon: CAPABILITY_ICONS[capability.id] ?? Sparkles,
  label: capability.title,
  copy: capability.leadershipPromise,
}));

type LeadershipConfig = {
  businessLine: string;
  objective: string;
  coverCopy: string;
  opp: Opportunity;
  playTitle: string;
  skill: SkillArtifact;
  pilotOwner: string;
  sourceLabel: string;
  sourceDetail: string;
  workflowLabel: string;
  workflowDetail: string;
  standaloneProof: string;
  expansionUpside: string;
  actEarlier: string; // division of value: the institution owns the signals; Ventus turns them into action
};

function leadershipConfig(path: LeadershipPath): LeadershipConfig {
  if (path === "deposit-retention") {
    return {
      businessLine: "Consumer Banking",
      objective: "Protect primary deposits",
      coverCopy: "Use Consumer-owned signals to detect relationship erosion and prepare one timely banker action.",
      opp: consumerBook.find((item) => item.id === "primacy") ?? consumerBook[0],
      playTitle: "Deposit Primacy Defense",
      skill: DEPOSIT_PRIMACY_SKILL,
      pilotOwner: "Consumer Bank P&L owner",
      sourceLabel: "Consumer data",
      sourceDetail: "Epsilon · deposits · card · P2P",
      workflowLabel: "Banker workflow",
      workflowDetail: "Workbench · email · Salesforce",
      standaloneProof: "No Merrill data required",
      expansionUpside: "Later, authorized wealth signals can improve qualification without changing Consumer ownership.",
      actEarlier: "Consumer Banking owns the payroll, card, and P2P evidence. Ventus turns it into one governed retention action before the second paycheck leaves.",
    };
  }
  return {
    businessLine: "Merrill",
    objective: "Grow qualified wealth relationships",
    coverCopy: "Use Merrill-owned signals to convert active demand into qualified NNA and advised relationships.",
    opp: advisorBook.find((item) => item.id === "merrill-growth") ?? advisorBook[0],
    playTitle: "Merrill Relationship Growth",
    skill: MERRILL_RELATIONSHIP_GROWTH_SKILL,
    pilotOwner: "Merrill growth P&L owner",
    sourceLabel: "Merrill data",
    sourceDetail: "Books · transfers · digital engagement",
    workflowLabel: "Advisor workflow",
    workflowDetail: "CEW · Book 360 · Salesforce FSC",
    standaloneProof: "No Consumer data required",
    expansionUpside: "Later, authorized Consumer signals can reveal earlier demand and quantify incremental connected lift.",
    actEarlier: "Merrill owns the relationship, transfer, and engagement evidence. Ventus turns it into one governed advisor action before intent goes cold.",
  };
}

// Story-shaped, not builder-shaped: open on what a person sees, then reveal what drove
// it, then let the exec set boundaries — comprehension before configuration.
const EXECUTIVE_STEPS = ["Run", "Use", "Integrate", "Activate", "Measure"] as const;

// Progressive employee-surface preview with a before/after contrast: the same queue
// without Ventus (a static, context-free list) vs. with Ventus (one prepared, evidenced
// item). Compact by default; full workstation on demand so the mock never steals the scene.
function EmployeeSurfacePreview({ opp, onVentusModeChange }: { opp: Opportunity; onVentusModeChange?: (withVentus: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [withVentus, setWithVentus] = useState(true);
  const dest = destinations.find((d) => d.id === opp.destination) ?? destinations[0];
  const DestIcon = dest.icon;
  const primary = routeActions(opp).find((a) => a.primary);
  const coldRows = [
    { name: "Household #4417", note: "Last contact 214 days · no context" },
    { name: "Household #2093", note: "From monthly attrition report · no context" },
    { name: "Household #7781", note: "Alphabetical call list · no context" },
  ];
  return (
    <div>
      <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-1">
        {([
          ["without", "Without Ventus"],
          ["with", "With Ventus"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              const next = key === "with";
              setWithVentus(next);
              onVentusModeChange?.(next);
            }}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${withVentus === (key === "with") ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!withVentus ? (
        /* The Monday they have today: a static list, no evidence, no preparation. */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 text-white" style={{ backgroundColor: "#475569" }}>
            <div className="flex items-center gap-2">
              <DestIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">{dest.label}</span>
            </div>
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">47 names</span>
          </div>
          <div className="divide-y divide-slate-100">
            {coldRows.map((row) => (
              <div key={row.name} className="flex items-center gap-3 px-3 py-2.5 opacity-70">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-600">{row.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{row.note}</p>
                </div>
                <span className="flex-none rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-400">Call</span>
              </div>
            ))}
          </div>
          <p className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">Static list · refreshed monthly · no evidence attached</p>
        </div>
      ) : expanded ? (
        <DestinationPreview opp={opp} routed={false} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 text-white" style={{ backgroundColor: NAVY }}>
            <div className="flex items-center gap-2">
              <DestIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">{dest.label}</span>
            </div>
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">{dest.short}</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{opp.client}</p>
                <ConfidencePill value={opp.confidence} />
                <AiTag label="via Ventus" title="Detected, governed, and prepared by Ventus — delivered into this surface." />
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {opp.value} · {opp.valueLabel} · prepared and staged
              </p>
            </div>
            {primary && (
              <span className="flex-none rounded-md px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: NAVY }}>
                {primary.verb}
              </span>
            )}
          </div>
        </div>
      )}
      {withVentus && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ChevronDown className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show compact view" : "View full employee experience"}
        </button>
      )}
    </div>
  );
}

function CustomerExperiencePreview({ path }: { path: LeadershipPath }) {
  const wealth = path === "wealth-growth";
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[28px] border-4 border-slate-800 bg-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] font-black" style={{ color: NAVY }}>B</span>
          <span className="text-xs font-semibold">Your bank</span>
        </div>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">Mobile banking</span>
      </div>
      <div className="bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Personalized support</p>
        <div className="mt-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white p-4">
          <p className="text-base font-semibold text-slate-900">
            {wealth ? "A planning review is ready" : "A relationship review is ready"}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {wealth
              ? "An advisor can review the transfer you started and align it with your longer-term plan."
              : "A banker can review your everyday banking setup and make sure it still fits how you use your accounts."}
          </p>
          <button className="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: BLUE }}>
            {wealth ? "Schedule a planning review" : "Talk with my banker"}
          </button>
          <button className="mt-1.5 w-full py-1.5 text-xs font-semibold text-slate-400">Not now</button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">Bank-approved content · consent and suppression checked</p>
      </div>
    </div>
  );
}

function BoundaryToggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={checked} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <span className="relative h-5 w-9 flex-none rounded-full transition" style={{ backgroundColor: checked ? GREEN : "#cbd5e1" }}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function PendingMetric({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Pending</span>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
    </div>
  );
}

// When set (e.g. http://localhost:8787/work-items from scripts/mock-cew-sandbox.mjs),
// the Prove step's rehearsal performs REAL network writes and shows the receiver's
// receipts. Unset = simulated, and the demo never sends a payload anywhere.
const REHEARSAL_URL = ((import.meta.env.VITE_REHEARSAL_URL as string | undefined) ?? "").trim();

type LeadershipRunEvidence = {
  sourceMode: "live" | "demo";
  sourceName: string;
  scenario: LeadershipPath;
  transactions: PlaidTransaction[];
  opportunity: DetectedOpportunity | null;
  authorizationMode?: string;
};

function LeadershipPipelineRun({
  path,
  opp,
  destination,
  activeControls,
  playTitle,
  businessLine,
  standaloneProof,
  valueLine,
  onViewPlay,
  onEvidence,
  onComplete,
}: {
  path: LeadershipPath;
  opp: Opportunity;
  destination: string;
  activeControls: string[];
  playTitle: string;
  businessLine: string;
  standaloneProof: string;
  valueLine: string;
  onViewPlay: () => void;
  onEvidence: (evidence: LeadershipRunEvidence) => void;
  onComplete: () => void;
}) {
  const [runStage, setRunStage] = useState(0);
  const [sourceStatus, setSourceStatus] = useState<"idle" | "connecting" | "live" | "demo">("idle");
  const [runEvidence, setRunEvidence] = useState<LeadershipRunEvidence | null>(null);
  const derived = runPipeline(OPP_INPUT(opp));
  const rails = [...new Set(opp.rawTransactions.map((transaction) => transaction.src ?? "Bank feed"))];
  const detected = runEvidence?.opportunity;
  const recordCount = runEvidence?.transactions.length || derived.provenance.ingested;
  const stages = [
    { label: "Map", detail: `${recordCount} source records`, icon: Upload },
    { label: "Enrich", detail: `${detected?.enriched.length ?? derived.provenance.classified} normalized`, icon: Cpu },
    { label: "Infer", detail: detected?.type ?? opp.type, icon: Activity },
    { label: "Decide", detail: detected?.action ?? opp.action, icon: Wand2 },
    { label: "Govern", detail: `${activeControls.length} policy checks`, icon: ShieldCheck },
  ];

  useEffect(() => {
    if (runStage < 1 || runStage >= stages.length) return;
    const timer = window.setTimeout(() => setRunStage((current) => current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [runStage, stages.length]);

  const runComplete = runStage === stages.length;

  useEffect(() => {
    if (runComplete) onComplete();
  }, [onComplete, runComplete]);

  const runConnectedSample = async () => {
    if (sourceStatus === "connecting" || (runStage > 0 && !runComplete)) return;
    setRunStage(0);
    setSourceStatus("connecting");
    let evidence: LeadershipRunEvidence = {
      sourceMode: "demo",
      sourceName: `${businessLine} demo data`,
      scenario: path,
      transactions: [],
      opportunity: null,
    };
    try {
      const response = await fetch("/api/plaid-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
        body: JSON.stringify({ scenario: path }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ready?: boolean;
        env?: string;
        transactions?: PlaidTransaction[];
        authorization?: { mode?: string };
      };
      const opportunity = data.transactions?.length ? buildOpportunityFromPlaid(data.transactions) : null;
      if (response.ok && data.ready && data.transactions?.length && opportunity) {
        evidence = {
          sourceMode: "live",
          sourceName: `Plaid ${data.env ?? "sandbox"}`,
          scenario: path,
          transactions: data.transactions,
          opportunity,
          authorizationMode: data.authorization?.mode,
        };
      }
    } catch {
      // The product remains usable in presentation mode; the badge stays explicit.
    }
    setRunEvidence(evidence);
    setSourceStatus(evidence.sourceMode);
    onEvidence(evidence);
    setRunStage(1);
  };

  const resultType = detected?.type ?? opp.type;
  const resultReason = detected?.reason ?? opp.reason;
  const resultAction = detected?.action ?? opp.action;
  const resultDestination = detected?.destination ?? destination;
  const resultConfidence = detected?.confidence ?? derived.confidence;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Connected product run</Eyebrow>
            {sourceStatus === "live" && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Plaid sandbox · live</span>}
            {sourceStatus === "demo" && <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Presentation data</span>}
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>Transactions in. One governed action out.</h1>
          <p className="mt-1.5 text-xs font-semibold text-slate-500">{businessLine} · {standaloneProof}</p>
        </div>
        <button
          onClick={runConnectedSample}
          disabled={sourceStatus === "connecting" || (runStage > 0 && !runComplete)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          style={{ backgroundColor: NAVY }}
        >
          {sourceStatus === "connecting" ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting</> : runComplete ? <><RotateCcw className="h-4 w-4" /> Run again</> : runStage > 0 ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing</> : <><Rocket className="h-4 w-4" /> Run connected sample</>}
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <section className="order-1 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Source records</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">{runEvidence?.sourceName ?? `${rails.length} ${businessLine} rails`}</span>
          </div>
          <div className="mt-3 space-y-2">
            {runEvidence?.transactions.length ? runEvidence.transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.transaction_id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[10px] font-semibold text-slate-700">{transaction.name}</span>
                  <span className={`flex-none text-[10px] font-bold ${transaction.amount < 0 ? "text-emerald-700" : "text-slate-600"}`}>{transaction.amount < 0 ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString()}</span>
                </div>
                <p className={`mt-1 flex items-center justify-between gap-2 text-[9px] text-slate-400 transition ${runStage >= 2 ? "opacity-100" : "opacity-0"}`}>
                  <span className="truncate">{transaction.personal_finance_category?.primary ?? "UNCATEGORIZED"}</span>
                  <span className="flex-none font-mono">{transaction.transaction_id.slice(0, 10)}…</span>
                </p>
              </div>
            )) : opp.rawTransactions.slice(0, 3).map((transaction) => (
              <div key={transaction.raw} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[10px] font-semibold text-slate-700">{transaction.raw}</span>
                  <span className="flex-none text-[9px] font-bold uppercase text-slate-400">{transaction.src}</span>
                </div>
                <p className={`mt-1 truncate text-[10px] text-slate-500 transition ${runStage >= 2 ? "opacity-100" : "opacity-0"}`}>{transaction.merchant} · {transaction.category}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="order-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Ventus pipeline</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {stages.map((stage, index) => {
              const number = index + 1;
              const complete = runStage >= number;
              const active = runStage === number && !runComplete;
              const StageIcon = stage.icon;
              return (
                <div key={stage.label} className={`rounded-lg border px-2.5 py-2 transition ${complete ? "border-emerald-200 bg-white" : "border-slate-200 bg-white/50"}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md" style={{ backgroundColor: complete ? `${GREEN}12` : "#f1f5f9" }}>
                      {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: GREEN }} /> : complete ? <Check className="h-3.5 w-3.5" style={{ color: GREEN }} /> : <StageIcon className="h-3.5 w-3.5 text-slate-400" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800">{stage.label}</p>
                      <p className="truncate text-[9px] text-slate-400">{stage.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="order-2 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Produced result</p>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${runComplete ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{runComplete ? "Ready" : "Awaiting run"}</span>
          </div>
          {!runComplete ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <Layers className="h-8 w-8 text-slate-200" />
              <p className="mt-2 text-sm font-semibold text-slate-400">Run sample</p>
            </div>
          ) : (
            <div className="mt-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Qualified moment</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">{resultType}</h2>
                  </div>
                  <ConfidencePill value={resultConfidence} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{resultReason}</p>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Prepared action</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{resultAction}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{valueLine}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>{resultDestination}</span>
                  <span className="font-semibold" style={{ color: GREEN }}>Policy clear</span>
                </div>
              </div>
              {/* The reusable capability behind this result, one click away in business language */}
              <button
                onClick={onViewPlay}
                className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 flex-none" style={{ color: NAVY }} />
                  <span className="truncate text-xs font-semibold text-slate-700">
                    Produced by <span style={{ color: NAVY }}>{playTitle}</span> — a reusable Growth Play
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 flex-none text-slate-400" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function LeadershipFlow({ path, onExit }: { path: LeadershipPath; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [connectedTestOpen, setConnectedTestOpen] = useState(false);
  const market = "Charlotte";
  const capacity = 50;
  const [experienceTab, setExperienceTab] = useState<"employee" | "customer">("employee");
  const [employeeWithVentus, setEmployeeWithVentus] = useState(true);
  const [pipelineReady, setPipelineReady] = useState(false);
  const [runEvidence, setRunEvidence] = useState<LeadershipRunEvidence | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [integrationReady, setIntegrationReady] = useState(false);
  const [dryRunState, setDryRunState] = useState<"idle" | "running" | "complete">("idle");
  const [shadowReady, setShadowReady] = useState(false);
  const [measurementPreview, setMeasurementPreview] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const [liveReceipts, setLiveReceipts] = useState<{ id: string; receipt: string; url?: string; route: "salesforce" | "rehearsal" }[]>([]);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const config = leadershipConfig(path);
  const { opp, skill } = config;
  const destination = destinationLabel(opp.destination);

  useEffect(() => {
    setStep(0);
    setScopeOpen(false);
    setConnectedTestOpen(false);
    setExperienceTab("employee");
    setEmployeeWithVentus(true);
    setPipelineReady(false);
    setRunEvidence(null);
    setEvidenceOpen(false);
    setIntegrationReady(false);
    setDryRunState("idle");
    setShadowReady(false);
    setMeasurementPreview(false);
    setPlayOpen(false);
    setLiveReceipts([]);
    setDeliveryNote(null);
  }, [path]);

  useEffect(() => {
    if (step === 2 && pipelineReady) setIntegrationReady(true);
  }, [pipelineReady, step]);

  const handlePipelineComplete = useCallback(() => setPipelineReady(true), []);

  // Prefer the real Salesforce connector. The generic rehearsal receiver remains a
  // secondary integration surface for bank workbench sandboxes.
  const runRehearsal = async () => {
    if (dryRunState === "running") return;
    setLiveReceipts([]);
    setDeliveryNote(null);
    setDryRunState("running");
    const detected = runEvidence?.opportunity;
    try {
      const response = await fetch("/api/salesforce-deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
        body: JSON.stringify({
          subject: `${config.playTitle} — ${detected?.type ?? opp.type}`,
          description: `${detected?.reason ?? opp.reason}\nRecommended action: ${detected?.action ?? opp.action}\nSource: ${runEvidence?.sourceName ?? "presentation data"}`,
          source: runEvidence?.sourceMode === "live" ? "leadership-demo-plaid" : "leadership-demo",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { id?: string; url?: string; error?: string };
      if (response.ok && data.id) {
        setLiveReceipts([{ id: opp.id, receipt: data.id, url: data.url, route: "salesforce" }]);
        setDeliveryNote("Salesforce Task created");
        setDryRunState("complete");
        setShadowReady(true);
        return;
      }
      if (REHEARSAL_URL) {
        const rehearsal = await fetch(REHEARSAL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
          body: JSON.stringify({ rehearsal: true, caseId: opp.id, ...buildDeliveryPayload(toDeliveryOpp(opp)) }),
        });
        const rehearsalData = rehearsal.ok ? ((await rehearsal.json()) as { receiptId?: string }) : {};
        if (rehearsalData.receiptId) {
          setLiveReceipts([{ id: opp.id, receipt: rehearsalData.receiptId, route: "rehearsal" }]);
          setDeliveryNote("Bank sandbox receipt returned");
        }
      } else {
        setDeliveryNote(data.error ? "Salesforce connector unavailable — showing the staged payload" : "Staged payload only");
      }
    } catch {
      setDeliveryNote("Connected destination unavailable — showing the staged payload");
    }
    setDryRunState("complete");
    setShadowReady(true);
  };

  const nextLabels = ["See employee view", "Map workflow", "Create sandbox Task", "Measure outcomes"];
  const activeControls = path === "wealth-growth"
    ? ["Reg BI review", "Consent + eligibility", "Vulnerability suppression"]
    : ["UDAAP review", "Uniform offer criteria", "Financial-health suppression"];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50/70">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-full w-full max-w-5xl items-start xl:items-center">
          <SceneFade sceneKey={step}>
            {step === 0 && (
              <LeadershipPipelineRun
                key={path}
                path={path}
                opp={opp}
                destination={destination}
                activeControls={activeControls}
                playTitle={config.playTitle}
                businessLine={config.businessLine}
                standaloneProof={config.standaloneProof}
                valueLine={config.actEarlier}
                onViewPlay={() => setPlayOpen(true)}
                onEvidence={setRunEvidence}
                onComplete={handlePipelineComplete}
              />
            )}

            {step === 2 && (
              <div className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Eyebrow>{config.playTitle}</Eyebrow>
                  <button
                    onClick={() => setPlayOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <GitBranch className="h-3 w-3" style={{ color: NAVY }} /> View the Growth Play
                  </button>
                </div>
                <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>Wire this decision into {config.businessLine}.</h1>
                <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
                    {[
                      { title: config.sourceLabel, detail: config.sourceDetail, Icon: Layers },
                      { title: "Ventus", detail: "Map · enrich · decide", Icon: Cpu },
                      { title: "Ranked IDs", detail: "Action + rationale", Icon: Target },
                      { title: config.workflowLabel, detail: config.workflowDetail, Icon: Network },
                    ].map((node, index) => (
                      <div key={node.title} className="contents">
                        {index > 0 && <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />}
                        <div className={`rounded-lg border p-3 ${node.title === "Ventus" ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-slate-50"}`}>
                          <node.Icon className="h-4 w-4" style={{ color: node.title === "Ventus" ? NAVY : GREEN }} />
                          <p className="mt-1 text-xs font-bold text-slate-900">{node.title}</p>
                          <p className="text-[10px] leading-4 text-slate-500">{node.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[
                      runEvidence?.sourceMode === "live" ? `${runEvidence.sourceName} receipt verified` : `${config.sourceLabel} contract mapped`,
                      `${config.playTitle} matched`,
                      `${config.workflowLabel} payload ready`,
                    ].map((receipt) => <div key={receipt} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[10px] font-semibold text-emerald-800"><Check className="h-3.5 w-3.5 flex-none" />{receipt}</div>)}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />Route ready for a sandbox write</div>
                    <span className="text-[10px] font-semibold text-slate-400">No customer action</span>
                  </div>
                </section>
              </div>
            )}

            {step === 1 && (
              <div className="w-full">
                <Eyebrow>{config.objective}</Eyebrow>
                <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>What {opp.owner.split(" ")[0]} sees Monday morning.</h1>
                <div className="mt-4 inline-flex rounded-lg bg-slate-100 p-1">
                  {(["employee", "customer"] as const).map((tab) => <button key={tab} onClick={() => setExperienceTab(tab)} className={`rounded-md px-4 py-1.5 text-xs font-semibold capitalize ${experienceTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{tab}</button>)}
                </div>
                <div className={`mt-3 grid gap-4 ${experienceTab === "employee" ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]" : ""}`}>
                  <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${experienceTab === "customer" ? "mx-auto w-full max-w-xl" : ""}`}>
                    {experienceTab === "employee" ? <EmployeeSurfacePreview key={path} opp={opp} onVentusModeChange={setEmployeeWithVentus} /> : <CustomerExperiencePreview path={path} />}
                  </section>
                  {experienceTab === "employee" && (
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                      {employeeWithVentus ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Priority opportunity</p>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${runEvidence?.sourceMode === "live" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{runEvidence?.sourceMode === "live" ? "Plaid live" : "Demo data"}</span>
                          </div>
                          <p className="mt-2 text-lg font-semibold leading-6 text-slate-950">{runEvidence?.opportunity?.type ?? opp.type}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{runEvidence?.opportunity?.confidence ?? opp.confidence}% confidence</p>
                          <div className="mt-3 rounded-lg bg-blue-50/70 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Next action</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{runEvidence?.opportunity?.action ?? opp.action}</p></div>
                          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600"><span>{runEvidence?.opportunity?.destination ?? destination}</span><span style={{ color: GREEN }}>Ready</span></div>
                          <button onClick={() => setEvidenceOpen((open) => !open)} className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"><ChevronDown className={`h-3 w-3 transition ${evidenceOpen ? "rotate-180" : ""}`} /> {evidenceOpen ? "Hide evidence" : "View evidence"}</button>
                          {evidenceOpen && <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">{runEvidence?.opportunity?.enriched.length ? runEvidence.opportunity.enriched.slice(0, 4).map((transaction) => <div key={`${transaction.raw}-${transaction.date}`} className="flex items-center gap-2 text-[10px] text-slate-600"><span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: GREEN }} /><span className="truncate">{transaction.tag}</span><span className="ml-auto flex-none text-slate-400">{Math.round(transaction.conf * 100)}%</span></div>) : opp.rawTransactions.map((transaction) => <div key={transaction.raw} className="flex items-center gap-2 text-[10px] text-slate-600"><span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: GREEN }} /><span>{transaction.tag}</span><span className="ml-auto text-slate-400">{Math.round(transaction.conf * 100)}%</span></div>)}</div>}
                        </>
                      ) : (
                        <div className="flex min-h-48 flex-col items-center justify-center text-center"><p className="text-3xl font-semibold text-slate-300">47</p><p className="mt-1 text-xs font-semibold text-slate-500">unranked names</p><p className="mt-3 text-[11px] text-slate-400">No decision-ready evidence · no prepared action</p></div>
                      )}
                    </section>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="w-full">
                <Eyebrow>Workflow activation</Eyebrow>
                <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>Send the prepared action to Salesforce.</h1>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                      {[
                        { label: runEvidence?.sourceName ?? config.sourceLabel, detail: `${runEvidence?.transactions.length || 3} records`, Icon: Layers },
                        { label: config.playTitle, detail: runEvidence?.opportunity?.type ?? opp.type, Icon: Wand2 },
                        { label: "Salesforce FSC", detail: "Task · sandbox", Icon: Network },
                      ].map((node, index) => (
                        <div key={node.label} className="contents">
                          {index > 0 && <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />}
                          <div className={`min-w-0 rounded-lg border p-3 ${index === 1 ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-slate-50"}`}>
                            <node.Icon className="h-4 w-4" style={{ color: index === 1 ? NAVY : GREEN }} />
                            <p className="mt-1 truncate text-xs font-bold text-slate-900">{node.label}</p>
                            <p className="truncate text-[10px] text-slate-500">{node.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {liveReceipts[0] ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <div className="flex items-center gap-3">
                          <img src={salesforceLogo} alt="Salesforce" className="h-8 w-8 rounded-md bg-white object-contain p-1" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Delivered</p>
                            <p className="truncate font-mono text-sm font-semibold text-slate-900">Task {liveReceipts[0].receipt}</p>
                          </div>
                          {liveReceipts[0].url && <a href={liveReceipts[0].url} target="_blank" rel="noopener noreferrer" className="flex-none rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm">Open record</a>}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-800">{deliveryNote ?? "One sandbox write. No customer message."}</p>
                        <p className="mt-1 truncate text-[10px] text-slate-400">{runEvidence?.opportunity?.action ?? opp.action}</p>
                      </div>
                    )}

                    <button onClick={runRehearsal} disabled={dryRunState === "running" || liveReceipts.length > 0} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" style={{ backgroundColor: liveReceipts.length > 0 ? GREEN : NAVY }}>
                      {dryRunState === "running" ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing to Salesforce</> : liveReceipts.length > 0 ? <><Check className="h-4 w-4" /> Receipt returned</> : <><Rocket className="h-4 w-4" /> Create sandbox Task</>}
                    </button>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">This run</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { label: "Source", value: `${runEvidence?.sourceName ?? "Presentation data"} · ${runEvidence?.transactions.length || 3} records`, live: runEvidence?.sourceMode === "live" },
                        { label: "Decision", value: `${config.playTitle} · ${runEvidence?.opportunity?.confidence ?? opp.confidence}%`, live: true },
                        { label: "Activation", value: liveReceipts[0] ? `Salesforce Task ${liveReceipts[0].receipt}` : deliveryNote ?? "Awaiting write", live: liveReceipts.length > 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                          <span className={`h-2 w-2 flex-none rounded-full ${item.live ? "bg-emerald-500" : "bg-slate-300"}`} />
                          <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p><p className="truncate text-xs font-semibold text-slate-800" title={item.value}>{item.value}</p></div>
                        </div>
                      ))}
                    </div>
                    <details className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <summary className="cursor-pointer text-[11px] font-semibold text-slate-600">Technical receipt</summary>
                      <div className="mt-2 space-y-1 font-mono text-[9px] leading-4 text-slate-500">
                        <p>source_mode={runEvidence?.sourceMode ?? "demo"}</p>
                        <p>auth={runEvidence?.authorizationMode ?? "presentation"}</p>
                        <p>destination={liveReceipts[0]?.route ?? "salesforce_fsc_task"}</p>
                      </div>
                    </details>
                  </section>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Eyebrow>Outcome measurement</Eyebrow>
                    <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>Know what Ventus changed.</h1>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-800">
                    {measurementPreview ? "Illustrative outcome file" : "No pilot outcome claimed"}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Measured operating loop</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { label: "Assign before action", detail: `${100 - skill.measurement.holdoutPct}% treatment · ${skill.measurement.holdoutPct}% holdout`, Icon: GitBranch },
                        { label: "Receive bank outcomes", detail: path === "wealth-growth" ? "Qualified NNA posted" : "Deposit balance observed", Icon: Network },
                        { label: "Calculate incremental value", detail: "Coverage gate + 95% interval vs holdout", Icon: LineChart },
                      ].map((item, index) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white"><item.Icon className="h-3.5 w-3.5" style={{ color: index === 2 ? GREEN : NAVY }} /></span>
                          <div><p className="text-xs font-semibold text-slate-800">{item.label}</p><p className="text-[10px] text-slate-400">{item.detail}</p></div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] leading-4 text-slate-400">Assignment is immutable and tokenized. Outcomes arriving before assignment or with a changed arm are rejected.</p>
                    <button
                      onClick={() => setConnectedTestOpen(true)}
                      className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100"
                    >
                      <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                        <GitBranch className="h-3.5 w-3.5" style={{ color: NAVY }} /> After standalone proof: test connected lift
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 flex-none text-slate-400" />
                    </button>
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    {!measurementPreview ? (
                      <div className="flex min-h-56 flex-col items-center justify-center text-center">
                        <Repeat className="h-8 w-8 text-slate-200" />
                        <p className="mt-2 text-sm font-semibold text-slate-700">Awaiting a completed outcome window</p>
                        <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">The product remains honest until the bank returns treatment and holdout outcomes.</p>
                        <button onClick={() => setMeasurementPreview(true)} className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: NAVY }}>
                          <FileText className="h-3.5 w-3.5" /> Load illustrative outcome file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Sample-gated result</p><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">450 treatment · 50 holdout</span></div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <BriefMetric label="Treatment" value={path === "wealth-growth" ? "$32.4K" : "$18.4K"} />
                          <BriefMetric label="Holdout" value={path === "wealth-growth" ? "$21.1K" : "$15.2K"} />
                          <BriefMetric label="Incremental" value={path === "wealth-growth" ? "+$11.3K" : "+$3.2K"} />
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400">100% outcome coverage · illustrative 95% interval {path === "wealth-growth" ? "+$4.1K to +$18.5K" : "+$0.8K to +$5.6K"}</p>
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">What the institution can decide</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{path === "wealth-growth" ? "Scale the qualified Merrill handoff only after bank validation." : "Scale primacy defense only after bank validation."}</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">Replace this illustrative file with the bank outcome feed; independent review determines whether lift is sufficient.</p>
                        </div>
                        <button onClick={() => setMeasurementPreview(false)} className="mt-3 text-[11px] font-semibold text-slate-500 hover:text-slate-800">Clear illustrative data</button>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </SceneFade>
        </div>
      </div>

      <footer className="flex flex-none items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:px-8 lg:px-10">
        <button onClick={onExit} className="text-xs font-semibold text-slate-500 transition hover:text-slate-800">
          Change objective
        </button>
        <div className="flex items-center gap-2">
          {EXECUTIVE_STEPS.map((label, index) => (
            <button
              key={label}
              onClick={() => setStep(index)}
              disabled={(index > 0 && !pipelineReady) || (index === 3 && !integrationReady) || (index === 4 && !shadowReady)}
              className="flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: index <= step ? (index === step ? NAVY : GREEN) : "#cbd5e1" }}>
                {index < step ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className={`hidden text-[11px] font-semibold lg:inline ${index === step ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
            </button>
          ))}
        </div>
        {step === EXECUTIVE_STEPS.length - 1 ? (
          /* Commercial close: the primary action is the buying decision, not more browsing. */
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              Compare another objective
            </button>
            <button
              onClick={() => setScopeOpen(true)}
              disabled={!shadowReady}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: NAVY }}
            >
              Review calibration plan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setStep((current) => current + 1)} disabled={(step === 0 && !pipelineReady) || (step === 2 && !integrationReady) || (step === 3 && !shadowReady)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: NAVY }}
          >
            {nextLabels[step]}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </footer>

      {scopeOpen && <PilotScopePanel config={config} destination={destination} market={market} capacity={capacity} onClose={() => setScopeOpen(false)} />}
      {connectedTestOpen && <ConnectedTestPanel config={config} onClose={() => setConnectedTestOpen(false)} />}
      {playOpen && <GrowthPlayPanel title={config.playTitle} skill={skill} destination={destination} onClose={() => setPlayOpen(false)} />}
    </div>
  );
}

function ConnectedTestPanel({ config, onClose }: { config: LeadershipConfig; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const arms = [
    { label: "Holdout", detail: "No Ventus action", color: "#64748b" },
    { label: "Standalone", detail: `${config.businessLine} data only`, color: BLUE },
    { label: "Connected", detail: "Authorized added signals", color: GREEN },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connected-test-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2"><GitBranch className="h-4 w-4" /><span id="connected-test-title" className="text-sm font-semibold">Measure the value of connection</span></div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm font-semibold text-slate-900">Does authorized cross-business data improve the result?</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {arms.map((arm) => (
              <div key={arm.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block h-1.5 w-8 rounded-full" style={{ backgroundColor: arm.color }} />
                <p className="mt-2 text-xs font-bold text-slate-900">{arm.label}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{arm.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Expansion decision</p>
            <p className="mt-1 text-base font-semibold text-slate-950">Connected outcome − standalone outcome</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Reported only after sample, outcome coverage, data-scope exposure, and deviation gates pass.</p>
          </div>
          <p className="mt-3 text-[10px] text-slate-400">Same frozen decision protocol · no connected-data result claimed</p>
        </div>
      </div>
    </div>
  );
}

// The leave-up screen while the buying conversation starts: proposed scope, mutual
// obligations, gates, and the commercial model — everything a sponsor needs to say yes to.
function PilotScopePanel({ config, destination, market, capacity, onClose }: { config: LeadershipConfig; destination: string; market: string; capacity: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="text-sm font-semibold">Calibration + pilot plan</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="grid gap-2 sm:grid-cols-3">
            <ExecutiveMetric label="Growth Play" value={config.playTitle} />
            <ExecutiveMetric label="Pilot owner" value={config.pilotOwner} />
            <ExecutiveMetric label="Scope" value={`${market} · ${capacity}/week review capacity`} />
          </div>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Mutual commitments</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-800">Your institution</p>
              <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-600">
                <li>· {config.sourceLabel} de-identified sample</li>
                <li>· Policy owner + subject-matter experts</li>
                <li>· Sandbox endpoint for {destination}</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-800">Ventus</p>
              <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-600">
                <li>· Data mapping + golden-label evaluation</li>
                <li>· Configured Growth Play + policy pack</li>
                <li>· Holdout design + lift measurement</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" style={{ color: NAVY }} />
            <p className="text-xs leading-5 text-slate-700">
              <span className="font-semibold text-slate-900">Proposed gates:</span> ≥70% validated hit rate · positive lift vs. control · no material policy exceptions.
              No customer-facing action until the gates clear.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border p-3" style={{ borderColor: `${NAVY}22`, backgroundColor: `${NAVY}05` }}>
            <Coins className="mt-0.5 h-4 w-4 flex-none" style={{ color: NAVY }} />
            <p className="text-xs leading-5 text-slate-700">
              <span className="font-semibold text-slate-900">Commercial model:</span> fixed pilot fee, then platform + a success component on verified lift.
              Expansion is priced on measured value, not seats.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <GitBranch className="mt-0.5 h-4 w-4 flex-none text-slate-500" />
            <p className="text-xs leading-5 text-slate-600">
              <span className="font-semibold text-slate-800">Optional expansion:</span> {config.expansionUpside} Cross-business access is not required for this pilot.
            </p>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">Next step: a working session with the pilot owner to finalize market, sample, and gates.</p>
        </div>
      </div>
    </div>
  );
}

function ExecutiveChip({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
      <Icon className="h-3.5 w-3.5" style={{ color: GREEN }} /> {label}
    </span>
  );
}

function ExecutiveMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">{value}</p>
    </div>
  );
}

function PlayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">{value}</p>
    </div>
  );
}

function ProofGate({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

/* The Growth Play, translated for a business reader: six plain-language questions a
   banking exec already asks about any campaign — no schema, no jargon. Same artifact
   underneath (src/lib/skills.ts); this is its boardroom rendering. */
function GrowthPlayPanel({
  title,
  skill,
  destination,
  draft = false,
  onClose,
}: {
  title: string;
  skill: SkillArtifact;
  destination: string;
  draft?: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: NAVY }}>
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch className="h-4 w-4 flex-none" />
            <span className="truncate text-sm font-semibold">{title}</span>
            <span className="flex-none rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">
              Growth Play · {draft ? "draft" : `v${skill.version}`}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-white/80 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          {draft && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Wand2 className="mt-0.5 h-4 w-4 flex-none text-amber-700" />
              <p className="text-xs leading-5 text-amber-800">
                <span className="font-semibold">Compiled from your objective, just now.</span> A draft only — it enters
                evaluation, policy review, and shadow mode before anything runs.
              </p>
            </div>
          )}
          <p className="text-xs leading-5 text-slate-500">
            A Growth Play is a reusable decision package. Your policy and channels are part of it — not bolted on afterward.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PlayField label="When to act" value={skill.trigger} />
            <PlayField label="Who qualifies" value={skill.cohort} />
            <PlayField label="What happens" value={skill.intervention} />
            <PlayField label="Controls" value={skill.policyPack.join(" · ")} />
            <PlayField label="Where it lands" value={destination} />
            <PlayField label="How value is proven" value={`${skill.measurement.design} (${skill.measurement.holdoutPct}% holdout)`} />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border p-3" style={{ borderColor: `${NAVY}22`, backgroundColor: `${NAVY}05` }}>
            <Target className="h-4 w-4 flex-none" style={{ color: NAVY }} />
            <p className="text-xs leading-5 text-slate-700">
              <span className="font-semibold text-slate-900">Moves one number:</span> {skill.pnlMetric}
            </p>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Versioned like software · advances only through evaluation and policy gates · reusable across markets.
          </p>
        </div>
      </div>
    </div>
  );
}

function LeadershipCover({ onPick }: { onPick: (path: LeadershipPath) => void }) {
  const paths: LeadershipPath[] = ["wealth-growth", "deposit-retention"];
  return (
    <div className="flex h-full w-full items-start overflow-y-auto px-5 py-6 sm:px-8 xl:items-center xl:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>Ventus Intelligence OS</Eyebrow>
        </div>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>
          Turn transaction data into measurable growth.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Start with the data and workflows each team already controls. Ventus finds the moment, prepares the action, and proves the result.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {paths.map((path) => {
            const config = leadershipConfig(path);
            const Icon = path === "wealth-growth" ? TrendingUp : Landmark;
            return (
              <button
                key={path}
                onClick={() => onPick(path)}
                className="group flex min-h-40 flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${NAVY}0d` }}>
                    <Icon className="h-4 w-4" style={{ color: NAVY }} />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">{config.businessLine}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">{config.objective}</h2>
                <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{config.coverCopy}</p>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">{config.standaloneProof}</p>
                <span className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: GREEN }}>
                  Run scenario <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <GitBranch className="h-4 w-4 flex-none" style={{ color: NAVY }} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800">Connected intelligence comes after standalone proof.</p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">With authorization, Ventus can test whether cross-business signals add lift while preserving each team’s ownership and controls.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {[
            [Activity, "Multi-rail financial states"],
            [Wand2, "Product-level actions"],
            [LineChart, "Measured lift"],
          ].map(([Icon, label], index) => {
            const StepIcon = Icon as typeof Activity;
            return (
              <div key={label as string} className={`flex items-center justify-center gap-2 px-2 py-3 ${index > 0 ? "border-l border-slate-200" : ""}`}>
                <StepIcon className="h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                <span className="text-center text-[11px] font-semibold text-slate-600">{label as string}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function Cover({
  onPick,
  onLeadershipPick,
  audience,
}: {
  onPick: (scene: number, mode: Mode) => void;
  onLeadershipPick: (path: LeadershipPath) => void;
  audience: DemoAudience;
}) {
  const internal = audience === "internal";
  if (!internal) return <LeadershipCover onPick={onLeadershipPick} />;
  return (
    <div className="flex h-full w-full items-center px-6 py-4 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>Ventus Intelligence OS</Eyebrow>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
            {internal ? "Internal evaluation sandbox" : "BofA leadership prototype"}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: NAVY, lineHeight: 1.25 }}>
          From financial activity to growth strategies that learn.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Ventus understands changing financial states, designs a governed intervention, activates it through existing channels, and measures incremental value.
        </p>

        <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-4">
          {VENTUS_LOOP.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex items-center gap-2 px-3 py-2 ${index > 0 ? "sm:border-l sm:border-slate-200" : ""}`}>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg" style={{ backgroundColor: `${NAVY}0d` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: NAVY }} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[10px] leading-4 text-slate-400">{item.copy}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: `${NAVY}0d` }}>
                <UserRoundCheck className="h-4 w-4" style={{ color: NAVY }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Frontline teams</p>
                <p className="text-xs text-slate-400">Pick a seat</p>
              </div>
            </div>
            <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">One qualified moment, one recommendation, in the employee's normal flow.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => onPick(0, "consumer")}
                className="group flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition hover:bg-slate-50"
                style={{ borderColor: `${NAVY}22`, color: NAVY }}
              >
                <Landmark className="h-3.5 w-3.5" /> Banker
              </button>
              <button
                onClick={() => onPick(0, "frontline")}
                className="group flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition hover:bg-slate-50"
                style={{ borderColor: `${GREEN}33`, color: GREEN }}
              >
                <UserRoundCheck className="h-3.5 w-3.5" /> Merrill advisor
              </button>
            </div>
          </div>
          {internal ? (
            <CoverCard
              icon={Wand2}
              badge="Growth teams"
              who="Product · analytics · CRM · risk"
              body="Evaluate a reusable decision package before it is approved for a pilot."
              cta="Open evaluation tools"
              onClick={() => onPick(5, "operator")}
            />
          ) : (
            <CoverCard
              icon={Rocket}
              badge="Paid pilot"
              who="Sponsor · business · risk · technology"
              body="Prove one growth outcome with sanctioned data, governed activation, and a holdout."
              cta="Review 90-day pilot"
              onClick={() => onPick(6, "leadership")}
            />
          )}
          <CoverCard
            icon={LineChart}
            badge="Leadership"
            who="Consumer + wealth executives"
            body="Fund strategies by incremental value, operating capacity, and control."
            cta="Review growth portfolio"
            onClick={() => onPick(5, "leadership")}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">BofA configuration</span>
          {BOFA_SURFACES.map((s) => (
            <span key={s} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {s}
            </span>
          ))}
          <span className="text-[10px] text-slate-400">Bank-specific configuration. Portable Ventus platform underneath.</span>
        </div>
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
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: `${NAVY}0d` }}>
          <Icon className="h-4 w-4" style={{ color: NAVY }} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{badge}</p>
          <p className="text-xs text-slate-400">{who}</p>
        </div>
      </div>
      <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">{body}</p>
      <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold transition group-hover:gap-2.5" style={{ color: GREEN }}>
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
    weeks: "Weeks 1–3",
    title: "Calibrate",
    body: "Map sanctioned feeds, labels, products, and policies. Establish the precision baseline.",
  },
  {
    weeks: "Weeks 4–8",
    title: "Shadow run",
    body: "Rank without customer action. Capture banker, advisor, risk, and operations feedback.",
  },
  {
    weeks: "Weeks 9–12",
    title: "Controlled activation",
    body: "Activate an eligible cohort through existing systems. Measure incremental lift versus control.",
  },
];

function PilotScene() {
  return (
    <SceneShell fill>
      <div className="grid h-full grid-cols-1 items-center gap-6 lg:grid-cols-2">
        <div>
          <Eyebrow>Paid MVP pilot</Eyebrow>
          <h1 className="mt-1.5 text-3xl font-semibold leading-tight tracking-tight" style={{ color: NAVY }}>
            Prove one Ventus Skill in 90 days.
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Prove one business line at a time: <span className="font-semibold text-slate-800">deposit-primacy defense</span> for Consumer or
            <span className="font-semibold text-slate-800"> Merrill relationship growth</span> for Wealth. Test a connected handoff only after standalone lift is measured.
          </p>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">A bounded enterprise test</p>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                "Pilot institution: sanctioned sample, SMEs, policy owner, and sandbox endpoints",
                "Ventus: data mapping, golden evaluation, one configured Growth Play, and measurement",
                "Activation begins only after policy and precision gates clear",
                "Institution-specific data, policies, and performance remain isolated",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs leading-4 text-slate-700">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-medium leading-4 text-slate-500">
              Scale only if: ≥90% precision · ≥35% acceptance · measurable lift vs control · no material policy exceptions.
            </p>
          </div>

          <div className="mt-2.5 flex items-start gap-2 rounded-xl border p-3" style={{ borderColor: `${NAVY}22`, backgroundColor: `${NAVY}05` }}>
            <Coins className="mt-0.5 h-4 w-4 flex-none" style={{ color: NAVY }} />
            <div>
              <p className="text-xs font-semibold text-slate-800">Initial buyer: Consumer Bank P&amp;L owner · fixed-fee paid pilot</p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                Production scope and pricing follow the measured pilot result; no success fee is assumed before attribution is agreed.
              </p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {[
              { Icon: ShieldCheck, t: "Controlled boundary", s: "Deployment design reviewed with bank security" },
              { Icon: Network, t: "Headless target", s: "Stage into approved employee channels" },
              { Icon: Cpu, t: "Gated models", s: "No runtime model use before approval" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-slate-200 bg-white p-2.5">
                <x.Icon className="h-3.5 w-3.5" style={{ color: NAVY }} />
                <p className="mt-1 text-[11px] font-bold text-slate-800">{x.t}</p>
                <p className="text-[10px] leading-3.5 text-slate-400">{x.s}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-4 w-4" style={{ color: NAVY }} />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">The 90 days</p>
          </div>
          <div className="space-y-2">
            {pilotPhases.map((p, i) => (
              <div key={p.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: NAVY }}>
                    {i + 1}
                  </span>
                  {i < pilotPhases.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" />}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{p.weeks}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{p.body}</p>
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
    <div className={`flex h-full w-full items-center overflow-hidden px-6 sm:px-10 ${fill ? "py-3" : "py-6"}`}>
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
