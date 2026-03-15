

## Plan: Demographics in Life Event Cards + Broader Event Detection

### Change 1: Show demographics under the name in life event cards

**File: `src/components/demo/DemoLifeEventsView.tsx`**

In the `LifeEventCard` header section (line 68-70), expand the subtitle line to include key demographics from `customer.profile.demographics`:

```
Sarah Mitchell · Premium
Age 45 · Product Director · Married, 1 teenager (16)
```

Add a second `<p>` line showing age, occupation, and family status pulled from `customer.profile.demographics`.

### Change 2: Update edge function prompt to consider broader relationship possibilities

**File: `supabase/functions/analyze-lifestyle-signals/index.ts`**

Add a new section to the system prompt (around line 232, after the evidence principles) instructing the AI to consider that the person paying for something may not be the direct beneficiary. Specifically:

- Education-related transactions could be for a child, niece/nephew, grandchild, or godchild — not necessarily the client's own child or themselves.
- Baby-related transactions could be gifts for someone else's baby shower.
- The AI should use the client's age, family status, and occupation to reason about the most likely beneficiary, and reflect that in the `event_name` (e.g., "Education Support for Family Member" vs "College Preparation for Child").
- Add guidance: "If the client profile does not mention children but shows education spending, consider extended family (niece, nephew, godchild) or charitable sponsorship as likely explanations."

This ensures Sarah (age 45, 1 teenager) correctly gets "College Preparation for Child" while someone without kids would get a more nuanced interpretation.

