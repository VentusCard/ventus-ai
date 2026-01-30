
import { LifestyleGoal } from "@/pages/OnboardingFlow";

export interface OnboardingData {
  mainGoal: LifestyleGoal | null;
  subcategories: string[];
  spendingFrequency: "weekly" | "monthly" | "quarterly" | "annually";
  spendingAmount: number;
  estimatedAnnualSpend: number;
  estimatedPoints: number;
  minCashbackPercentage: number;
  maxCashbackPercentage: number;
  cashbackPercentage?: number; // Keep for backward compatibility
}
