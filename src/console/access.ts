import type { ConsoleAccessProfile } from "@/console/state";

export type ConsoleDestination =
  | "today"
  | "moments"
  | "plays"
  | "results"
  | "governance"
  | "connections";

export const DESTINATION_ROLES: Record<ConsoleDestination, ConsoleAccessProfile["role"][]> = {
  today: ["bank_operator", "growth_play_owner", "risk_reviewer", "institution_admin", "executive_viewer", "ventus_platform_admin"],
  moments: ["bank_operator", "growth_play_owner", "risk_reviewer"],
  plays: ["growth_play_owner", "risk_reviewer", "institution_admin", "executive_viewer", "ventus_platform_admin"],
  results: ["bank_operator", "growth_play_owner", "risk_reviewer", "executive_viewer", "ventus_platform_admin"],
  governance: ["risk_reviewer", "institution_admin", "ventus_platform_admin"],
  connections: ["institution_admin", "ventus_platform_admin"],
};

export const DESTINATION_PATHS: Record<ConsoleDestination, string> = {
  today: "/app/today",
  moments: "/app/moments",
  plays: "/app/plays",
  results: "/app/results",
  governance: "/app/governance",
  connections: "/app/connections",
};

export function canAccessDestination(access: ConsoleAccessProfile | null, destination: ConsoleDestination): boolean {
  return Boolean(access && DESTINATION_ROLES[destination].includes(access.role));
}

export function defaultPathForAccess(access: ConsoleAccessProfile): string {
  if (access.role === "risk_reviewer" || access.role === "ventus_platform_admin") return DESTINATION_PATHS.governance;
  if (access.role === "institution_admin") return DESTINATION_PATHS.connections;
  if (access.role === "executive_viewer") return DESTINATION_PATHS.results;
  return DESTINATION_PATHS.today;
}

export function destinationForPath(pathname: string): ConsoleDestination | null {
  const entry = Object.entries(DESTINATION_PATHS).find(([, path]) => pathname === path);
  return entry ? entry[0] as ConsoleDestination : null;
}
