# Replace Personalization Cards with Image-Referenced Three-Card Layout

## Goal
Replace the four current text-only cards in `PersonalizationSection.tsx` with the three cards shown in the uploaded screenshot, copying their headings, subheadings, body copy, and mockup content exactly. Adapt the visual treatment to the section's existing dark background (`#08111F`) rather than the light/blue style in the reference image.

## Current state
- `src/components/PersonalizationSection.tsx` renders a dark section (`bg-[#08111F]`) with a "Personalization" label, "Personalize every customer touchpoint." heading, and four icon cards in a 4-column grid.
- The section is only used on the homepage (`src/pages/Index.tsx`).

## Proposed changes

### 1. Content update in `PersonalizationSection.tsx`
Replace the `CARDS` array and grid with three cards matching the screenshot:

- **Card 1 — NEXT OFFER**
  - Heading: "Serve the right offer before they go looking."
  - Body: "Ventus detects purchase intent from spending patterns — giving your team the signal to serve the right offer at exactly the right moment."
  - Mockup: travel/rewards-style card with items like "Delta SkyMiles Card", "Whole Foods 5% Back", "REI Co-op Card" and category tags.
  - CTA: "Learn more"

- **Card 2 — NEXT PRODUCT**
  - Heading: "Know what your customer needs before they ask."
  - Body: "Life event detection gives your team the intelligence to surface the right product at exactly the right moment in your customer's journey."
  - Mockup: life-event card showing "New Parent 95%" with transactions (Buy Buy Baby, Pottery Barn Kids, Carter's) and recommended product tags (529 Savings, Life Insurance, Family Card).
  - CTA: "Learn more"

- **Card 3 — NEXT CONVERSATION**
  - Heading: "Turn every life event into the right conversation."
  - Body: "Ventus detects life events in transaction data and delivers structured intelligence to your CRM — who to call, why it matters, and what to say."
  - Mockup: advisor-style card with "College-Bound — 91%" signal and bullet points, plus a "Schedule consultation →" button.
  - CTA: "Learn more"

### 2. Visual adaptation
- Keep the existing section background (`bg-[#08111F]`) and light text.
- Render each new card as a bordered, rounded container on the dark background (matching current card styling: `border-white/10`, `bg-white/[0.03]`, white text).
- Replace the light-blue labels from the screenshot with the current `text-blue-400` accent or white text so the cards feel native to the dark section.
- Build the three mockups as static HTML/CSS compositions inside each card, using the current dark-card aesthetic rather than the screenshot's light-browser chrome.
- Keep the top label "Personalization", heading "Personalize every customer touchpoint.", and supporting sentence unchanged.
- Change the grid from 4 columns to 3 columns (`lg:grid-cols-3`).

### 3. Files to change
- `src/components/PersonalizationSection.tsx`

## Out of scope
- No routing changes; "Learn more" buttons will remain static or link to existing pages if already wired.
- No new dependencies.
- No animation beyond existing hover transitions.
