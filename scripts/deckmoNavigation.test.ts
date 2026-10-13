import { describe, expect, test } from "bun:test";
import { deckmoNavigationDelta } from "../src/lib/deckmoNavigation";

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