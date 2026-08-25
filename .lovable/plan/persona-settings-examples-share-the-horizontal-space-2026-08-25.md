# Persona Settings: examples share the horizontal space

Today the Persona Settings panel stacks "What it always does", "What it sometimes does" and "What it never does" full-width, leaving a lot of empty horizontal room on wide screens. That room becomes an **Examples** column showing the coworker's actual first message.

## Layout

Inside the right playbook card, the body becomes two columns:

```text
┌───────────────────────── playbook card ─────────────────────────┐
│ Mission (full width)                                            │
├───────────────────────────┬─────────────────────────────────────┤
│ Always does               │ EXAMPLES                            │
│ Sometimes does            │  First message this coworker sends  │
│ Never does                │  ─ subject line                     │
│ Signals watched           │  ─ opening message body             │
│                           │  ─ "why this lands" note            │
│ Tone & length | Escalation│  ─ 2 example reply prompts          │
└───────────────────────────┴─────────────────────────────────────┘
```

- Rules column ~50%, Examples column ~50%; the Examples column sticks to the top while the rules scroll.
- Below `lg` the Examples column drops underneath the rules (single column) so nothing squeezes.
- Rendered as a light email-card: sender chip (Ventus AI · role), subject, body, footer note. Strict light theme, no `dark:` classes.
- Read-only content — this is illustration, not another editable form.

## Drafted example messages (one per coworker)

**Bank Leadership** — Subject: *"Three things moved this week"*
"Inbound liquidity concentrated in two regions this week, while a familiar pattern showed up underneath it: a growing share of households routing money to institutions you don't hold. Deposit momentum looks healthy on the surface; underneath, share-of-wallet is the story. Second, the pre-retirement cohort is expanding faster than advisor coverage in the Southeast. Third, a product gap now spans enough households to be worth a campaign rather than a conversation. Decisions worth your attention: coverage in the Southeast, and whether the gap gets a brief."
Why this lands: no customer names, no exact amounts, three decisions instead of a dashboard.

**Product & Growth** — Subject: *"A gap that keeps showing up"*
"Households in the mid-affluent band keep showing behavior consistent with a product you offer — and then buying it elsewhere. The behavioral evidence is consistent: recurring payments leaving the bank on a fixed cadence, at an institution that isn't you. Fit is high, conversion is below baseline, which usually means eligibility or pricing, not demand. Suggested next step: a positioning test before a build."
Why this lands: evidence first, maps to an existing product, names the likely blocker.

**Risk & Compliance** — Subject: *"Two cohorts overlapped on the same households"*
"A set of households matched both the outbound-clustering pattern and the buffer-erosion pattern within the same week. Neither is conclusive alone; together they're worth a look. The transaction evidence is attached to each flag, and the merchant identities behind the obfuscated descriptors have been resolved. No action has been taken — this is behavior, not intent."
Why this lands: neutral, evidence-attached, explicitly hands judgment to a human.

**Rewards & Partnerships** — Subject: *"Where the offers are missing the spend"*
"Two of the current perks are under-indexing for a second straight week, and the spend they were meant to catch is going to merchants you have no agreement with. There's a partnership candidate in that list with meaningful wallet share and no competing deal. Separately, one city's spend mix shifted enough to justify refreshing its local perks."
Why this lands: lifestyle-led, no exact spend or visit counts, ends with a concrete move.

**Advisors / Relationship Managers** — Subject: *"Two relationships worth a call today"*
"One household in your book shows the pattern that usually precedes a liquidity event — the timing window is short, and the evidence is in the account activity rather than anything they've told you. A second household has been quietly funding a goal at another institution for months. Opening lines are drafted for both. Everything else in your book can wait until tomorrow."
Why this lands: ranked by decision window, evidence-backed, opener already written.

**Marketing / Campaign Ops** — Subject: *"An audience that's ready, with copy attached"*
"A segment built from behavior rather than demographics is large enough to run and fresh enough to matter. Draft copy is written to the benefit, never to the signal — the customer reads relevance, not surveillance. It's sitting in the approval queue with a named reviewer; nothing sends until someone signs off. The audience definition expires in 30 days."
Why this lands: brand-safe, approval-gated, no signal leakage in the copy.

Each example also carries two "reply and it will…" prompts, e.g. *"Break the Southeast out by region"* / *"Draft the campaign brief"*.

## Technical notes

- New export in `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts`: `COWORKER_EXAMPLES: Record<string, { subject: string; body: string; why: string; replyPrompts: string[] }>` keyed by the same team ids.
- `CoworkerPersonaSettingsView.tsx`: wrap the rule groups + signals + tone/escalation blocks in a `grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`; Mission and the delivery footer stay full width. Add a small local `ExamplesPanel` component in the same file.
- No changes to editing behavior, drafts state, save sequence, or any other view.