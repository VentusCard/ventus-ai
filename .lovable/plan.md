# Add a "Coworker for Wealth Managers" persona

A seventh AI Coworker, placed right after "Coworker for Relationship Managers". It covers the same ground but goes deeper and works like a concierge for high-net-worth households: family office-style briefings, preparing for life moments, and taking care of the details before the client asks.

## What appears on each sub-tab
- **Coworker Dashboard**: a new card called "Coworker for Wealth Managers" with a "Concierge brief". It shows its own weekly volume and two stats: "Households under concierge watch" and "Pre-emptive touches prepared". The two bullet lines describe its focus: liquidity events, estate/trust moments, family milestones, travel and lifestyle preparation, and a coordinated hand-off to specialists (tax, trust, lending, private aviation/insurance).
- **Persona Settings**: its own playbook.
  - Audience: private wealth managers and private bankers serving $5M+ households.
  - Mission: anticipate what each family needs next and have it arranged before the client asks.
  - Always: a household-level brief (the whole family, entities and properties, not just accounts); pre-assemble a specialist team for each moment; prepare a white-glove next step (reserved meeting time, documents ready, introductions lined up).
  - Sometimes: coordinate with trust/estate when a dependent or property change is detected; arrange lifestyle touches (travel, events) around known trips; escalate to the Market Head on liquidity above $5M.
  - Never: contact the client directly; mention exact amounts; act on anything without the wealth manager's approval; use risk or stress language.
  - Tone: discreet, polished, anticipatory. Word cap is higher (240 words).
- **User View**: a sample morning briefing for a wealth manager, e.g. "Two families have moments coming up this month. The specialist team and opening touch are ready for each."
- **Integrations**: one destination, "Wealth platform client portal and Salesforce FSC household plan", which delivers concierge plans with the specialist team assigned.
- **Activity History**: a few new concierge-style entries (for example "Assembled trust and tax specialists for {name}" or "Prepared pre-trip concierge note for {name}"), plus one wealth-manager colleague added to the "Working with" list.

The Relationship Manager persona's audience line changes to "Relationship managers, retail and business bankers" so the two don't overlap.

## Technical details
- `coworkerInboxData.ts`: new `wealth` entry in the coworkers list after `advisors` (accent such as emerald), a Integrations destination entry, and optionally a roster person (e.g. "Victoria Hale, Private Wealth Manager").
- `coworkerPersonaData.ts`: new `wealth` playbook and email template; update the `advisors` audience line.
- `coworkerUserViewData.ts`: new `wealth` user-view entry.
- `coworkerStreamData.ts`: add 3–4 wealth-concierge templates.
- Check for exhaustive `Record<CoworkerId, …>` types and accent color maps, and extend them.
- Light theme only. No exact amounts in client-facing copy.
