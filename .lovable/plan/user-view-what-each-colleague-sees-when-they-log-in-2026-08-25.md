# User View — what each colleague sees when they log in

Add a new sub-tab to the AI Coworker tab in /bankdemo called **User View**, placed right after Persona Settings. Same two-column shape as Persona Settings: the six coworkers on the left rail, the selected person's logged-in workspace rendered on the right.

Where Persona Settings governs *how the coworker behaves*, User View shows *what that behavior looks like on the receiving end* — the home screen a Head of Wealth, a relationship manager, or a risk officer actually lands on.

## Shared frame (identical for all six)

```text
┌ Coworkers ─────────┐┌ Signed in as: Sarah Chen · Senior Advisor · NW Region ──┐
│ ● Bank Leadership  ││ [role KPI row — 4 tiles, role-specific metrics]         │
│ ● Product & Growth ││ Today from Ventus  — the brief this role receives       │
│ ● Risk & Compliance││ ┌ Work queue ─────────────┐┌ Role panel ──────────────┐ │
│ ● Rewards & Deals  ││ │ ranked items to act on  ││ role-specific secondary  │ │
│ ▸ Relationship Mgrs││ │ each with evidence +    ││ view (portfolio / gaps / │ │
│ ● Marketing / Ops  ││ │ one-click next step     ││ cohorts / calendar)      │ │
└────────────────────┘└ Access footer: what this login can and cannot see ──────┘
```

Top bar shows an identity chip (avatar initials, name, title, scope of book) plus a "viewing as" note so it reads as an impersonation preview, not a live account. Access footer states the data scope for that role — e.g. leadership sees aggregates only, advisors see only their own book, risk sees flagged households across regions.

## Content per coworker

Each workspace carries a **"Only Ventus sees this"** strip — two or three insights that come specifically from semantic enrichment of raw transaction strings, off-bank merchant detection, and the confidence-mixed signal corpus, not from the core banking system.

**Bank Leadership — Elena Vasquez, Head of Wealth**
- KPIs: AUM movement WoW, households with an open decision window, advisor response time, at-risk AUM.
- Today from Ventus: the weekly pulse — three shifts that moved most, framed as opportunity.
- Work queue: decisions awaiting her — campaign brief approvals, coverage-gap regions, budget asks.
- Role panel: region roll-up table (region × momentum × coverage), no customer names.
- Only Ventus sees this: wallet-share leakage — dollars leaving the bank to named outside institutions, visible only because outbound transfer strings are semantically resolved; life-event momentum as a leading indicator weeks before balances move; the share of the book with zero detected signals (true coverage, not login counts).
- Access: aggregates and cohorts only; no household-level detail.

**Product & Growth — Daniel Reyes, Head of Product Strategy**
- KPIs: open product gaps, households in gap, projected 90-day AUM uplift, tests running.
- Today from Ventus: daily product-fit brief ranked by household count and fit score.
- Work queue: gap candidates ready to activate, each with the behavioral evidence and the catalog product it maps to.
- Role panel: segment × product fit matrix with over-index highlighting.
- Only Ventus sees this: off-bank product ownership — competitor mortgage, brokerage, and card payments detected in the transaction stream, so a "gap" is a confirmed product held elsewhere rather than a guess; behavioral tier movement (households trading up or down a spend tier) as the earliest next-product trigger; 12-pillar lifestyle mix per segment showing which pillar is over-indexed against the book.
- Access: segment-level; identity suppressed.

**Risk & Compliance — Angela Boateng, Director of Risk Operations**
- KPIs: open flags, two-cohort matches, escalations routed today, average time-to-review.
- Today from Ventus: alert digest, newest first, each with the behavioral evidence attached.
- Work queue: flags awaiting review — confirm, suppress with reason, or escalate; suppression requires a matching life event.
- Role panel: the seven vulnerability cohorts with population and trend.
- Only Ventus sees this: obfuscated merchant identity resolution — cash-advance, BNPL stacking, and vice-adjacent merchants that hide behind generic descriptors; life-event corroboration that suppresses false flags (a relocation explains a transfer cluster); cohort overlap, where a household sits in two indicators at once, which no single rule engine surfaces.
- Access: flagged households across all regions; behavior only, no intent, no account actions.

**Rewards & Deals — Priya Nair, Rewards Portfolio Manager**
- KPIs: active collections, offer refreshes this week, redemption lift vs generic, merchant partners live.
- Today from Ventus: which lifestyle collections are landing and which are stale.
- Work queue: offer refreshes to approve, merchant partnership candidates, expiring perks.
- Role panel: collection performance strip by lifestyle pillar.
- Only Ventus sees this: merchant-level wallet share on the competitor's card — where customers spend when they are not using ours, which is the actual partnership shortlist; city-level merchant concentration driving local perk refreshes; personalized vs generic conversion baselines side by side, so lift is attributable rather than asserted.
- Access: segment-level performance; no individual spend amounts.

**Relationship Managers — Sarah Chen, Senior Advisor (142 clients)**
- KPIs: households with a live signal, decision windows closing this week, outreach drafted, replies pending.
- Today from Ventus: the daily signal brief for her book only, ranked by decision window.
- Work queue: her households — signal, evidence line, suggested opener, and a draft-outreach action.
- Role panel: this week's client calendar / follow-up SLA list.
- Only Ventus sees this: the raw transaction strings behind each claim, enriched into a plain-language reason ("recurring tuition-plan transfers since March"); outside-institution flows that reveal assets held away before the client mentions them; decision-window ranking that puts a $400K household ahead of a $4M one because its window closes first; a "vaguely specific" opener that is usable in front of the client without sounding like surveillance.
- Access: her assigned book only.

**Marketing / Campaign Ops — Tom Whitfield, Campaign Operations Lead**
- KPIs: flows live, signals awaiting marketing approval, channels enabled, reach last 24h.
- Today from Ventus: which flows cleared governance and which are blocked.
- Work queue: signals pending marketing approval, with the message copy to review per channel.
- Role panel: channel mix (digital, email, SMS) with flow counts and reach.
- Only Ventus sees this: segment-of-one audiences built from behavior rather than declared demographics, with the copy already drafted per channel; audience drift detection when a live segment no longer matches the behavior that created it; a brand-safety read on every draft (no amounts, counts, merchant names, or detection language) before it enters the approval queue.
- Access: campaign and cohort level; no household identity.


## Interaction

Demo-grade and session-only, matching /bankdemo's LLM-free rule. Switching coworkers swaps the whole workspace. Work-queue items can be acted on (approve / dismiss / mark done) with local state and a toast; counts in the KPI row update accordingly. No backend writes, no LLM calls.

## Technical notes

- New data file `src/components/tepilot/coworker-inbox/coworkerUserViewData.ts` — `COWORKER_USER_VIEWS: Record<destinationId, UserWorkspace>` keyed to the existing `TEAM_DESTINATIONS` ids, so names/accents stay in one place. Types: `UserWorkspace { persona, kpis[], brief, queue[], panel }` with a small discriminated `panel` union (`table` | `matrix` | `cohorts` | `calendar` | `channels`).
- New component `src/components/tepilot/coworker-inbox/CoworkerUserViewPanel.tsx`, reusing the left-rail markup pattern and `PulseDot` from `CoworkerPersonaSettingsView.tsx`.
- Register a `userview` entry in the `ViewMode` union and `toggles` array in `BankwideWMCopilotView.tsx`, placed after `persona`.
- Strict light theme, no `dark:` utilities. No changes to existing dashboard, stream, persona, or example views.
