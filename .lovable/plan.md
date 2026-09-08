# Redesign Intelligence Section Animation

## Goal
Refactor the homepage Intelligence section scroll animation so it tells a story of deep, evolving customer understanding instead of ending with an advisor handoff.

## Current State
`src/components/IntelligenceSection.tsx` is a 340vh pinned scroll section with:
- A dark "Context plane" containing 4 cards.
- 3 bottom stage captions: Understand / Decide / Activate.
- Card sequence: Sources → Relationship view → Next action → Advisor queue.

## Proposed Changes

### 1. Rename and re-purpose the four cards
Keep the first card and rewrite the other three so the sequence becomes:

1. **Sources** (unchanged)
   - Transactions, Relationships, Digital, Teams.
2. **Real agnostic behavior enrichment**
   - Replace "Relationship view" label and content.
   - Show enriched behavioral signals: category progress bars or signal-family chips (Behavioral, Life Event, Financial, Demographic, Risk) derived from the bank's own data.
3. **External Intelligence**
   - Replace "Next action" label and content.
   - Show external signal examples: bureau tradelines, property records, auto data, demographics, life events — the same buckets used in `/bankdemo`.
4. **Holistic understanding of each customer**
   - Replace "Advisor queue" label and content.
   - Display 5 pills: **Behavioral · Life Events · Demographics · Financial · Risk**.
   - Add a short synthesized insight line such as "Every signal converges into one view of the customer."

### 2. Update the stage captions to match the four beats
Change the bottom progress captions from 3 to 4 stages aligned with the cards:

1. **Collect** — "Organize approved context into one view of the relationship."
2. **Enrich** — "Turn raw data into real, agnostic behavioral signals."
3. **Complement** — "Layer in external intelligence to fill the gaps."
4. **Synthesize** — "Build a holistic understanding of each customer."

### 3. Update scroll-driven state
- Change `STAGES` array length from 3 to 4.
- Update progress math so scroll progress advances through 4 beats and releases into Governance only after the sequence completes.
- Update top Context Plane stage buttons from 3 to 4.
- Update bottom progress bars from 3 to 4 segments.

### 4. Preserve existing behavior
- Keep the pinned `h-[340vh]` scroll track and sticky viewport.
- Keep click-to-jump on stage captions and top buttons.
- Keep the dark context plane, dot-grid background, and radial blue glow.
- Keep responsive behavior and nav offset.

### 5. Verification
- Run `bunx tsgo --noEmit` to confirm TypeScript is clean.
- Check the build log at `/tmp/observability/build-errors.log`.
- Use Playwright to scroll through the section and verify the four beats light up in order and the final card shows the five pills.

## Out of Scope
- No changes to Governance, Integration, or other homepage sections.
- No backend or data-fetching changes; use static illustrative content only.
