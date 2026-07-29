import { ArrowUpCircle, CheckCircle, AlertTriangle } from "lucide-react";

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBudgetStatus(spend: number, budget: number) {
  const ratio = spend / budget;
  if (ratio > 1) return { status: "over" as const, color: "#ef4444", icon: ArrowUpCircle, label: "Over Budget" };
  if (ratio >= 0.7) return { status: "near" as const, color: "#f59e0b", icon: AlertTriangle, label: "Near Limit" };
  return { status: "under" as const, color: "#22c55e", icon: CheckCircle, label: "Under Budget" };
}

export function initializeBudgets(pillars: { pillar: string; totalSpend: number }[]): Record<string, number> {
  const map: Record<string, number> = {};
  pillars.forEach((p) => {
    const seed = hashString(p.pillar);
    const multiplier = 0.7 + ((seed % 80) / 100);
    map[p.pillar] = Math.round(p.totalSpend * multiplier);
  });
  return map;
}
