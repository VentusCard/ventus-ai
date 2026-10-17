/** Only the active complete-story beat starts the insight entrance; headings remain stationary. */
export function shouldRevealStoryRows(active: boolean, revealStep?: number): boolean {
  return active && revealStep === 1;
}

/** The opening beat retains the row geometry but exposes no insights. */
export function isStoryInsightsHidden(revealStep?: number): boolean {
  return revealStep === 0;
}

/** Let the deck's smooth section handoff settle before the row cascade begins. */
export const STORY_ENTRANCE_DELAY_MS = 600;

/** Outside clauses reveal with internal insights on the complete-story beat. */
export function isOutsideClauseHidden(source: string, revealStep?: number): boolean {
  return source === "external" && revealStep === 0;
}