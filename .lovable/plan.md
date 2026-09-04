# Add Distinct Icons to Key Features Cards

## Goal
Give every row in the three `/bankdemo` personalization Key features cards its own Lucide icon, and improve how the row uses its available vertical space.

## Current state
- `SurfaceFeaturePanel.tsx` renders the same `Check` icon for every feature row.
- All three surfaces (Personalized Deals, Personalized Product, Personalized Relationship) share this component.
- Rows already use `flex-1` to fill the card height, but the content sits top-aligned and the small icon/text scale leaves whitespace that feels unused.

## Proposed change
1. Extend the `FEATURES` data structure so each item can declare an `icon` name (mapped to a Lucide component).
2. Pick a semantically relevant icon for each feature row:
   - **Rewards:** Context-specific curation → `Layers`; Hyper-personalized messaging → `MessageSquareText`; Semantic deal search → `Search`; Timing intelligence → `Clock`; Local Deals and Perks → `MapPin`; Multiple Deal Aggregators → `Combine`; Surface Financial Products → `CreditCard`.
   - **Product:** Signal-triggered recommendations → `Zap`; Offer construction → `Wrench`; Lifestyle theming → `Palette`; Channel-ready delivery → `Smartphone`.
   - **Relationship:** Grounded assistant → `Bot`; Proactive nudges → `Bell`; Banker escalation → `UserPlus`; Protection cues → `Shield`.
3. Render the icon at a slightly larger size (`w-4 h-4`) with a subtle colored background circle or rounded square behind it so each row has a visual anchor.
4. Improve internal spacing: center the icon/text block vertically within the row, increase line-height/padding slightly, and let the detail text breathe so the flex-1 height feels intentional rather than empty.
5. Preserve the existing reveal animation, disabled-state grayscale, and the card's full-height behavior.

## Verification
- Run TypeScript and production build.
- Use Playwright to capture the Key features card on each of the three personalization tabs and confirm each row shows a distinct icon and the content feels evenly distributed.
