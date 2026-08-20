# Rewrite the Key Features bullets as named capabilities

Current bullets are generic. Replace them with the actual named capabilities each surface ships, verified against the phone mockups and generation code.

## What each surface actually ships

- **Rewards** — signal-grouped offer collections with a per-collection reason line, an "Expiring soon" strip, a rotating "Curated for {first name}" hero, and a semantic deal search bar (`useSemanticDealSearch`) that matches natural-language queries against the catalog with a reasoning line.
- **Product** — generated product cards with headline, benefit list, eligibility line, CTA and value range, themed by lifestyle (travel, education, home, business…), each tagged with the signal type that triggered it. Delivery channel can be switched to email or SMS previews.
- **Relationship** — membership/relationship view plus a grounded in-app assistant that answers using this customer's own signals, deals and detected life events, with proactive nudges and banker handoff.

## New bullets

**Personalized Rewards**
- Context-specific curation — collections built per signal group, each with its own reason line
- Hyper-personalized messaging — copy written to the customer's behavior, never generic offer text
- Semantic deal search — natural-language queries matched across the full catalog
- Timing intelligence — expiring and in-season offers pushed ahead of the next spend window

**Personalized Product**
- Signal-triggered recommendations — every card names the behavior or life event behind it
- Offer construction — headline, benefits, eligibility and value range generated per customer
- Lifestyle theming — visual treatment and CTA adapt to the customer's dominant pillar
- Channel-ready delivery — same card renders in-app, as email, or as SMS

**Personalized Relationship**
- Grounded assistant — answers from this customer's signals, deals and detected events
- Proactive nudges — life-event and financial changes trigger the right check-in
- Banker escalation — hands off with full signal context attached
- Protection cues — wellness and habit-shift indicators surface early

## Technical notes

Edit only the `FEATURES` map in `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx`; keep four items per surface so the staggered reveal timing is unchanged. No layout or logic changes.
