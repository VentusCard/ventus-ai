# Governance tab (under Demo)

Add a **Governance** item in the `/bankdemo` sidebar, in the **Home** group directly beneath **Demo**. This is the control surface where bank leaders set how far personalization is allowed to go, and upload the policy documents that shape it.

## What the tab contains

**1. Personalization level (top control)**
A single headline dial with four discrete stages, each showing what changes downstream:
- Conservative — product-agnostic, no life-event inference, category-level only
- Balanced — life events allowed, no external signals
- Personalized — external signals allowed, individual value math shown
- Segment of One — full behavioral + external, autonomous enrollment

Selecting a stage updates a live "what this means" panel: which signal families are on (Spending Habits / Life Events / Financial / Demographic / Risk), whether external intelligence is used, and whether dollar-specific value lines appear in generated offers.

**2. Signal family controls**
Per-family toggles with a short policy note each (e.g. Risk signals never used for marketing, only servicing). Families disabled by the chosen stage are shown greyed with the reason.

**3. Guardrails**
Reuse the existing guardrails panel already built for Settings (frequency cap, quiet hours, cooling-off, channel priority, product eligibility, tone & disclaimers, autonomy threshold) rendered inline here so governance is one page rather than two. The Settings tab keeps its copy as-is.

**4. Documents & guidelines**
An upload surface for compliance and brand documents — drag-and-drop area plus a table of uploaded items (name, type, uploaded by, date, status: Applied / Under review). Seeded with realistic examples (Marketing Compliance Policy, Brand Voice Guide, Fair Lending Guidelines, Model Risk Governance Memo). Documents are listed with the signal families or copy rules they influence.

**5. Audit trail**
A compact list of recent governance changes (who changed what, when) to make the tab feel like a real control plane.

## Scope note

This is demo/presentation UI consistent with the rest of `/bankdemo`: state is local to the session, uploads are held in memory and not persisted to a bucket, and no backend or edge-function behavior changes. If you want uploads to actually persist and personalization settings to genuinely gate the demo pipeline, say so and I'll add that as a second phase.

## Technical

- New `src/components/tepilot/governance/GovernanceView.tsx` plus small subcomponents (`PersonalizationDial`, `SignalFamilyControls`, `GovernanceDocuments`).
- Register `{ value: "governance", label: "Governance", icon: ShieldCheck }` in `NAV_GROUPS` Home group after `exec-demo`, add the `case 'governance'` render branch in `AnalyticsContainer.tsx`.
- Reuse `TargetingGuardrailsPanel` from `src/components/tepilot/settings/`.
- Add a `governance` entry to `src/lib/ventusAiTabContext.ts` so the Ventus AI chat badge is context-aware on this tab.
- Strict light theme: white cards, `slate-200` borders, no `dark:` utilities.
