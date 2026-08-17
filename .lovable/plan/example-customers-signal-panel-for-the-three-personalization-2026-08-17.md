# Example customers + signal panel for the three Personalization tabs

Applies to the last three tabs in the BANKING PERSONALIZATION group of /bankdemo:
Personalized Deals, Personalized Product, Personalized Relationship — specifically
their shared "Customer View" surface.

## What changes

1. **Five example customers with search + select**
   A slim bar above the customer surface: a search input (name, city, segment, product,
   or signal keyword) with a dropdown of matches, plus five selectable customer chips.
   Selecting a customer is remembered while moving between the three tabs, so Deals,
   Product and Relationship always show the same person.

2. **Left panel = five signal families as pills**
   The left column of the Customer View becomes a signal panel styled like the /demo
   intelligence panel: five stacked rows — Life Events, Financial, Spending Habits,
   Demographic, Risk — each rendering its signals as rounded pills with a confidence
   badge. Clicking a pill expands the evidence line beneath it. Risk stays red-only;
   all other families use the established pillar colors.

3. **Signals load with the customer**
   Switching customer re-renders the pills with a short staggered fade-in (family by
   family, in the priority ladder order) so it reads as "signals loading", then the
   phone mockup on the right updates to that customer's deals / product cards /
   assistant context.

## Layout

```text
[ search box .......................... ]  [ Sarah ][ James ][ Emily ][ Michael ][ Amanda ]
------------------------------------------------------------------------------------------
 LIFE EVENTS   (pill)(pill)              |
 FINANCIAL     (pill)(pill)(pill)        |          [ phone mockup ]
 SPENDING      (pill)(pill)(pill)        |        deals / product / assistant
 DEMOGRAPHIC   (pill)(pill)              |
 RISK          (pill)                    |
```

## Technical notes

- New `src/lib/personalizationExamples.ts` — five example customers keyed to the
  existing `DEMO_CUSTOMERS` entries (c1–c5) so the phone mockup keeps working, each
  extended with signals typed as `DirectorySignal` and grouped with the existing
  `SIGNAL_FAMILY_META` from `customerDirectoryData.ts`. All static mock data, no LLM
  or backend calls.
- New `src/components/tepilot/insights/personalization/ExampleCustomerBar.tsx`
  (search + chips) and `CustomerSignalPanel.tsx` (five pill rows, expandable evidence,
  staggered reveal on customer change).
- `CustomerMockupPanel.tsx` becomes the integration point: it owns nothing new about
  the three tabs, it just renders the bar, swaps its left column for the signal panel,
  and feeds the selected example customer into `ExecDemoPhoneView`. If a live /demo
  session exists, that session's customer is offered as a sixth "Session" option and
  wins by default.
- Selection lives in a tiny shared store next to `execDemoSessionStore.ts` so the three
  tabs stay in sync without prop drilling through `AnalyticsContainer`.
- Strict light theme, Manrope UI type, slate-200 borders, no `dark:` utilities.
