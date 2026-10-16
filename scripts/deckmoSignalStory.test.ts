import { describe, expect, test } from "bun:test";
import { DECKMO, DECKMO_STEPS, RICKY_SIGNAL_STORY, RICKY_KYC_SIGNAL_LABEL, RICKY_SIGNAL_DETAILS, RICKY_LUXURY_AUTO_LABEL, RICKY_TOTAL_ASSETS_LABEL, RICKY_ESTIMATED_TOTAL_ASSETS_CENTS, RICKY_GENERAL_SPENDING_LABEL } from "../src/lib/deckmoScript";
import { RICKY_SIGNAL_LABELS, RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";
import { isOutsideClauseHidden, isStoryInsightsHidden, shouldRevealStoryRows } from "../src/lib/deckmoStoryReveal";

test("4.3 detail table column widths sum to the table's fixed min-width", async () => {
  const source = await Bun.file("src/components/deckmo/RickySignalStory.tsx").text();
  const min = Number(/min-w-\[(\d+)px\] table-fixed/.exec(source)?.[1]);
  expect(min).toBeGreaterThan(0);
  const colgroup = /<colgroup>([\s\S]*?)<\/colgroup>/.exec(source)?.[1] ?? "";
  const widths = [...colgroup.matchAll(/w-\[(\d+)px\]/g)].map((m) => Number(m[1]));
  expect(widths).toHaveLength(8);
  expect(widths.reduce((a, b) => a + b, 0)).toBe(min);
});

describe("story entrance lifecycle", () => {
  test("inactive sections never start the internal reveal", () => {
    expect(shouldRevealStoryRows(false, 0)).toBe(false);
    expect(shouldRevealStoryRows(false, 1)).toBe(false);
    expect(shouldRevealStoryRows(false, 2)).toBe(false);
  });
  test("entering and returning to 4.2 re-enables the complete insight entrance", () => {
    expect([[false, 1], [true, 0], [true, 1], [true, 0], [true, 1], [false, 1], [true, 1]].map(([active, step]) => shouldRevealStoryRows(Boolean(active), Number(step)))).toEqual([false, false, true, false, true, false, true]);
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
  test("outside clauses reveal with internal insights on 4.2", () => {
    expect(isOutsideClauseHidden("external", 0)).toBe(true);
    expect(isOutsideClauseHidden("external", 1)).toBe(false);
    expect(isOutsideClauseHidden("external", 2)).toBe(false);
    expect(isOutsideClauseHidden("external", undefined)).toBe(false);
    expect(isOutsideClauseHidden("internal", 0)).toBe(false);
    expect(isOutsideClauseHidden("internal", 1)).toBe(false);
  });
});

describe("combined Ricky signal story", () => {
  test("section two has two beats; the story is section four with a 4.3 detail beat after The Complete Picture", () => {
    expect(DECKMO_STEPS.filter((beat) => beat.section === 1).map((beat) => beat.step)).toEqual([0, 1]);
    expect(DECKMO.beats[3].id).toBe("ricky-story");
    expect(DECKMO_STEPS.filter((beat) => beat.section === 3).map((beat) => beat.step)).toEqual([0, 1, 2]);
    expect(DECKMO_STEPS.findIndex((b) => b.id === "ricky-story-0")).toBe(DECKMO_STEPS.findIndex((b) => b.id === "living-view-2") + 1);
  });
  test("all 18 signals appear exactly once", () => {
    expect(RICKY_SIGNAL_STORY).toHaveLength(18);
    expect(new Set(RICKY_SIGNAL_STORY.map((clause) => clause.label)).size).toBe(18);
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
    expect(signals.filter((signal) => signal?.source === "external")).toHaveLength(4);
    for (const family of ["Behavioral", "Financial", "Demographics"]) {
      const group = signals.filter((signal) => signal?.family === family);
      const firstExternal = group.findIndex((signal) => signal?.source === "external");
      if (firstExternal < 0) {
        expect(group.every((signal) => signal?.source === "internal")).toBe(true);
      } else {
        expect(group.slice(0, firstExternal).every((signal) => signal?.source === "internal")).toBe(true);
        expect(group.slice(firstExternal).every((signal) => signal?.source === "external")).toBe(true);
      }
    }
  });
  test("general spending leads Behavioral as an internal annualized estimate", () => {
    const behavioral = DECKMO.ricky.signals.filter((signal) => signal.family === "Behavioral");
    expect(behavioral[0]).toEqual({ family: "Behavioral", label: RICKY_GENERAL_SPENDING_LABEL, tone: "blue", source: "internal" });
    const storyLabels = RICKY_SIGNAL_STORY.map((clause) => clause.label);
    expect(storyLabels.indexOf(RICKY_GENERAL_SPENDING_LABEL)).toBeLessThan(storyLabels.indexOf(RICKY_SIGNAL_LABELS.tennis));
    expect(RICKY_SIGNAL_DETAILS[RICKY_GENERAL_SPENDING_LABEL].evidenceKind).toBe("general-spending");
    expect(RICKY_TRANSACTIONS.filter((row) => row.signals.some((label) => label === RICKY_GENERAL_SPENDING_LABEL))).toHaveLength(0);
  });
  test("BMW luxury auto ownership is external Demographics, without ledger evidence", () => {
    const signal = DECKMO.ricky.signals.find((item) => item.label === RICKY_LUXURY_AUTO_LABEL);
    expect(signal?.family).toBe("Demographics");
    expect(signal?.source).toBe("external");
    expect(RICKY_TRANSACTIONS.filter((row) => row.signals.some((label) => label === RICKY_LUXURY_AUTO_LABEL))).toHaveLength(0);
  });
  test("$3.5M total assets remain an external Demographics estimate, not transaction evidence", () => {
    expect(RICKY_ESTIMATED_TOTAL_ASSETS_CENTS).toBe(350000000);
    const signal = DECKMO.ricky.signals.find((item) => item.label === RICKY_TOTAL_ASSETS_LABEL);
    expect(signal?.family).toBe("Demographics");
    expect(signal?.source).toBe("external");
    expect(RICKY_TRANSACTIONS.filter((row) => row.signals.some((label) => label === RICKY_TOTAL_ASSETS_LABEL))).toHaveLength(0);
  });
});
