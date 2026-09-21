# Redesign Ricky as one unified profile workspace

## Goal
Make Ricky’s identity and living-profile summary the shared header for both the transaction ledger and signal-family sections.

## Selected direction
- Institutional navy palette: white and cool-gray surfaces with navy, blue, and amber emphasis.
- Space Grotesk for presentation headings and DM Sans for interface copy.
- Unified full-width masthead above two side-by-side evidence sections.
- Follow the selected “Unified Profile Dashboard” composition while retaining the deck’s restrained, square-edged presentation language.

## Changes
- Keep the existing slide eyebrow, “Meet Ricky” title, and subtitle at the top.
- Move Ricky’s icon, “Ricky’s living profile,” and existing profile summary out of the right section into a full-width masthead inside the shared content frame.
- Use a clear vertical divider within the masthead to separate Ricky’s identity from the profile summary, making the masthead visibly govern both sections below.
- Place two sibling sections directly beneath it:
  - Left: Supporting Transactions, with the current selectable-state heading, count/reset control, dense ledger, and external-evidence replacement state.
  - Right: Synthesized Customer Signals, with all five families and eight full-color pills.
- Rebalance the remaining height so the masthead stays compact and the ledger retains useful row density at supported presentation sizes.
- Preserve click-to-filter, click-again-to-reset, external evidence behavior, staged signal reveal, and deck-navigation isolation.

## Technical details
- Update the Ricky scene and its local presentation styling only.
- Use semantic deck/theme tokens for the selected palette and typography; do not add dark-mode styling.
- Keep the existing 1560px canvas, persistent deck header/footer, static fixtures, and network-free behavior.
- Do not add prototype-only avatars, IDs, status badges, scores, metrics, or invented profile copy.

## Validation
- Confirm Ricky’s masthead spans and aligns with both lower sections.
- Confirm all 76 transactions remain accessible and every internal pill filters correctly.
- Confirm both external pills show the existing external evidence panel.
- Confirm pill clicks do not advance the deck and re-clicking resets the ledger.
- Check 1024×768, 1540×855, and 1920×1080 for clipping, text spill, overlap, and usable ledger height.
- Confirm a clean build with no new network requests.
