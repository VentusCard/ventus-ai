import { describe, expect, test } from "bun:test";
import { DECKMO, DECKMO_STEPS, RICKY_SIGNAL_STORY } from "../src/lib/deckmoScript";
import { shouldRevealStoryRows } from "../src/lib/deckmoStoryReveal";

describe("story entrance lifecycle", () => {
  test("inactive sections never start the internal reveal", () => {
    expect(shouldRevealStoryRows(false, 0)).toBe(false);
    expect(shouldRevealStoryRows(false, 1)).toBe(false);
  });
  test("entering and returning to 4.1 re-enables the entrance, not 4.2", () => {
    expect([[false, 0], [true, 0], [true, 1], [true, 0], [false, 0], [true, 0]].map(([active, step]) => shouldRevealStoryRows(Boolean(active), Number(step)))).toEqual([false, true, false, true, false, true]);
  });
  test("fully shown standalone stories do not start a deck reveal", () => {
    expect(shouldRevealStoryRows(true)).toBe(false);
  });
});

describe("combined Ricky signal story", () => {
  test("section two has two beats; the story is section four after The Complete Picture", () => {
    expect(DECKMO_STEPS.filter((beat) => beat.section === 1).map((beat) => beat.step)).toEqual([0, 1]);
    expect(DECKMO.beats[3].id).toBe("ricky-story");
    expect(DECKMO_STEPS.findIndex((b) => b.id === "ricky-story-0")).toBe(DECKMO_STEPS.findIndex((b) => b.id === "living-view-2") + 1);
  });
  test("all 14 existing signals appear exactly once", () => {
    expect(RICKY_SIGNAL_STORY).toHaveLength(14);
    expect(new Set(RICKY_SIGNAL_STORY.map((clause) => clause.label)).size).toBe(14);
    expect(RICKY_SIGNAL_STORY.map((clause) => clause.label).sort()).toEqual(DECKMO.ricky.signals.map((signal) => signal.label).sort());
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