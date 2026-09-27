# Add an exit button to the deck header

Add a button in the deck's top-right header (next to "INTERACTIVE PRESENTATION") that exits back to the password page.

## Changes (src/components/deckmo/DeckmoDeck.tsx)

- In the header's right cluster, add a small outline button styled like the existing deck chrome (border-deck-rule, text-deck-navy, hover:bg-deck-surface) labeled "Exit", with an appropriate icon (e.g. LogOut from lucide-react) matching the size of the "TABLE OF CONTENT" button text.
- On click: remove the `demo_password_access` sessionStorage key and reload the page, which lands the user back on the password page. This logs out of all gated demo pages (deck, bankdemo), matching how the gate's session works.

No changes to the password gate, other slides, or deck navigation.

## Verification

- `bunx tsgo --noEmit` and check the build log.
- Playwright: open /deckmo, pass the gate, click the Exit button in the header, confirm the password page renders; re-enter the password and confirm the deck still loads.
