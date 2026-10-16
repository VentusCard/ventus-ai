import { describe, expect, test } from "bun:test";
import { DECKMO, DECKMO_STEPS, RICKY_SIGNAL_STORY, RICKY_KYC_SIGNAL_LABEL, RICKY_SIGNAL_DETAILS } from "../src/lib/deckmoScript";
import { RICKY_SIGNAL_LABELS, RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";
import { isOutsideClauseHidden, isStoryInsightsHidden, shouldRevealStoryRows } from "../src/lib/deckmoStoryReveal";

describe("story entrance lifecycle", () => {
  test("inactive sections never start the internal reveal", () => {
    expect(shouldRevealStoryRows(false, 0)).toBe(false);
    expect(shouldRevealStoryRows(false, 1)).toBe(false);
    expect(shouldRevealStoryRows(false, 2)).toBe(false);
  });
  test("entering and returning to 4.2 re-enables insights, not headings or externals", () => {
    expect([[false, 1], [true, 0], [true, 1], [true, 2], [true, 1], [false, 1], [true, 1]].map(([active, step]) => shouldRevealStoryRows(Boolean(active), Number(step)))).toEqual([false, false, true, false, true, false, true]);
  });
  test("fully shown standalone stories do not start a deck reveal", () => {
    expect(shouldRevealStoryRows(true)).toBe(false);
  });
});

describe("outside clause gating", () => {
  test("the new opening withholds every insight; later beats and standalone stories do not", () => {
    expect(isStoryInsightsHidden(0)).toBe(true);
    expect(isStoryInsightsHidden(1)).toBe(false);
    expect(isStoryInsightsHidden(2)).toBe(false);
    expect(isStoryInsightsHidden(undefined)).toBe(false);
  });
  test("outside clauses are withheld until the third beat", () => {
    expect(isOutsideClauseHidden("external", 0)).toBe(true);
    expect(isOutsideClauseHidden("external", 1)).toBe(true);
    expect(isOutsideClauseHidden("external", 2)).toBe(false);
    expect(isOutsideClauseHidden("external", undefined)).toBe(false);
    expect(isOutsideClauseHidden("internal", 0)).toBe(false);
    expect(isOutsideClauseHidden("internal", 1)).toBe(false);
  });
});

describe("combined Ricky signal story", () => {
  test("section two has two beats; the story is section four after The Complete Picture", () => {
    expect(DECKMO_STEPS.filter((beat) => beat.section === 1).map((beat) => beat.step)).toEqual([0, 1]);
    expect(DECKMO.beats[3].id).toBe("ricky-story");
    expect(DECKMO_STEPS.filter((beat) => beat.section === 3).map((beat) => beat.step)).toEqual([0, 1, 2]);
    expect(DECKMO_STEPS.findIndex((b) => b.id === "ricky-story-0")).toBe(DECKMO_STEPS.findIndex((b) => b.id === "living-view-2") + 1);
  });
  test("all 16 signals appear exactly once", () => {
    expect(RICKY_SIGNAL_STORY).toHaveLength(16);
    expect(new Set(RICKY_SIGNAL_STORY.map((clause) => clause.label)).size).toBe(16);
    expect(RICKY_SIGNAL_STORY.map((clause) => clause.label).sort()).toEqual(DECKMO.ricky.signals.map((signal) => signal.label).sort());
  });
  test("KYC leads Demographics as profile information without transaction evidence", () => {
    expect(DECKMO.ricky.signals[0]).toEqual({ family: "Demographics", label: "KYC", tone: "violet", source: "internal" });
    expect(RICKY_SIGNAL_DETAILS[RICKY_KYC_SIGNAL_LABEL].evidenceKind).toBe("customer-profile");
    expect(RICKY_TRANSACTIONS.filter((row) => row.signals.some((label) => label === RICKY_KYC_SIGNAL_LABEL))).toHaveLength(0);
  });
  test("payroll leads Financial and retains observed deposits", () => {
    expect(DECKMO.ricky.signals.find((signal) => signal.family === "Financial")?.label).toBe(RICKY_SIGNAL_LABELS.income);
    const payroll = RICKY_TRANSACTIONS.filter((row) => row.signals.some((label) => label === RICKY_SIGNAL_LABELS.income));
    expect(payroll).toHaveLength(18);
    expect(payroll.find((row) => row.id === "hp09b")?.amount).toBe("$12,368.40");
  });
  test("five families remain in order with external signals last in their family", () => {
    const signals = RICKY_SIGNAL_STORY.map((clause) => DECKMO.ricky.signals.find((signal) => signal.label === clause.label));
    expect([...new Set(signals.map((signal) => signal?.family))]).toEqual(["Demographics", "Financial", "Behavioral", "Life Events", "Risk"]);
    expect(signals.filter((signal) => signal?.source === "external")).toHaveLength(3);
    for (const family of ["Behavioral", "Financial", "Demographics"]) {
      const group = signals.filter((signal) => signal?.family === family);
      expect(group.at(-1)?.source).toBe("external");
      expect(group.slice(0, -1).every((signal) => signal?.source === "internal")).toBe(true);
    }
  });
});
