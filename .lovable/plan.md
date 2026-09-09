# Coworker email examples: placeholder-driven templates

Rework the six example emails shown in the coworker persona settings tabs so they read as fill-in templates, with bracketed placeholders where real details would appear.

## What changes

Each of the six examples (Leadership, Product & Growth, Risk, Rewards, Advisors, Marketing) gets a longer, more structured body with inline bracketed tokens such as `[Region]`, `[# households]`, `[Product]`, `[Segment]`, `[Merchant]`, `[Household]`, `[Date]`, `[Owner]`.

Structure per example:
- A short opening line stating what moved.
- Two or three numbered or dashed points, each with placeholders for the specific figures and names.
- A closing line naming the decision or next step, with placeholders for owner and timing.

Subjects also pick up a placeholder where it reads naturally (for example, "Three things moved in [Week of]").

Content rules kept intact: no exact spend amounts or transaction counts in customer-facing tone, opportunity framing rather than risk language, and the existing tone/word-cap character of each team. Placeholders stand in for the bank's real figures rather than inventing numbers.

The reply prompt chips under each example stay unchanged.

## Technical notes

- Only `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts` changes — the `COWORKER_EXAMPLES` record (`subject` and `body` for each of the six keys).
- `ExamplesPanel` in `CoworkerPersonaSettingsView.tsx` already renders the body with `whitespace-pre-line`, so multi-line templates render correctly with no component change.
- No styling, layout, data-model, or type changes.
