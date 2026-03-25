import { EnrichedTransaction } from "@/types/transaction";

export type AchievementStatus = "locked" | "in_progress" | "unlocked";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  category: string;
  progress: { current: number; target: number };
  status: AchievementStatus;
  unlockedAt?: string;
}

function getWeekKey(date: string): string {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

function getMonthKey(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

function checkConsistentSaver(txns: EnrichedTransaction[]): Achievement {
  const weeklySpend = new Map<string, { groceries: number; dining: number }>();
  txns.forEach((t) => {
    const week = getWeekKey(t.date);
    const data = weeklySpend.get(week) || { groceries: 0, dining: 0 };
    const sub = t.subcategory.toLowerCase();
    const pillar = t.pillar.toLowerCase();
    if (sub.includes("grocer") || sub.includes("supermarket")) data.groceries += t.amount;
    else if (pillar.includes("dining") || sub.includes("restaurant") || sub.includes("dining")) data.dining += t.amount;
    weeklySpend.set(week, data);
  });

  let saverWeeks = 0;
  weeklySpend.forEach((data) => {
    if (data.groceries > 0 && data.groceries > data.dining) saverWeeks++;
  });

  const target = 4;
  const current = Math.min(saverWeeks, target);
  return {
    id: "consistent-saver",
    title: "Consistent Saver",
    description: "Spend more on groceries than dining out for 4+ weeks",
    icon: "PiggyBank",
    category: "Saving",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkBudgetGuardian(txns: EnrichedTransaction[]): Achievement {
  // Simulate budget check: pillars where avg monthly spend is below median
  const pillarTotals = new Map<string, number>();
  txns.forEach((t) => {
    pillarTotals.set(t.pillar, (pillarTotals.get(t.pillar) || 0) + t.amount);
  });

  const totals = Array.from(pillarTotals.values()).sort((a, b) => a - b);
  const median = totals[Math.floor(totals.length / 2)] || 0;
  let underBudget = 0;
  pillarTotals.forEach((total) => {
    if (total <= median * 1.1) underBudget++;
  });

  const target = 3;
  const current = Math.min(underBudget, target);
  return {
    id: "budget-guardian",
    title: "Budget Guardian",
    description: "Keep 3+ spending categories under budget",
    icon: "Shield",
    category: "Budgeting",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkDiversifiedSpender(txns: EnrichedTransaction[]): Achievement {
  const pillars = new Set(txns.map((t) => t.pillar));
  const target = 8;
  const current = Math.min(pillars.size, target);
  return {
    id: "diversified-spender",
    title: "Diversified Spender",
    description: "Transact across 8+ lifestyle categories",
    icon: "LayoutGrid",
    category: "Lifestyle",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkTravelPlanner(txns: EnrichedTransaction[]): Achievement {
  const travelTxns = txns.filter((t) => t.trip_label);
  // Check for advance bookings: transactions dated well before travel period
  let advanceBookings = 0;
  travelTxns.forEach((t) => {
    if (t.travel_context?.travel_period_start) {
      const txDate = new Date(t.date);
      const travelStart = new Date(t.travel_context.travel_period_start);
      const daysBefore = (travelStart.getTime() - txDate.getTime()) / 86400000;
      if (daysBefore > 14) advanceBookings++;
    }
  });
  const target = 2;
  const current = Math.min(advanceBookings, target);
  return {
    id: "travel-planner",
    title: "Travel Planner",
    description: "Book travel 2+ weeks in advance at least twice",
    icon: "Plane",
    category: "Travel",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkSubscriptionAuditor(txns: EnrichedTransaction[]): Achievement {
  // Find recurring merchants (same merchant, multiple months)
  const merchantMonths = new Map<string, Set<string>>();
  txns.forEach((t) => {
    const month = getMonthKey(t.date);
    const months = merchantMonths.get(t.normalized_merchant) || new Set();
    months.add(month);
    merchantMonths.set(t.normalized_merchant, months);
  });

  let recurringCount = 0;
  merchantMonths.forEach((months) => {
    if (months.size >= 3) recurringCount++;
  });

  const target = 3;
  const current = Math.min(recurringCount, target);
  return {
    id: "subscription-auditor",
    title: "Subscription Auditor",
    description: "Identify 3+ recurring subscriptions in your spending",
    icon: "Search",
    category: "Awareness",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkLocalChampion(txns: EnrichedTransaction[]): Achievement {
  const diningRetail = txns.filter((t) => {
    const p = t.pillar.toLowerCase();
    return p.includes("dining") || p.includes("retail") || p.includes("shopping");
  });

  if (diningRetail.length === 0) {
    return {
      id: "local-champion",
      title: "Local Champion",
      description: "60%+ of dining & retail spend at local merchants",
      icon: "MapPin",
      category: "Community",
      progress: { current: 0, target: 60 },
      status: "locked",
    };
  }

  // Local = home_zip matches zip_code or no travel context
  const localTxns = diningRetail.filter((t) => !t.trip_label);
  const localPct = Math.round((localTxns.length / diningRetail.length) * 100);
  const target = 60;
  return {
    id: "local-champion",
    title: "Local Champion",
    description: "60%+ of dining & retail spend at local merchants",
    icon: "MapPin",
    category: "Community",
    progress: { current: Math.min(localPct, 100), target },
    status: localPct >= target ? "unlocked" : localPct > 20 ? "in_progress" : "locked",
    ...(localPct >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkNoImpulseStreak(txns: EnrichedTransaction[]): Achievement {
  // Calculate category averages then check for streaks of no 2x outlier weeks
  const catAvg = new Map<string, { sum: number; count: number }>();
  txns.forEach((t) => {
    const data = catAvg.get(t.pillar) || { sum: 0, count: 0 };
    data.sum += t.amount;
    data.count++;
    catAvg.set(t.pillar, data);
  });

  const avgByPillar = new Map<string, number>();
  catAvg.forEach((data, pillar) => {
    avgByPillar.set(pillar, data.sum / data.count);
  });

  // Check weeks without any transaction > 2x its category average
  const weekTxns = new Map<string, EnrichedTransaction[]>();
  txns.forEach((t) => {
    const week = getWeekKey(t.date);
    const arr = weekTxns.get(week) || [];
    arr.push(t);
    weekTxns.set(week, arr);
  });

  let streakWeeks = 0;
  const sortedWeeks = Array.from(weekTxns.keys()).sort();
  for (const week of sortedWeeks) {
    const weekTs = weekTxns.get(week) || [];
    const hasImpulse = weekTs.some((t) => {
      const avg = avgByPillar.get(t.pillar) || 0;
      return avg > 0 && t.amount > avg * 2;
    });
    if (!hasImpulse) streakWeeks++;
    else streakWeeks = 0; // reset streak
  }

  const target = 2;
  const current = Math.min(streakWeeks, target);
  return {
    id: "no-impulse-streak",
    title: "Streak: No Impulse",
    description: "No transactions over 2× category average for 2+ weeks",
    icon: "Flame",
    category: "Discipline",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

function checkWellnessInvestor(txns: EnrichedTransaction[]): Achievement {
  const wellnessByMonth = new Map<string, number>();
  txns.forEach((t) => {
    if (t.pillar.toLowerCase().includes("health") || t.pillar.toLowerCase().includes("wellness")) {
      const month = getMonthKey(t.date);
      wellnessByMonth.set(month, (wellnessByMonth.get(month) || 0) + t.amount);
    }
  });

  const months = Array.from(wellnessByMonth.keys()).sort();
  let trendingUp = 0;
  for (let i = 1; i < months.length; i++) {
    const prev = wellnessByMonth.get(months[i - 1]) || 0;
    const curr = wellnessByMonth.get(months[i]) || 0;
    if (curr > prev) trendingUp++;
  }

  const target = 2;
  const current = Math.min(trendingUp, target);
  return {
    id: "wellness-investor",
    title: "Wellness Investor",
    description: "Health & Wellness spend trending up month-over-month",
    icon: "Heart",
    category: "Health",
    progress: { current, target },
    status: current >= target ? "unlocked" : current > 0 ? "in_progress" : "locked",
    ...(current >= target ? { unlockedAt: new Date().toISOString() } : {}),
  };
}

export function calculateAchievements(txns: EnrichedTransaction[]): Achievement[] {
  if (txns.length === 0) return [];
  return [
    checkConsistentSaver(txns),
    checkBudgetGuardian(txns),
    checkDiversifiedSpender(txns),
    checkTravelPlanner(txns),
    checkSubscriptionAuditor(txns),
    checkLocalChampion(txns),
    checkNoImpulseStreak(txns),
    checkWellnessInvestor(txns),
  ];
}

export function calculateHealthScore(achievements: Achievement[]): number {
  if (achievements.length === 0) return 0;
  let score = 0;
  achievements.forEach((a) => {
    if (a.status === "unlocked") score += 12.5; // 100 / 8
    else if (a.status === "in_progress") {
      score += 12.5 * (a.progress.current / a.progress.target) * 0.5;
    }
  });
  return Math.round(score);
}

export function getLevel(score: number): { label: string; tier: number } {
  if (score >= 80) return { label: "Financial Pro", tier: 4 };
  if (score >= 55) return { label: "Budgeting Pro", tier: 3 };
  if (score >= 30) return { label: "Saver Lv.2", tier: 2 };
  return { label: "Getting Started", tier: 1 };
}
