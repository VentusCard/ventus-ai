## Goal

Replace the vague `"Replace human advisors"` pill in the **Out of Scope** row with a concrete, feature-oriented capability the AI Banking Assistant intentionally does not perform — keeping the same short, parallel verb-led wording as the other Out of Scope pills.

## Change

In `src/components/exec-demo/NextConversationRationale.tsx`, inside the `Out of Scope` row of `CONTEXT_ROWS` (line ~59), swap one pill:

- Remove: `"Replace human advisors"`
- Add: `"Underwrite or price products"`

This keeps the row at 8 pills and stays feature-specific (underwriting / pricing is a real banking function the AI does not do), while still reading in parallel to neighbors like "Approve loans or credit lines", "Trade securities", "Open or close accounts".

## Alternatives (pick one if you prefer something else)

If you'd rather highlight a different missing feature, swap to one of:

- `"Underwrite or price products"` ← proposed default
- `"Issue cards or credentials"`
- `"File disputes or chargebacks"`
- `"Sign contracts on your behalf"`
- `"Execute trades or orders"`
- `"Disclose other customers' data"`

Tell me which one (or your own) and I'll apply it.

## Out of scope

- No layout, color, or icon changes.
- No changes to the other three rows or to the journey cards below.
