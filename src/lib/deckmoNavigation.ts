/** Deck navigation ignores typing fields and modified keyboard shortcuts. */
export function deckmoNavigationDelta(
  key: string,
  editing = false,
  modified = false,
): -1 | 0 | 1 {
  if (editing || modified) return 0;
  if (key === "ArrowRight" || key.toLowerCase() === "d") return 1;
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return -1;
  return 0;
}