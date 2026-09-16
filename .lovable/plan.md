# Rebuild `/deckmo` as a presenter-driven bank leadership deck

## Goal
Turn the current free-roam demo into a polished, deterministic conference narrative that a presenter can run in about seven minutes without waiting on live data. Keep the existing `/deckmo` address, strict light theme, Manrope typography, desktop-only access, and one password gate.

## Experience
- Build one vertical, full-viewport, scroll-snapped deck with ten beats: opener, visibility gap, unified customer view, system assembly, Ricky signal reveal, immediate value, mid-term value, long-term value, tools for the bank, and close.
- Use a single ordered step model for every reveal. Right/Down advances, Left/Up goes back, canvas clicks advance, and manual scrolling remains available.
- Add a hidden presenter navigator on `P` with beat names, current position, and one-click jumping. Keep normal controls visually quiet so the stage view remains clean.
- Preserve continuity between the unified-view and system-assembly beats so the central customer-view card visibly becomes the product architecture.

## Content and visual treatment
- Create one typed script/data source containing every headline, label, ledger row, signal, offer, product benefit, count, guardrail, Coworker message, step, and beat definition.
- Keep all bank references generic, remove em dashes, avoid infrastructure and vendor references, and keep customer language behaviorally specific without exact personal spend.
- Render the five signal families with the established blue, amber, violet, emerald, and rose associations while keeping cards predominantly white and slate.
- Show Risk only in Ricky’s internal signal reveal and the bank-tools governance scene. Explicitly exclude it from all customer-facing reward, product, and relationship scenes.
- Keep external intelligence framed only as marketing and personalization context.

## Beat implementation
1. **Opener**: three staged statements with restrained fades and Ventus branding.
2. **What you cannot see**: observed ledger activity versus an intentionally empty outside-the-walls area, followed by staggered invisible life-context rows.
3. **One living customer view**: internal and external source cards converge through animated connectors into one central understanding card.
4. **System assembly**: the central card holds position, morphs into the Ventus module suite, and unfolds the three orchestration rows in four controlled steps.
5. **Ricky**: raw monospaced ledger strings transform in place into six signals across five families.
6. **Immediate**: fixed-frame phone showing transaction recognition, classification, recurring detection, and charge explanation as scroll-driven callouts.
7. **Mid-term**: fixed-frame rewards/product experience showing a top pick, categories, signal provenance, calculated benefits, and channel placement.
8. **Long-term**: fixed-frame relationship experience showing a life event, advisor conversation, and follow-up outreach.
9. **Tools for the bank**: three staged browser frames for Intelligence Database, Automated Flows, and Coworker, including the explicit risk-exclusion guardrail.
10. **Close**: three staged closing statements, bank outcomes, contact action, and exhibit-hall invitation.

## Technical approach
- Replace `DemoPage` orchestration rather than modifying `/demo`, `/bankdemo`, or the reusable production views.
- Add focused deck components for the shared frame, phone/browser shells, presenter overlay, diagrams, callouts, and beat scenes.
- Reuse the strongest existing visual patterns, but feed them local scripted props or create static deck-specific adaptations where current components trigger requests, timers, mutable settings, or unsuitable customer amounts.
- Remove `useDemoEnrichment`, CSV parsing, demo settings, live API paths, the second gate, and the contact modal from `/deckmo`.
- Add a dedicated desktop guard outside the remaining password gate so screens below 1024px consistently show the existing “Desktop Required” treatment.
- Respect reduced-motion preferences and prevent interactive controls inside slides from accidentally advancing the deck.

## Validation
- Verify every beat and internal step with keyboard, click, free scroll, and presenter navigation.
- Test at 1024×768, 1280×800, 1440×900, and 1920×1080 to catch clipping, overlap, and unreadable stage text.
- Confirm refreshing and scrolling produce a coherent state and all fixed phone/browser frames remain fully visible.
- Capture the page network log after initial load and confirm advancing through all beats creates zero requests.
- Assert the Risk signal is present only in beats 4 and 8, all visible strings come from the centralized script, and no forbidden copy or `dark:` utilities appear in the new deck.
- Run focused tests plus the project build, then inspect preview diagnostics and final screenshots before completion.
