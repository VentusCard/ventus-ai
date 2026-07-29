export type ModuleKey = "Analytics" | "AI & UX" | "Rewards" | "Relationship";

export const ALL_MODULES: ModuleKey[] = ["Analytics", "AI & UX", "Rewards", "Relationship"];

export const MODULE_ROW_MAP: Record<string, ModuleKey> = {
  profiling: "AI & UX",
  predictive: "Rewards",
  phase: "Relationship",
};

export const MODULE_NAV_GROUP_MAP: Record<ModuleKey, string[]> = {
  Analytics: ["Analytics"],
  "AI & UX": [],
  Rewards: ["Deals & Rewards"],
  Relationship: ["WEALTH & RELATIONSHIP"],
};

// Health nav group follows Analytics (always on)
