# Rewrite Microsegment Copy: Subtle, Bright, Non-Creepy

Regenerate the `body` (and tighten `subject` + `title` where needed) for every entry in `src/lib/productMicrosegments.ts`. Same structure, same `signalLabel` keys, same flow IDs — only the customer-facing copy changes.

## Tone rules (enforced in the regeneration prompt)
- **No surveillance language.** Banned openers: "We've noticed…", "We see you…", "We detected…", "Based on your activity…", "Your transactions show…". Never reference the specific signal evidence back to the customer.
- **Subtle.** Speak to a life moment or goal in general terms — never call out specific merchants, counts, amounts, frequencies, or behaviors.
- **Short.** 2 sentences max, ~25–40 words total. No multi-paragraph emails.
- **Bright & engaging.** Warm, optimistic, opportunity-framed. No stress/risk/scarcity language.
- **Opener.** Must still start with `Hi {{first_name}},` then go straight to a benefit or moment.
- **Subject.** ≤ 50 chars, friendly, benefit-led.
- **Title.** 4–6 words.
- **CTA.** 2–4 words, action-led.

## Examples of the new feel
- Before: "Hi {{first_name}}, we've noticed you're actively managing your investments. Did you know you can consolidate your portfolio and enjoy commission-free trading…"
- After: "Hi {{first_name}}, ready to put more of your portfolio to work? Commission-free trades and smarter tools, whenever you want them."

- Before: "Hi {{first_name}}, as you settle into life with your newest family member, long term planning often takes on a new meaning. We noticed your recent focus on nursery and healthcare essentials and want to help you balance those…"
- After: "Hi {{first_name}}, the early years fly by — a little set aside now can open big doors later. Start a tax-smart education fund in minutes."

## Scope
- Touch only `src/lib/productMicrosegments.ts`.
- All 32 flows × ~3–4 signals each (~110 entries) get refreshed.
- Preserve every `signalLabel` exactly (it is the join key with `productAutomatedFlows.ts`).
- Keep `FlowMicrosegment` shape and the exported `FLOW_MICROSEGMENTS` const.

## How
One-shot regeneration via the same Lovable AI gateway script pattern used last time: feed each flow's `name`, `positioning`, and ordered signals, ask for new `{title, subject, body, cta}` per signal under the tone rules above, then rewrite the file with `signalLabel`s preserved.

## Files touched
- `src/lib/productMicrosegments.ts` — full copy refresh, structure unchanged.

No component, routing, or schema changes.
