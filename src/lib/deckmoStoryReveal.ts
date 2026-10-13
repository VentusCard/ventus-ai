/** Only the active internal beat starts the story entrance; external reveal stays independent. */
export function shouldRevealStoryRows(active: boolean, revealStep?: number): boolean {
  return active && revealStep === 0;
}

/** Let the deck's smooth section handoff settle before the row cascade begins. */
export const STORY_ENTRANCE_DELAY_MS = 600;