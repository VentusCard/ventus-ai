# Rewrite the Key Features bullets

## What we actually have today

The three personalization tabs share one workspace: customer selection + signals (left), Key features + Unit economics (middle), phone mockup (right). The current bullets are generic marketing lines that don't describe the surfaces on screen.

What each surface really does:

- **Personalized Rewards** — the phone shows an "Expiring soon" strip plus a rotating "Curated for {first name}" collection card. Offers are generated from the customer's five signal groups (behavioral spend, life events, financial, demographic, risk) grouped into lifestyle pillars, each with a collection message. Merchant names are sanitized so no invented bank brands appear.
- **Personalized Product** — product cards generated against the bank's catalog, each with a headline, sub-copy and CTA, driven by life-event and financial signals with eligibility/suppression applied.
- **Personalized Relationship** — the in-app assistant tab, answering with this customer's own signal context, plus proactive check-ins and banker handoff.

## Proposed bullets

**Rewards**
- Built from five signal groups — behavior, life events, financial, demographic, risk
- Grouped into lifestyle collections with a reason line per collection
- Timing-aware — expiring offers surface ahead of the customer's next spend window
- Bank-safe brand handling — only real merchants and your own bank label

**Product**
- Ranked against the live product catalog, not a fixed list
- Every card carries the signal that triggered it
- Eligibility and suppression rules applied before anything surfaces
- Copy adapts to tone and life stage, never quoting exact spend

**Relationship**
- Assistant answers from this customer's own signals, not generic scripts
- Proactive nudges fire on life-event and financial changes
- Escalates to a banker with the full signal context attached
- Wellness and protection cues surface before they become problems

## Technical notes

Edit only the `FEATURES` map in `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx` (label + detail per item). Keep four items per surface so the staggered reveal timing stays unchanged. No layout or logic changes.
