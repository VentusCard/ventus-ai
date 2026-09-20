# Interactive Ricky Signal Explorer

## Goal
Redesign the “One Customer, Five Signal Families” slide as two side-by-side sections:

- **Left:** a dense transaction ledger, styled like the transaction evidence in `/demo`.
- **Right:** Ricky’s customer-intelligence signal pills, styled like `/bankdemo`.

## Interaction
- Keep all signal families and labels visible on the right.
- Make each signal pill selectable.
- Selecting a pill updates the left section to show only the transactions supporting that signal.
- Give the selected pill a clear active state and smoothly transition the evidence list.
- Start with a useful signal selected so supporting transactions are visible immediately.
- Preserve slide keyboard navigation while ensuring clicks on pills do not advance the deck.

## Content and presentation
- Expand Ricky’s static fixture with a curated evidence set for every signal, including merchant or rail, transaction description, amount/date where appropriate, and a short relevance line.
- Keep the content static and network-free for reliable presenting.
- Preserve the existing slide title, Ricky context, five-family color system, strict light theme, deck header/footer, and desktop-only behavior.
- Fit both sections within the shared 1560px presentation canvas without clipping or nested scrolling at supported desktop sizes.

## Validation
- Verify every pill displays the correct supporting transactions.
- Check first render, repeated selections, deck navigation, and re-entry to the slide.
- Audit at 1024×768, 1540×855, and 1920×1080 for spillover, cutoff, and accidental page scrolling.
- Confirm the preview builds cleanly and remains network-free.
