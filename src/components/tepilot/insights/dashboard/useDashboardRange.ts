import { useMemo, useState } from "react";

export type RangePreset =
  | "7d"
  | "30d"
  | "90d"
  | "qtd"
  | "ytd"
  | "custom";

export type CompareMode = "none" | "previous_period" | "previous_year";

export interface DashboardRange {
  preset: RangePreset;
  start: Date;
  end: Date;
  compare: CompareMode;
  label: string;
  compareLabel: string;
  /** Deterministic seed derived from range length + preset so deltas feel reactive. */
  seed: number;
}

export const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "qtd", label: "Quarter to date" },
  { value: "ytd", label: "Year to date" },
  { value: "custom", label: "Custom range" },
];

export const COMPARE_OPTIONS: { value: CompareMode; label: string }[] = [
  { value: "none", label: "No comparison" },
  { value: "previous_period", label: "Previous period" },
  { value: "previous_year", label: "Previous year" },
];

function resolvePreset(preset: RangePreset, custom?: { start: Date; end: Date }) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  switch (preset) {
    case "7d":
      start.setDate(end.getDate() - 6);
      break;
    case "30d":
      start.setDate(end.getDate() - 29);
      break;
    case "90d":
      start.setDate(end.getDate() - 89);
      break;
    case "qtd": {
      const q = Math.floor(end.getMonth() / 3) * 3;
      start.setMonth(q, 1);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "ytd":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (custom) {
        return { start: custom.start, end: custom.end };
      }
      start.setDate(end.getDate() - 29);
      break;
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function useDashboardRange(defaultPreset: RangePreset = "30d") {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset);
  const [custom, setCustom] = useState<{ start: Date; end: Date } | undefined>();
  const [compare, setCompare] = useState<CompareMode>("previous_period");

  const range: DashboardRange = useMemo(() => {
    const { start, end } = resolvePreset(preset, custom);
    const days = Math.max(1, Math.round((+end - +start) / 86_400_000) + 1);
    const seed = days * 31 + preset.charCodeAt(0);
    const presetLabel = RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? "Custom";
    const label = preset === "custom" ? `${fmt(start)} – ${fmt(end)}` : presetLabel;
    const compareLabel = COMPARE_OPTIONS.find((o) => o.value === compare)?.label ?? "";
    return { preset, start, end, compare, label, compareLabel, seed };
  }, [preset, custom, compare]);

  return {
    range,
    preset,
    setPreset,
    custom,
    setCustom,
    compare,
    setCompare,
  };
}

/** Deterministic 0..1 from a seed and index. Mulberry32-ish. */
export function seededRand(seed: number, i: number) {
  let t = (seed + i * 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) % 100000) / 100000;
}

/**
 * Return a plausible delta % vs comparison, deterministic per (seed, key).
 * Range: roughly -8% .. +14%. Returns null when comparison is off.
 */
export function deltaFor(range: DashboardRange, key: string): number | null {
  if (range.compare === "none") return null;
  const k = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = seededRand(range.seed, k);
  const swing = range.compare === "previous_year" ? 22 : 14;
  return Math.round((r * (swing + 8) - 8) * 10) / 10;
}

/** Deterministic daily series across the range, scaled to `total`. */
export function dailySeries(range: DashboardRange, total: number, key: string) {
  const days = Math.max(1, Math.round((+range.end - +range.start) / 86_400_000) + 1);
  const k = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const raw: number[] = [];
  let sum = 0;
  for (let i = 0; i < days; i++) {
    const wobble = 0.55 + seededRand(range.seed + k, i) * 0.9;
    raw.push(wobble);
    sum += wobble;
  }
  const scale = total / sum;
  return raw.map((v, i) => {
    const d = new Date(range.start);
    d.setDate(range.start.getDate() + i);
    return { date: d, value: v * scale };
  });
}
