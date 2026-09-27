# Restore the original 8.3 chat design across Beat 8.4

## Goal
Return Beat 8.3 to its previous visual treatment, then use that same treatment for all four AI chatbot phones in Beat 8.4.

## Changes
- Restore the original message layout:
  - blue user bubble with a user avatar on the right;
  - light-gray assistant bubble with the assistant avatar on the left;
  - the earlier compact spacing, rounded corners, and readable bold markdown.
- Restore the original composer:
  - one-line pill-shaped input;
  - separate circular send button;
  - no tall multiline input panel or extra footer space.
- Restore the prior compact typing indicator and conversation spacing.
- Apply this shared appearance to the retained Hawaii chat and all three new 8.4 chats while preserving:
  - identical phone frames, status bars, and bottom navigation;
  - each phone’s independent conversation and input;
  - the one-time Hawaii prompt and retained answer;
  - the existing right-to-left phone entrance animation.

## Technical approach
- Keep the installed AI chat foundations, but style their message and input composition to match the exact pre-redesign 8.3 appearance.
- Scope the restoration through the shared customer chat view so 8.3 and every 8.4 phone stay visually identical.
- Do not change prompts, answers, live assistant behavior, deck navigation, or other sections.

## Validation
- Compare 8.3 against the recovered prior design at 1540×855.
- Confirm all four 8.4 phones use the same bubbles, avatars, composer, status bar, and footer.
- Type into each 8.4 chat and confirm conversations remain independent.
- Navigate 8.3 → 8.4 → 8.3 and confirm the Hawaii conversation stays intact and does not fire twice.
- Verify the presentation has no overflow or build errors at 1540×855 and 1920×1080.
