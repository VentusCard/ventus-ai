import {
  GraduationCap,
  Home,
  Briefcase,
  Car,
  Building2,
  PiggyBank,
  Plane,
  Store,
  HandCoins,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type FlowCategory =
  | "Lending"
  | "Wealth"
  | "Deposits"
  | "Cards"
  | "Insurance";

export type SignalType = "life-event" | "behavioral";

export interface FlowSignal {
  label: string;
  evidence: string;
  type: SignalType;
}

export interface ProductFlow {
  id: string;
  name: string;
  category: FlowCategory;
  icon: LucideIcon;
  positioning: string;
  signals: FlowSignal[];
  estimatedAudience: number; // out of ~250M
  penetration: number; // 0-1, share of base eligible
  defaultActive?: boolean;
}

export const PRODUCT_FLOWS: ProductFlow[] = [
  {
    id: "529-plan",
    name: "529 College Savings Plan",
    category: "Wealth",
    icon: GraduationCap,
    positioning: "Tax-advantaged education savings for families with young or college-bound children.",
    signals: [
      { label: "Newborn purchase cluster", evidence: "Buy Buy Baby, Carter's, pediatric copays within 90 days", type: "life-event" },
      { label: "Dependent age inference (0–2 yrs)", evidence: "Diaper subscriptions, daycare ACH, formula brands", type: "life-event" },
      { label: "College-age dependent (16–18 yrs)", evidence: "Private school tuition, SAT/ACT fees, college tour travel", type: "life-event" },
      { label: "Stated savings intent", evidence: "Search behavior for 'college savings' on bank web app", type: "behavioral" },
    ],
    estimatedAudience: 14_200_000,
    penetration: 0.057,
    defaultActive: true,
  },
  {
    id: "heloc",
    name: "Home Equity Line of Credit",
    category: "Lending",
    icon: Home,
    positioning: "Flexible credit secured by home equity for renovations or large expenses.",
    signals: [
      { label: "Home renovation spend", evidence: "Home Depot, Lowe's, contractor ACH > $1,000", type: "behavioral" },
      { label: "Property tax payment", evidence: "Annual or semi-annual county treasurer ACH", type: "behavioral" },
      { label: "Long-term homeowner", evidence: "Mortgage on file > 5 years with current bank", type: "life-event" },
    ],
    estimatedAudience: 9_800_000,
    penetration: 0.039,
    defaultActive: true,
  },
  {
    id: "wealth-management",
    name: "Wealth Management",
    category: "Wealth",
    icon: Briefcase,
    positioning: "Holistic advisory for high-net-worth households and complex balance sheets.",
    signals: [
      { label: "Large equity comp deposit", evidence: "Quarterly RSU vest, ESPP buyback inflows", type: "behavioral" },
      { label: "Recurring brokerage transfers", evidence: "Outbound ACH to external brokerage > $5k/mo", type: "behavioral" },
      { label: "Country club dues", evidence: "Recurring private club, golf, yacht club ACH", type: "behavioral" },
      { label: "Private aviation indicator", evidence: "Charter operator card spend, fractional jet membership", type: "behavioral" },
    ],
    estimatedAudience: 6_400_000,
    penetration: 0.026,
    defaultActive: true,
  },
  {
    id: "auto-loan",
    name: "Auto Loan",
    category: "Lending",
    icon: Car,
    positioning: "Financing for new or used vehicle purchase, with refi for existing loans.",
    signals: [
      { label: "Repeated dealer visits", evidence: "Card-present spend at dealerships across 2+ weekends", type: "behavioral" },
      { label: "Lease-end timing", evidence: "Captive lender ACH ending in 60–90 days", type: "life-event" },
      { label: "Auto insurance shop-around", evidence: "Multiple insurer one-time charges within 30 days", type: "behavioral" },
    ],
    estimatedAudience: 11_500_000,
    penetration: 0.046,
  },
  {
    id: "mortgage",
    name: "Mortgage",
    category: "Lending",
    icon: Building2,
    positioning: "Purchase and refinance mortgages for first-time and move-up buyers.",
    signals: [
      { label: "Rent above local median", evidence: "Recurring rent ACH > regional 75th percentile", type: "behavioral" },
      { label: "Pre-approval inquiry", evidence: "Soft-pull or rate-quote interaction in bank app", type: "life-event" },
      { label: "Down-payment accumulation", evidence: "Savings balance growth trajectory + low debt service", type: "behavioral" },
    ],
    estimatedAudience: 13_700_000,
    penetration: 0.055,
  },
  {
    id: "personal-loan",
    name: "Personal Loan",
    category: "Lending",
    icon: HandCoins,
    positioning: "Unsecured installment loans for consolidation or one-time expenses.",
    signals: [
      { label: "Repeated BNPL usage", evidence: "Affirm, Klarna, Afterpay charges across 3+ merchants", type: "behavioral" },
      { label: "Cash-advance recovery", evidence: "Card cash-advance followed by paycheck-aligned paydown", type: "behavioral" },
      { label: "Revolving balance creep", evidence: "Card utilization rising for 4+ consecutive cycles", type: "behavioral" },
    ],
    estimatedAudience: 8_900_000,
    penetration: 0.036,
  },
  {
    id: "high-yield-savings",
    name: "High-Yield Savings",
    category: "Deposits",
    icon: PiggyBank,
    positioning: "Premium savings yield for customers with idle checking balances.",
    signals: [
      { label: "Idle checking balance", evidence: "Avg balance > $25k for 90 consecutive days", type: "behavioral" },
      { label: "Outbound yield-seeking", evidence: "Recurring ACH to neobank or money-market app", type: "behavioral" },
    ],
    estimatedAudience: 18_600_000,
    penetration: 0.074,
    defaultActive: true,
  },
  {
    id: "travel-card",
    name: "Travel Rewards Card",
    category: "Cards",
    icon: Plane,
    positioning: "Premium travel card with points, lounge access, and travel protections.",
    signals: [
      { label: "Multi-airline spend", evidence: "Spend across 2+ carriers in trailing 12 months", type: "behavioral" },
      { label: "Hotel diversity", evidence: "3+ distinct hotel chains within 6 months", type: "behavioral" },
      { label: "International transactions", evidence: "Foreign-currency spend in trailing 6 months", type: "behavioral" },
    ],
    estimatedAudience: 12_100_000,
    penetration: 0.048,
  },
  {
    id: "small-business-loan",
    name: "Small Business Loan",
    category: "Lending",
    icon: Store,
    positioning: "Working capital and term loans for sole proprietors and small businesses.",
    signals: [
      { label: "Vendor ACH cluster", evidence: "5+ distinct business-supplier ACH counterparties", type: "behavioral" },
      { label: "Square / Stripe deposits", evidence: "Recurring processor deposits to personal account", type: "behavioral" },
      { label: "Business-pattern card use", evidence: "Office supply + SaaS subscription combo", type: "behavioral" },
    ],
    estimatedAudience: 3_200_000,
    penetration: 0.013,
  },
  {
    id: "life-insurance",
    name: "Term Life Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Income protection for new families and primary earners.",
    signals: [
      { label: "Recent family formation", evidence: "Newborn cluster + first dependent listed on account", type: "life-event" },
      { label: "New mortgage holder", evidence: "Mortgage opened within trailing 12 months", type: "life-event" },
      { label: "Single-earner household", evidence: "One W-2 deposit source supporting 2+ dependents", type: "behavioral" },
    ],
    estimatedAudience: 7_500_000,
    penetration: 0.030,
  },
];

export function getProductFlow(id: string): ProductFlow | undefined {
  return PRODUCT_FLOWS.find((p) => p.id === id);
}
