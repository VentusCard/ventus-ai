import { describe, expect, test } from "bun:test";
import { DECKMO, RICKY_SIGNAL_DETAILS } from "../src/lib/deckmoScript";
import { RICKY_SIGNAL_LABELS } from "../src/lib/deckmoRickyTransactions";
import { timelineMonthDelay, timelineRevealState } from "../src/lib/deckmoTimelineReveal";

const timeline = DECKMO.ricky.timeline;
describe("Section 4 timeline rules", () => {
  test("ten chronological months from Dec 2025 through Sep 2026 contain 15 markers", () => {
    expect(timeline.months).toEqual(["Dec 2025", "Jan 2026", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]);
    expect(timeline.events).toHaveLength(15);
    expect(timeline.events.map(event => event.month)).toEqual([0,2,3,3,4,5,5,6,6,7,7,8,9,9,9]);
  });
  test("every marker and activation resolves to existing full signal details", () => {
    for (const event of timeline.events) {
      expect(DECKMO.ricky.signals.some(signal => signal.label === event.label)).toBe(true);
      expect(RICKY_SIGNAL_DETAILS[event.label]).toBeDefined();
    }
  });
  test("no destination gets more than one activation in a month", () => {
    const cells = timeline.events.flatMap(event => event.activations.map(activation => `${event.month}:${activation.lane}`));
    expect(cells).toHaveLength(17);
    expect(new Set(cells).size).toBe(cells.length);
  });
  test("betting is routed exclusively to bank teams, never a customer channel", () => {
    const betting = timeline.events.filter(event => event.label === RICKY_SIGNAL_LABELS.betting);
    expect(betting).toHaveLength(1);
    expect(betting[0].month).toBe(9);
    expect(betting[0].activations).toEqual([{ lane: "internal", label: "Policy guardrail: excluded from customer offers" }]);
    expect(timeline.events.filter(event => event.label !== RICKY_SIGNAL_LABELS.betting).flatMap(event => event.activations).some(activation => activation.lane === "internal")).toBe(false);
  });
  test("outside pet evidence supports personalization only", () => {
    const external = timeline.events.filter(event => DECKMO.ricky.signals.find(signal => signal.label === event.label)?.source === "external");
    expect(external).toHaveLength(1);
    expect(external[0].activations).toEqual([{ lane: "rewards", label: "Pet care perks" }]);
    expect(external.flatMap(event => event.activations).some(activation => /eligib|approv|pre.qual/i.test(activation.label))).toBe(false);
  });
  test("learned Hawaii pattern waits until September before any activation", () => {
    const hawaii = timeline.events.filter(event => event.label === RICKY_SIGNAL_LABELS.hawaii);
    expect(hawaii.map(event => event.month)).toEqual([0,9]);
    expect(hawaii[0].activations).toEqual([]);
    expect("learned" in hawaii[0] && hawaii[0].learned).toBe(true);
    expect(hawaii[1].activations.map(activation => activation.lane)).toEqual(["rewards", "digital"]);
  });
  test("home journey spans February, April, August and September", () => {
    expect(timeline.events.filter(event => event.label === RICKY_SIGNAL_LABELS.home).map(event => event.month)).toEqual([2,4,8,9]);
  });
  test("baby's one offer is placed in both digital and email in March", () => {
    const baby = timeline.events.find(event => event.label === RICKY_SIGNAL_LABELS.baby);
    expect(baby?.month).toBe(3);
    expect(baby?.activations).toEqual([{ lane: "digital", label: "529 College Savings" },{ lane: "email", label: "529 College Savings" }]);
  });
  test("opening beat animates markers but has no activation reveal", () => {
    expect(timelineRevealState(true,0)).toEqual({ animateMarkers: true, showActivations: false });
    expect(timelineRevealState(true,1)).toEqual({ animateMarkers: false, showActivations: true });
    expect(timelineRevealState(false,0)).toEqual({ animateMarkers: false, showActivations: false });
    expect(timelineRevealState(false,1)).toEqual({ animateMarkers: false, showActivations: false });
    expect(timelineRevealState(true,2)).toEqual({ animateMarkers: false, showActivations: false });
  });
  test("chronological cascade schedules each next month later", () => {
    expect(timeline.months.map((_, month) => timelineMonthDelay(month))).toEqual([300,480,660,840,1020,1200,1380,1560,1740,1920]);
  });
});