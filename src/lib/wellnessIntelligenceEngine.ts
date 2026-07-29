import { EnrichedTransaction } from "@/types/transaction";

export interface FinancialTip {
  id: string;
  message: string;
  category: string;
  potentialSavings?: string;
  icon: string;
}

export interface CustomerInsightLog {
  id: string;
  customerName: string;
  tipDelivered: string;
  response: "acknowledged" | "needs_help";
  sentiment: "positive" | "neutral" | "concerned";
  keyTakeaway: string;
  timestamp: string;
  bankerAction?: string;
}

export interface WellnessSignal {
  id: string;
  type: "stress" | "opportunity";
  signalName: string;
  severity: number;
  customerName: string;
  bankerSummary: string;
  recommendedAction: string;
  detectedAt: string;
  status: "new" | "acknowledged" | "resolved";
}

export interface WellnessKPIs {
  tipsDelivered: number;
  responseRate: number;
  needsHelpSignals: number;
  engagementScore: number;
}

const TIPS: FinancialTip[] = [
  {
    id: "tip-1",
    message: "Pay off your credit card balance early this month to avoid $47 in estimated interest charges.",
    category: "Debt Management",
    potentialSavings: "$47/mo",
    icon: "Shield",
  },
  {
    id: "tip-2",
    message: "You have $620 extra this month compared to your average. Moving it to savings could grow your emergency fund 2x faster.",
    category: "Savings",
    potentialSavings: "$620",
    icon: "PiggyBank",
  },
  {
    id: "tip-3",
    message: "Your dining spending is up 38% this month. Switching 2 meals out per week to cooking could save ~$180.",
    category: "Spending",
    potentialSavings: "$180/mo",
    icon: "TrendingDown",
  },
  {
    id: "tip-4",
    message: "You're paying for 3 streaming services totaling $52/mo. You haven't used one in 60+ days — consider pausing it.",
    category: "Subscriptions",
    potentialSavings: "$18/mo",
    icon: "LayoutGrid",
  },
  {
    id: "tip-5",
    message: "Your auto loan pays off in 3 months! Start planning where to redirect that $420/mo payment.",
    category: "Planning",
    potentialSavings: "$420/mo",
    icon: "Plane",
  },
];

export function generateFinancialTip(transactions: EnrichedTransaction[]): FinancialTip {
  // In a real system, this would analyze transactions to pick the most relevant tip
  // For demo, rotate based on transaction count
  const index = transactions.length % TIPS.length;
  return TIPS[index];
}

export function generateMockCustomerInsights(): CustomerInsightLog[] {
  return [
    { id: "ci-1", customerName: "Jane Martinez", tipDelivered: "Pay off credit card balance early", response: "needs_help", sentiment: "concerned", keyTakeaway: "Customer mentioned unexpected car repair expenses. May need short-term credit options.", timestamp: "2025-03-12T10:30:00Z", bankerAction: "Schedule financial review" },
    { id: "ci-2", customerName: "Michael Chen", tipDelivered: "Move surplus $620 to savings", response: "acknowledged", sentiment: "positive", keyTakeaway: "Customer set up automatic transfer to savings. Engaged with budgeting tools.", timestamp: "2025-03-12T09:15:00Z" },
    { id: "ci-3", customerName: "Sarah Williams", tipDelivered: "Reduce dining spending", response: "acknowledged", sentiment: "neutral", keyTakeaway: "Customer acknowledged but mentioned social obligations. Open to cashback dining card.", timestamp: "2025-03-11T16:45:00Z", bankerAction: "Cross-sell dining rewards card" },
    { id: "ci-4", customerName: "Robert Johnson", tipDelivered: "Cancel unused streaming subscription", response: "acknowledged", sentiment: "positive", keyTakeaway: "Cancelled 2 subscriptions immediately. Saved $34/month.", timestamp: "2025-03-11T14:20:00Z" },
    { id: "ci-5", customerName: "Emily Davis", tipDelivered: "Pay off credit card balance early", response: "needs_help", sentiment: "concerned", keyTakeaway: "Customer is between jobs. Requested information on hardship programs.", timestamp: "2025-03-11T11:00:00Z", bankerAction: "Offer payment deferral" },
    { id: "ci-6", customerName: "David Kim", tipDelivered: "Redirect auto loan payment", response: "acknowledged", sentiment: "positive", keyTakeaway: "Customer interested in investment options for freed-up cash flow.", timestamp: "2025-03-10T15:30:00Z", bankerAction: "Connect with wealth advisor" },
    { id: "ci-7", customerName: "Lisa Thompson", tipDelivered: "Move surplus to savings", response: "needs_help", sentiment: "concerned", keyTakeaway: "Customer has upcoming tuition payment. Needs to keep cash liquid.", timestamp: "2025-03-10T13:10:00Z", bankerAction: "Discuss education savings plan" },
    { id: "ci-8", customerName: "James Wilson", tipDelivered: "Reduce dining spending", response: "acknowledged", sentiment: "neutral", keyTakeaway: "Customer plans to meal prep more. Asked about grocery cashback offers.", timestamp: "2025-03-10T10:45:00Z" },
    { id: "ci-9", customerName: "Amanda Brown", tipDelivered: "Cancel unused subscriptions", response: "acknowledged", sentiment: "positive", keyTakeaway: "Appreciated the alert. Didn't realize she had duplicate services.", timestamp: "2025-03-09T16:00:00Z" },
    { id: "ci-10", customerName: "Kevin Patel", tipDelivered: "Pay off credit card balance early", response: "needs_help", sentiment: "concerned", keyTakeaway: "Customer has high medical bills. May benefit from balance transfer offer.", timestamp: "2025-03-09T11:30:00Z", bankerAction: "Offer 0% balance transfer" },
    { id: "ci-11", customerName: "Rachel Garcia", tipDelivered: "Move surplus to savings", response: "acknowledged", sentiment: "positive", keyTakeaway: "Customer opened a high-yield savings account same day.", timestamp: "2025-03-09T09:00:00Z" },
    { id: "ci-12", customerName: "Thomas Lee", tipDelivered: "Redirect auto loan payment", response: "acknowledged", sentiment: "positive", keyTakeaway: "Customer wants to start a Roth IRA with freed funds.", timestamp: "2025-03-08T14:20:00Z", bankerAction: "Schedule IRA consultation" },
  ];
}

export function generateMockAlerts(): WellnessSignal[] {
  return [
    { id: "ws-1", type: "stress", signalName: "Income Disruption", severity: 5, customerName: "Emily Davis", bankerSummary: "Primary payroll deposit stopped 2 weeks ago. Possible job loss. Recommend proactive outreach with hardship options.", recommendedAction: "Call with hardship program offer", detectedAt: "2025-03-11T08:00:00Z", status: "new" },
    { id: "ws-2", type: "stress", signalName: "Overdraft Acceleration", severity: 4, customerName: "Kevin Patel", bankerSummary: "Overdrafted 4x this month vs 1x average. Financial stress likely increasing.", recommendedAction: "Offer overdraft protection line", detectedAt: "2025-03-12T06:00:00Z", status: "new" },
    { id: "ws-3", type: "opportunity", signalName: "Income Increase", severity: 3, customerName: "Michael Chen", bankerSummary: "Payroll deposit increased ~18%. Good time for investment or savings conversation.", recommendedAction: "Schedule wealth planning session", detectedAt: "2025-03-10T08:00:00Z", status: "acknowledged" },
    { id: "ws-4", type: "stress", signalName: "Savings Drain", severity: 4, customerName: "Lisa Thompson", bankerSummary: "Withdrew 60% of savings in 30 days. May need credit line or financial counseling.", recommendedAction: "Offer personal line of credit", detectedAt: "2025-03-10T12:00:00Z", status: "new" },
    { id: "ws-5", type: "opportunity", signalName: "Surplus Accumulation", severity: 2, customerName: "Rachel Garcia", bankerSummary: "$12K sitting idle in checking with no savings activity. Investment opportunity.", recommendedAction: "Send targeted savings rate promotion", detectedAt: "2025-03-09T08:00:00Z", status: "acknowledged" },
    { id: "ws-6", type: "stress", signalName: "Late Payment Pattern", severity: 3, customerName: "Jane Martinez", bankerSummary: "Bill payment timing shifted 8+ days later across 3 accounts. Cash flow tightening.", recommendedAction: "Suggest bill payment restructuring", detectedAt: "2025-03-11T10:00:00Z", status: "new" },
    { id: "ws-7", type: "opportunity", signalName: "Debt Payoff Approaching", severity: 2, customerName: "David Kim", bankerSummary: "Auto loan pays off in 2 months. Re-engagement window for new product.", recommendedAction: "Offer investment account for freed cash flow", detectedAt: "2025-03-08T08:00:00Z", status: "resolved" },
    { id: "ws-8", type: "stress", signalName: "Deposit Flight", severity: 4, customerName: "Thomas Anderson", bankerSummary: "Started recurring $2K transfers to Marcus. Rate shopping likely.", recommendedAction: "Offer competitive savings rate", detectedAt: "2025-03-12T07:00:00Z", status: "new" },
    { id: "ws-9", type: "opportunity", signalName: "Life Event — Positive", severity: 3, customerName: "Sarah Williams", bankerSummary: "Home purchase signals detected (furniture, moving expenses). Mortgage cross-sell opportunity.", recommendedAction: "Connect with mortgage specialist", detectedAt: "2025-03-09T14:00:00Z", status: "acknowledged" },
    { id: "ws-10", type: "stress", signalName: "Spending Volatility", severity: 3, customerName: "Amanda Brown", bankerSummary: "Spending variance tripled this quarter. Instability signal.", recommendedAction: "Schedule financial wellness review", detectedAt: "2025-03-10T09:00:00Z", status: "new" },
  ];
}

export function getWellnessKPIs(): WellnessKPIs {
  return {
    tipsDelivered: 14280,
    responseRate: 67.3,
    needsHelpSignals: 2840,
    engagementScore: 74,
  };
}
