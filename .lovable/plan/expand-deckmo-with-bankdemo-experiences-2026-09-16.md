# Expand `/deckmo` with `/bankdemo` experiences

## Goal
Make the existing leadership deck feel materially closer to the full `/bankdemo` product while preserving its static, presenter-controlled format and current narrative structure.

## What will change

### 1. Replace the three simplified phone scenes
Rebuild the existing Immediate, Mid-term, and Long-term phone presentations using the strongest visual patterns from `/bankdemo` rather than adding more slides.

- **Immediate value:** use the polished customer banking shell and enriched activity treatment, including recognizable transactions, categories, recurring-pattern cues, and the charge explainer.
- **Mid-term value:** reproduce the richer Rewards and Product experiences, including the top collection, category navigation, offer cards, benefit framing, and product recommendation state.
- **Long-term value:** reproduce the Membership/Relationship experience with the customer summary, life-event context, recommended product, advisor conversation, and coordinated outreach states.
- Preserve the current slide headings, callout progression, and staged presenter flow.
- Keep every view static and locally scripted. Live search, timers, generated content, and backend calls from `/bankdemo` will not be imported.

### 2. Rebuild pages 22–24 from `/bankdemo`
The current pages 22–24 map to Intelligence Database, Automated Flows, and AI Coworker. Recreate all three as faithful static snapshots of their `/bankdemo` counterparts.

- **Page 22, Intelligence Database:** mirror the real signal-family overview, priority/trend presentation, segment access, reporting/export actions, and Ask Ventus AI entry point.
- **Page 23, Automated Flows:** mirror the real flow workspace with products, trigger signals, exclusions, configuration controls, and the explicit Risk guardrail.
- **Page 24, AI Coworker:** mirror the current Coworker dashboard/inbox presentation with role-oriented briefs, richer email content, follow-up affordances, and ready-to-review work.
- Keep these as bank-facing desktop screens inside the existing browser frame rather than converting them into phones.

### 3. Preserve deck behavior and guardrails
- Keep the current beat order, page numbering, password gate, desktop requirement, click/arrow navigation, scroll snapping, progress controls, and `P` presenter navigator.
- Keep all deck copy and display data centralized in the deck script.
- Maintain the strict light theme, Manrope typography, generic bank naming, and current Risk visibility rules.
- Do not alter `/bankdemo`; it remains the visual and content reference only.

## Technical approach
- Create focused static deck components modeled on the existing `/bankdemo` phone and bank-tool views instead of mounting their live components.
- Expand the centralized deck data to cover the richer customer, offer, product, advisor, flow, database, and Coworker states.
- Refactor the deck scene file where needed so each presentation remains readable and maintainable.
- Use existing local imagery only when it can render without a network request; otherwise use static graphic treatments.

## Validation
- Verify every replaced phone view at the deck viewport and confirm no content is clipped.
- Verify pages 22–24 visually correspond to the current `/bankdemo` tabs.
- Confirm page numbering and presenter navigation remain continuous.
- Confirm `/deckmo` makes no application data requests after loading.
- Confirm Risk appears only in the allowed customer-analysis and bank-governance contexts.
- Check the desktop guard, keyboard navigation, click progression, presenter overlay, type safety, and preview build.
