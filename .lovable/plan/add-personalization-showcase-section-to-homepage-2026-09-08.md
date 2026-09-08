# Add Personalization Showcase Section to Homepage

## Goal
Insert a new, simple personalization showcase section on the homepage between the Intelligence section and the Governance section. It should highlight four personalization surfaces without heavy detail or animation.

## Proposed Implementation

### 1. New component: `src/components/PersonalizationSection.tsx`
- Dark section background consistent with `GovernanceSection` (`bg-[#08111F]` or similar navy/black).
- Section id: `personalization` so the floating nav can anchor to it later if needed.
- Headline: "Personalization, everywhere it matters" (or user-preferred wording).
- Subheadline: one sentence explaining that the same intelligence powers consistent, context-aware messages across channels.
- Four cards in a responsive grid:
  - **Personalized deals** — relevant offers surfaced at the right moment.
  - **Personalized emails** — messages tailored to behavior and life events.
  - **Personalized cards in digital banking** — in-app and online banking cards that adapt to the customer.
  - **Personalized outreach powered by AI coworkers** — advisor-ready, human-in-the-loop engagement.
- Each card should be simple: icon, title, and a single short description line.
- Use existing visual language: subtle white/blue borders, glassmorphic card surfaces, blue accent text, and the current font family.

### 2. Insert into `src/pages/Index.tsx`
- Place `<PersonalizationSection />` between `<IntelligenceSection />` and `<GovernanceSection />`.

### 3. Keep it lightweight
- No scroll-driven pinning or stage animation.
- No detailed data tables, charts, or heavy interactivity.
- Cards are static and readable.

## Outcome
Homepage order becomes: Hero → The Gap → Intelligence → **Personalization** → Governance → Integration → CTA.
