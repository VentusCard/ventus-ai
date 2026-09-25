# Add Beat 8.4: Life-Aware Banking Assistant Showcase

## Goal
Add a new final beat to Section 8 that fills the presentation screen with four animated phone mockups, showing the breadth of a banking assistant powered by Ventus customer context.

## Beat 8.4 experience
- Extend Section 8 from three beats to four; the new view is numbered **8.4** automatically.
- Preserve Beats 8.1–8.3 exactly, including the once-only Hawaii question and the conversation state when navigating away and back.
- Give 8.4 a concise presentation heading focused on what a banking assistant can do when it understands the customer’s broader life.
- Use four full phone mockups:
  1. **Proactive nudges** — timely, context-aware prompts tied to current behavior and upcoming needs.
  2. **Financial planning** — goals, progress, cash-flow context, and a specific recommended next step.
  3. **Subscription management** — recurring services, price-change awareness, and clear management actions.
  4. **Complete financial picture** — a holistic assistant view connecting travel, business ownership, lifestyle, and financial priorities.
- Keep the examples centered on Ricky and consistent with the signals already established earlier in the deck.

## Visual direction
- Replace the usual single-phone-and-callout composition on 8.4 with a dedicated, screen-filling four-phone showcase.
- Arrange the phones as a balanced presentation wall with readable labels and stable dimensions; avoid scrolling inside the overall beat.
- Use the existing light bank interface, device chrome, typography, and green battery treatment so every phone belongs to the same product system.
- Keep each phone visually distinct through its content, not through mismatched colors or device styles.

## Animation
- Use a **staggered fan-in**: phones enter sequentially from alternating lower-left/lower-right positions with subtle scale and rotation, then settle into an orderly four-phone composition.
- Add restrained internal motion after settling, such as a nudge appearing, a goal indicator progressing, and subscription rows resolving.
- Respect reduced-motion preferences by displaying the completed composition immediately.
- Replay the visual entrance when 8.4 is revisited, while leaving the existing AI conversation state untouched.

## Technical approach
- Increase the retention section’s configured step count to four and add centralized copy/data for the four experiences.
- Add a dedicated Beat 8.4 scene inside the existing retention presentation component rather than changing the shared live phone experience.
- Reuse the current deck phone frame and static fixture patterns, with focused miniature views sized specifically for the four-up layout.
- Keep the beat local and deterministic: no new assistant calls, timers that mutate conversation state, or backend work.

## Validation
- Verify arrow navigation reaches 8.4 and returns correctly to 8.3 and 9.1.
- Confirm the Hawaii prompt remains single-fire and its conversation survives visiting 8.4.
- Check the staggered entrance, internal motion, and reduced-motion fallback.
- Verify all four phones and labels remain readable without clipping at 1540×855 and 1920×1080.
- Confirm the deck build remains clean and all later page/beat numbering stays continuous.
