export type ModuleKey = "Analytics" | "AI & UX" | "Rewards" | "Relationship";

export const ALL_MODULES: ModuleKey[] = ["Analytics", "AI & UX", "Rewards", "Relationship"];

export const MODULE_ROW_MAP: Record<string, ModuleKey> = {
  profiling: "AI & UX",
  predictive: "Rewards",
  phase: "Relationship",
};

export const MODULE_NAV_GROUP_MAP: Record<ModuleKey, string[]> = {
  Analytics: ["Customer Intelligence"],
  "AI & UX": [],

  Rewards: ["Personalization Orchestration"],
  Relationship: ["Personalization Orchestration"],
};

// Customer Intelligence / Personalization Orchestration follow Analytics (always on)

