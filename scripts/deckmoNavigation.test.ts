import { describe, expect, test } from "bun:test";
import { deckmoNavigationDelta } from "../src/lib/deckmoNavigation";
import { DECKMO, DECKMO_STEPS, DECKMO_BENEFITS, deckmoBeatStartIndex, RICKY_DEFAULT_DETAIL_SIGNAL } from "../src/lib/deckmoScript";
import { RICKY_SIGNAL_LABELS } from "../src/lib/deckmoRickyTransactions";

describe("deckmo navigation keys", () => {
  test("right arrow and D advance one beat", () => {
    for (const key of ["ArrowRight", "d", "D"]) expect(deckmoNavigationDelta(key)).toBe(1);
  });
  test("left arrow and A go back one beat", () => {
    for (const key of ["ArrowLeft", "a", "A"]) expect(deckmoNavigationDelta(key)).toBe(-1);
  });
  test("other keys do not navigate", () => {
    for (const key of ["ArrowUp", "ArrowDown", "PageDown", "PageUp", "Home", "End", " ", "Enter", "p", "Escape"]) expect(deckmoNavigationDelta(key)).toBe(0);
  });
  test("editing fields never navigate", () => {
    for (const key of ["ArrowRight", "ArrowLeft", "a", "d", "A", "D"]) expect(deckmoNavigationDelta(key, true)).toBe(0);
  });
  test("modified shortcuts never navigate", () => {
    for (const key of ["a", "d", "ArrowLeft", "ArrowRight"]) expect(deckmoNavigationDelta(key, false, true)).toBe(0);
  });
});

describe("platform-first benefit navigation", () => {
  test("4.2 advances to the 4.3 signal detail, which leads to section 5 and back", () => {
    const complete = DECKMO_STEPS.findIndex((entry) => entry.id === "ricky-story-1");
    const platform = deckmoBeatStartIndex("bank-tools");
    expect(DECKMO_STEPS[complete + deckmoNavigationDelta("ArrowRight")]?.id).toBe("ricky-story-2");
    expect(complete + 1 + deckmoNavigationDelta("d")).toBe(platform);
    expect(DECKMO_STEPS[platform + deckmoNavigationDelta("a")]?.id).toBe("ricky-story-2");
  });
  test("keyboard default for 4.3 is the home purchase signal", () => {
    expect(RICKY_DEFAULT_DETAIL_SIGNAL).toBe(RICKY_SIGNAL_LABELS.home);
  });
  test("platform is section 5 before the four benefits", () => {
    expect(DECKMO.beats.map((beat) => beat.id)).toEqual([
      "opener", "visibility", "living-view", "ricky-story", "bank-tools",
      "immediate", "mid-term", "long-term", "retention", "close",
    ]);
  });
  test("platform has exactly one overview stop", () => {
    expect(DECKMO_STEPS.filter((entry) => DECKMO.beats[entry.section].id === "bank-tools")).toHaveLength(1);
  });
  for (const [id, section, steps] of [
    ["immediate", 5, 5], ["mid-term", 6, 5], ["long-term", 7, 3], ["retention", 8, 4],
  ] as const) {
    test(`${id} button opens the first slide of its benefit section`, () => {
      expect(DECKMO_BENEFITS.some((benefit) => benefit.id === id)).toBe(true);
      const destination = DECKMO_STEPS[deckmoBeatStartIndex(id)];
      expect(destination?.section).toBe(section);
      expect(destination?.step).toBe(0);
      expect(DECKMO.beats[section].steps).toBe(steps);
    });
  }
});