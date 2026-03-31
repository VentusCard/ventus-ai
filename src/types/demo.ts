export type ModuleKey = "Analytics" | "Rewards" | "Relationship";

export const ALL_MODULES: ModuleKey[] = ["Analytics", "Rewards", "Relationship"];

export const MODULE_ROW_MAP: Record<string, ModuleKey> = {
  profiling: "Analytics",
  predictive: "Rewards",
  phase: "Relationship",
};

export const MODULE_NAV_GROUP_MAP: Record<ModuleKey, string[]> = {
  Analytics: ["Analytics"],
  Rewards: ["Rewards"],
  Relationship: ["Relationship"],
};

// Health nav group follows Analytics (always on)
