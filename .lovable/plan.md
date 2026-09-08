# Reorder homepage sections: Governance below Integration

## Goal
Move the Governance section so it appears immediately after the Integration section on the homepage, keeping all other section order intact.

## Current order in `src/pages/Index.tsx`
1. ScrollDrivenHero
2. ProblemStatementSection
3. IntelligenceSection
4. PersonalizationSection
5. GovernanceSection
6. IntegrationSection
7. CTA

## New order
1. ScrollDrivenHero
2. ProblemStatementSection
3. IntelligenceSection
4. PersonalizationSection
5. IntegrationSection
6. GovernanceSection
7. CTA

## Implementation
- Edit `src/pages/Index.tsx` to swap `<GovernanceSection />` and `<IntegrationSection />` inside the `<main>` stack.
- No other files or behavior change.

## Verification
- Run typecheck/build after the edit.
- Confirm the homepage renders Integration before Governance.
