# Add Partners section to homepage

## Goal
Add a new Partners section showcasing Finovate, Fintech Sandbox, OneValley, and Plug and Play on the homepage.

## Placement
Insert the Partners section just above the CTA section on the homepage.

## New order in `src/pages/Index.tsx`
1. ScrollDrivenHero
2. ProblemStatementSection
3. IntelligenceSection
4. PersonalizationSection
5. IntegrationSection
6. GovernanceSection
7. PartnersSection (new)
8. CTA

## Implementation
- Create `src/components/PartnersSection.tsx`.
- Render a light-themed section with a small eyebrow label (e.g., "Partners & accelerators"), a concise headline, and a row of four partner wordmarks.
- Use simple text/wordmark styling for Finovate, Fintech Sandbox, OneValley, and Plug and Play to avoid copyright concerns with official logos.
- Keep styling consistent with the strict light theme: white background, slate-200 borders, Manrope typography.
- Import and insert `<PartnersSection />` in `src/pages/Index.tsx` between `<GovernanceSection />` and `<CTA />`.

## Verification
- Run typecheck/build after the edit.
- Confirm the Partners section renders on the homepage with all four names visible.
