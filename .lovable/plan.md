# Fix "Sarah" in the personalization phone mockup

## What's wrong

The Customer Selection card lists the first example customer as **Ricky J**, but the phone mockup next to it greets "Sarah". The example customer entries reuse the `/demo` sample customers by id, and the sample record behind the first example still carries the name **Sarah Mitchell** (with her own city and segment). The phone mockup reads the name off that underlying sample record, not off the example customer, so the two panels disagree.

This affects every field the phone pulls from the sample record — the greeting, the generated-offers header, the relationship view welcome line, and the segment line.

## The fix

When building the example customers, override the underlying sample record's identity fields with the example's own values:

- name (Ricky J, James Rodriguez, Emily Chen, Michael Thompson, Amanda Williams)
- city / location
- segment and tier

Everything else on the sample record (transactions, holdings, spend pillars) stays untouched, so generation and the enriched data behave exactly as today.

Scope this override to the personalization examples only — the `/demo` flow keeps its original sample customers unchanged.

## Audit pass over the mockup

After the name override, check the three surfaces for any other stale identity text:

- Rewards surface (generated offers header and deal copy)
- Product surface (product cards, email/SMS preview greetings)
- Relationship surface (welcome line, segment line, assigned advisor card)

The assigned advisor in the relationship view is a separate person (a banker, e.g. "Sarah Nguyen") and is intentionally not the customer — leave advisor names alone.

## Technical notes

- `src/lib/personalizationExamples.ts`: in the final `.map`, build `demo` as `{ ...byId(c.id), profile: { ...byId(c.id).profile, name: c.name, location: c.city, segment: c.segment } }` instead of passing the shared record through by reference.
- No changes to `src/lib/sampleData.ts` or `src/lib/demoData.ts`.
- Verify in the browser on `/bankdemo` that the Personalized Rewards / Product / Relationship cards all greet Ricky.
