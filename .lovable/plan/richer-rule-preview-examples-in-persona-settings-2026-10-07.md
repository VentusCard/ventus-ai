# Richer rule-preview examples in Persona Settings

## Goal
Each "What it always does" rule preview (the example message shown on the right when a rule is clicked) gets more concrete, digest-style detail: named households, the life event or signal, the product to bring up, the timing, and the size of the opportunity.

## Changes

### 1. `coworkerPersonaData.ts` — rewrite rule example bodies
For each of the ~30 `example` bodies attached to `always` rules across the seven playbooks, expand from a generic bracketed outline into a short structured digest. Where the rule is a brief/digest (e.g. daily signal brief, weekly pulse), the body becomes a list of concrete entries in this shape:

```text
- The [Family A] household — [life event, e.g. new baby ~6 months ago].
  Bring up: [Product]. Timing: [window, e.g. before the next statement cycle].
  Opportunity: [$ figure or range].
```

Rules that are inherently non-digest (e.g. "cite evidence", "never contact clients" style guardrails expressed as always-rules) keep their current format but gain one concrete worked illustration in the same style.

### 2. Tone and guardrails (unchanged rules, applied to new copy)
- "Vaguely specific": real-feeling placeholder brackets for names/figures, no exact customer account amounts presented as fact.
- No risk/stress language in customer-facing framing; opportunity/optimization framing.
- Light theme, existing layout — no visual changes to the panel; only the text content of examples grows.

### 3. Files touched
- `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts` only (example body/subject/replyPrompts text). No component changes.

## Verification
- Typecheck + build.
- Playwright on /bankdemo → AI Coworker → Persona Settings → click several rules across at least two coworkers (Leadership, Wealth Managers) and confirm the right panel shows the richer digest entries with family/signal/product/timing/opportunity lines.
