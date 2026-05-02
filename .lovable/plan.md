## Goal

Merge the **Signal** and **Intent** stages into a single combined stage in both cards of `NextConversationRationale.tsx`. This drops each card from a 4-stage flow to a 3-stage flow:

```text
SIGNAL → INTENT  →  PERSONALIZE  →  ORCHESTRATE
   │
   ▼
SIGNAL → INTENT  →  PERSONALIZE  →  ORCHESTRATE   (3 stages)
```

## File

`src/components/exec-demo/NextConversationRationale.tsx`

## Changes

### Regular Client (lines ~887–937)

- Change grid to 3 columns: `grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1.05fr)]`.
- Replace the two stages "Signal" + "Intent" with one merged stage:
  - Eyebrow: `Signal → Intent`
  - Icon: `Brain` (in blue)
  - Headline: `Behavior → playbook`
  - Bullets: `Transaction pattern detected`, `Mapped to playbook`, `Confidence scored, trigger fires`
- Keep Personalize and Orchestrate stages and their chevrons unchanged.

### Wealth Client (lines ~981–1023)

- Change grid to same 3-col template.
- Replace "Signal" + "Intent" with one merged stage:
  - Eyebrow: `Signal → Intent`
  - Icon: `Sparkles` (purple)
  - Headline: `Multi-signal synthesis`
  - Bullets: `Primary + secondary triggers`, `Cross-pillar correlation`, `Urgency + confidence scored`
- Keep Personalize and Orchestrate stages and their chevrons unchanged.

## Out of scope

- No changes to context band, CTA buttons, brand strips, eyebrow rows, All-Signals branch, or any data structures.

Approve to apply.