export type ActivityAction =
  | "Email sent"
  | "App push"
  | "In-app"
  | "SMS"
  | "Optimized"
  | "Held";

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
    action: "App push",
    description: "Travel Card upgrade nudge to frequent-flyer spenders",
    timeAgo: "8m ago",
    affected: "4,180 delivered",
  },
  {
    id: "a2",
    action: "Email sent",
    description: "HELOC equity-tap wave 2 — home-value uptick segment",
    timeAgo: "26m ago",
    affected: "12,400 sent",
  },
  {
    id: "a3",
    action: "In-app",
    description: "529 savings tile placed on dashboard for confirmed new parents",
    timeAgo: "1h ago",
    affected: "2,310 sessions",
  },
  {
    id: "a4",
    action: "Optimized",
    description: "Auto-Refi email moved to Tue 9am send window",
    timeAgo: "2h ago",
    affected: "+18% opens",
  },
  {
    id: "a5",
    action: "SMS",
    description: "Overdraft-cushion line offer to repeat-fee customers",
    timeAgo: "3h ago",
    affected: "890 delivered",
  },
  {
    id: "a6",
    action: "Held",
    description: "Small-business LOC email paused — frequency cap hit",
    timeAgo: "5h ago",
    affected: "412 held",
  },
  {
    id: "a7",
    action: "Email sent",
    description: "Term Life cross-sell to new-mortgage cohort",
    timeAgo: "7h ago",
    affected: "6,750 sent",
  },
  {
    id: "a8",
    action: "In-app",
    description: "Card hub carousel swapped to dining rewards for lapsed diners",
    timeAgo: "9h ago",
    affected: "5,140 sessions",
  },
  {
    id: "a9",
    action: "Optimized",
    description: "CD ladder campaign shifted from email to in-app placement",
    timeAgo: "11h ago",
    affected: "2.3× lift",
  },
  {
    id: "a10",
    action: "App push",
    description: "Rewards boost reminder for lapsed dining spenders",
    timeAgo: "Yesterday",
    affected: "3,020 delivered",
  },
  {
    id: "a11",
    action: "Email sent",
    description: "Business checking upgrade wave — merchant-deposit signals",
    timeAgo: "Yesterday",
    affected: "8,930 sent",
  },
  {
    id: "a12",
    action: "Held",
    description: "Auto loan renewal push withheld — governance review pending",
    timeAgo: "Yesterday",
    affected: "1,120 held",
  },
];
