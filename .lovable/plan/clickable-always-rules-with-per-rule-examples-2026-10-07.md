# Clickable "always" rules with per-rule examples

## Goal
In AI Coworker → Persona Settings, clicking a rule under "What it always does" swaps the example email shown in the right-hand Examples panel to one that illustrates that specific rule. Today the panel shows a single fixed example per coworker.

## How it works
- Each "always" rule gets its own example message (subject, body, reply prompts) written to demonstrate that rule in action.
- Clicking a rule row selects it (subtle highlight ring) and the Examples panel on the right updates to that rule's example. The panel header shows which rule the example illustrates.
- Clicking the selected rule again (or a small "Overview" reset) returns to the coworker's default first-message example.
- The toggle check circle, inline text editing, and remove button keep working exactly as today — clicking the rule body selects the example, the other controls keep their current behavior.
- Only "always" rules get examples; "sometimes" and "never" rows are unchanged.

## Content
- Write one example per "always" rule for all seven coworkers (Leadership, Product Growth, Risk, Rewards, Advisors, Wealth Managers, Marketing) — roughly 30 short illustrative messages in the same bracketed-placeholder style as the existing examples.
- Examples stay "vaguely specific": no exact customer amounts, opportunity framing, light theme.

## Technical details
- `coworkerPersonaData.ts`: add optional `example?: CoworkerExample` to `PlaybookRule`; attach an example to each always rule in `COWORKER_PLAYBOOKS`; keep `COWORKER_EXAMPLES` as the per-coworker default.
- `CoworkerPersonaSettingsView.tsx`: add `selectedRuleId` state (reset when switching coworkers); pass an `onSelect`/`selectedId` into the "always" `RuleGroup` only; rule row gets `cursor-pointer` and a selected ring; `ExamplesPanel` receives the selected rule's example (falling back to the default) plus the rule text to show as context.

## Verification
- Typecheck clean; Playwright on /bankdemo → AI Coworker → Persona Settings: click each always rule on two coworkers and confirm the right panel swaps examples and the selection highlight moves.
