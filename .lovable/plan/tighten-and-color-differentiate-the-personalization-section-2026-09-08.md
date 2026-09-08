# Tighten and Color-Differentiate the Personalization Section

## Goal
Make the new Personalization section visually distinct from the adjacent Intelligence and Governance sections, and reduce its overall height by tightening whitespace.

## Proposed Changes

### 1. Add per-card accent colors
Update `src/components/PersonalizationSection.tsx` so each of the four cards has its own color family instead of the current all-blue treatment:
- **Personalized deals** — amber accent
- **Personalized emails** — blue accent
- **Personalized cards in digital banking** — emerald accent
- **Personalized outreach powered by AI coworkers** — violet accent

Each card will use its accent for:
- A subtle colored top border line.
- The icon chip background/border and icon color.
- The hover border tint.

### 2. Tighten vertical spacing
Reduce section height without removing content:
- Section padding: from `py-24 md:py-28` to `py-16 md:py-20`.
- Headline block bottom margin: from `mb-14` to `mb-8`.
- Subheadline top margin: from `mt-6` to `mt-4`.
- Card padding: from `p-6` to `p-5`.
- Icon chip bottom margin: from `mb-5` to `mb-4`.
- Card grid gap: from `gap-5` to `gap-4`.
- Body line height: from `leading-relaxed` to `leading-snug`.

### 3. Keep the layout and copy unchanged
- Four-card responsive grid stays the same.
- Headline, subheadline, and card body text remain identical.
- No new interactivity or animation.

## Outcome
A shorter, more colorful Personalization section that stands apart from the dark Intelligence and Governance neighbors while remaining simple and readable.
