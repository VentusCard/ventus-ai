# Risk becomes eligibility filters, not signals

## Why

Risk items ("Never overdraws the account", "Comfortable room for a new payment") don't *trigger* an offer — they decide who is allowed to receive it. Today they sit in the same list as Life Event / Behavioral / Financial / Demographic signals and each one *adds* audience, which is backwards: turning more of them on should narrow the audience, not grow it.

## What changes on Automated Flows (/bankdemo)

Each expanded flow gets two clearly separated blocks:

```text
SIGNALS THAT TRIGGER THIS FLOW                     4 signals on
  [on]  LIFE EVENT  Just got a raise            2.5M   >
  [on]  BEHAVIORAL  Saves small amounts often   6.4M   >
  ...
  ------------------------------------------------------
  Triggered audience                                8.9M

ELIGIBILITY FILTERS — narrow who qualifies        2 filters on
  [on]  Never overdraws the account          keeps 78%
  [on]  Comfortable room for a new payment   keeps 61%
  ------------------------------------------------------
  Qualified audience                                4.2M
```

Behaviour:
- Signals block: unchanged — toggles add/remove trigger audience, clicking opens the hyper-personalization detail.
- Filters block: each filter is a pass-rate. Turning one on multiplies the triggered audience by its pass rate; turning it off removes the constraint and grows the audience back. All filters off = no eligibility screen, headline audience equals the triggered audience.
- The flow header audience number shows the **qualified** audience (after filters), so the list stays sorted on a number that means "customers we would actually contact".
- Filter rows show "keeps N%" instead of an audience count, and do not open a personalization panel — they have no message of their own. Clicking a filter row expands a short "what this checks" line instead.
- Flows with no credit exposure (deposits, rewards, advisory) already carry no risk items, so they simply show no filters block.

## Technical notes

- `src/lib/flowSignalFamilies.ts`
  - Keep the `risk` family internally but expose it separately: add `expandFlowFilters(flow)` returning `EligibilityFilter[]` (`id`, `label`, `evidence`, `passRate`), and have `expandFlowSignals(flow)` return only the four triggering families.
  - Reuse the existing `RISK` seed catalog; its current `weight` becomes `passRate` (values are already expressed as "share of base that clears", e.g. 0.78 for no-overdraft).
  - Audience math: `triggered = sum(enabled signal weights) / total weights * estimatedAudience`; `qualified = triggered * product(passRate of enabled filters)`. New exported helper `qualifiedAudience(flow, signals, enabledSignals, filters, enabledFilters)`.
  - `signalAudience` keeps working off the trigger set only.
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
  - Render the two blocks with a divider and section headers; new `FilterRow` component (label, "what this checks" evidence, keeps-% on the right, toggle).
  - Second session-only state map `filterState: Record<flowId, Set<filterId>>`, defaulting to all filters enabled.
  - Collapsed row chip becomes e.g. `11 signals · 3 filters`; the header audience uses the qualified number.
- Strict light theme, slate-200 borders, no `dark:` utilities. Filter rows use the neutral slate treatment already assigned to the risk family so they read as guardrails rather than opportunities. No backend or data-source changes.
