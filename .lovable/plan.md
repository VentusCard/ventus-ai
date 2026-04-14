

## Make life event product card copy more subtle

### Problem
The AI-generated `quote` on life event cards currently references the life event directly (e.g., "as you plan for college..."). The user wants the copy to use indirect language — e.g., "major family milestone" instead of "new baby," "big transition ahead" instead of "retirement."

The `signal_label` (the trigger pill text) should remain explicit (e.g., "College Preparation").

### Change: `supabase/functions/generate-product-cards/index.ts`

Update the **CARD 2 — LIFE EVENT** section of the system prompt (~lines 44-50) to add explicit instructions:

- The `quote` must **never** name the life event directly — use indirect, euphemistic language instead
- Add concrete examples: "new baby" → "major family milestone", "college" → "an upcoming chapter", "retirement" → "the next phase", "home purchase" → "putting down roots"
- Clarify that `signal_label` should still use the explicit event name (this is already the case but worth reinforcing)

No other files change. The edge function will auto-deploy.

