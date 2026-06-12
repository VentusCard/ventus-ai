export type ActivityAction =
  | "Enrolled"
  | "Paused"
  | "Drafted"
  | "Optimized"
  | "Suppressed"
  | "Detected";

export interface AutonomousActivity {
  id: string;
  action: ActivityAction;
  description: string;
  timeAgo: string;
  affected?: string;
}

export const AUTONOMOUS_ACTIVITY: AutonomousActivity[] = [
  {
    id: "a1",
    action: "Enrolled",
    description: "Enrolled customers into HELOC equity-tap flow after home-value uptick signals",
    timeAgo: "12m ago",
    affected: "1,240 customers",
  },
  {
    id: "a2",
    action: "Optimized",
    description: "Shifted Term Life flow from email to in-app push — engagement lift detected",
    timeAgo: "1h ago",
    affected: "2.3× lift",
  },
  {
    id: "a3",
    action: "Drafted",
    description: "Drafted 3 new flows from emerging signals — awaiting RM review",
    timeAgo: "2h ago",
    affected: "3 flows",
  },
  {
    id: "a4",
    action: "Paused",
    description: "Paused Auto-Refi campaign — saturation detected in 18–34 segment",
    timeAgo: "4h ago",
    affected: "Auto-Refi",
  },
  {
    id: "a5",
    action: "Detected",
    description: "Detected new cohort: Empty-Nesters relocating coastal — Wealth-led signals",
    timeAgo: "6h ago",
    affected: "~380 customers",
  },
  {
    id: "a6",
    action: "Suppressed",
    description: "Suppressed outreach — frequency cap reached on recent contacts",
    timeAgo: "8h ago",
    affected: "412 customers",
  },
  {
    id: "a7",
    action: "Enrolled",
    description: "Enrolled new parents into 529 college savings flow on confirmed life-event",
    timeAgo: "11h ago",
    affected: "~210 customers",
  },
  {
    id: "a8",
    action: "Optimized",
    description: "Rebalanced Travel Card flow toward weekend send windows — open-rate lift",
    timeAgo: "Yesterday",
    affected: "+18% opens",
  },
];
