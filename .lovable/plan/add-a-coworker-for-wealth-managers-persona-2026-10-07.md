# Add a "Coworker for Wealth Managers" persona

A seventh AI Coworker, placed right after "Coworker for Relationship Managers". Concierge isn't one feature. It's the way this coworker works: it gives a wealth manager everything they need across the full client relationship, plus what only Ventus can see (life-event alerts, external wealth signals, outflow detection). It anticipates each family's needs and gets the next step ready before the client asks.

## What it covers (the full wealth manager toolkit)
- **Ventus intelligence**: early life-event alerts (new baby, home purchase, business launch, retirement, inheritance), liquidity events, external wealth signals (property, aircraft, business ownership), and money flowing to other firms (for example a Goldman Marcus HYSA or an outside brokerage).
- **Portfolio and planning**: cash drag and idle balances, rebalancing and concentration prompts, tax-loss harvesting windows, RMD and contribution deadlines, estate and beneficiary reviews.
- **Household view**: the whole family, entities, trusts and properties, the next generation, and linked businesses.
- **Lending and banking**: chances for securities-based lines, jumbo mortgages and business banking that come out of the signals.
- **Meeting prep**: pre-meeting dossiers, an agenda, talking points, and a recap with follow-ups afterwards.
- **Specialist coordination**: lines up tax, trust, lending, insurance and philanthropy partners for each moment.
- **Relationship care**: milestones, family events, travel and lifestyle touches, so outreach feels personal and nobody feels tracked.

## What appears on each sub-tab
- **Coworker Dashboard**: a "Coworker for Wealth Managers" card with a "Household brief". It shows its own weekly volume and two stats: "Households under watch" and "Next steps prepared". The two bullet lines sum up Ventus life-event alerts plus full-book planning prompts.
- **Persona Settings**: its own playbook.
  - Audience: private wealth managers and private bankers.
  - Mission: know what each family needs next and have it ready before they ask.
  - Always: a daily household brief led by Ventus life-event and liquidity alerts; cite the evidence; prepare a complete next step (agenda, documents, specialist team).
  - Sometimes: start an estate or beneficiary review on a family change; prompt planning around tax and RMD dates; flag money moving to outside firms; escalate large liquidity events to the Market Head.
  - Never: contact the client directly; quote exact amounts; act without the wealth manager's approval; use risk or stress language.
  - Tone: discreet, polished, anticipatory. Higher word cap (240 words).
- **User View**: a sample morning briefing, e.g. "Two families have moments coming up. A life-event alert, the planning items it triggers, and the specialist team are ready for each."
- **Integrations**: one destination, Salesforce FSC household plans plus the wealth planning platform. It delivers meeting dossiers and household action plans.
- **Activity History**: new entries such as "Sent life-event alert to {name}", "Prepared pre-meeting dossier for {name}", "Lined up trust and tax specialists for {name}", plus one wealth-manager colleague in "Working with".

The Relationship Manager audience line changes to "Relationship managers, retail and business bankers" so the two don't overlap.

## Technical details
- `coworkerInboxData.ts`: new `wealth` coworker after `advisors` (emerald accent), an integrations entry, a roster person (e.g. "Victoria Hale, Private Wealth Manager").
- `coworkerPersonaData.ts`: `wealth` playbook and email template; update the `advisors` audience.
- `coworkerUserViewData.ts`: `wealth` user-view entry.
- `coworkerStreamData.ts`: 4–5 wealth templates.
- Extend any exhaustive `Record<CoworkerId, …>` types and accent maps; add the item to roadmap.md.
- Light theme only; no exact amounts in client-facing copy.
