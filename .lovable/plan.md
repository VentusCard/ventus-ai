# Simplify Next-Conversation panels

Rework the two audience panels in `src/components/exec-demo/NextConversationRationale.tsx` so each one is a clean, self-contained explainer that fills the available height with no inner scrolling.

## Current problems

- **Regular Client** panel stacks two dense cards (AI Assistant Context + Personalized Outreach) inside an `overflow-y-auto` container — content overflows on the tablet mockup.
- **Ventus AI Coworker** panel embeds the full `CoworkerInboxView` demo, which is a heavyweight, scrollable inbox — not a summary of what the coworker does.
- Neither panel clearly answers "what is this / what does it do / what are its features."

## New content model (applies to both panels)

Each panel becomes a single, fixed-layout card with three consistent zones:

1. **Header** — icon + name + one-line tagline (what it is)
2. **What it does** — a 1–2 sentence plain-English description
3. **Features** — 3–4 short bullet items with an inline icon

No `overflow-y-auto`. The card uses `flex-1 min-h-0` and its internal spacing is tuned so all content fits inside the tablet frame at the standard 560px width used by the other Next-* tabs.

### Regular Client (blue accent)
- Tagline: "In-app AI banking assistant for the customer."
- What it does: Answers product questions in-app using the customer's own spending, holdings, and recent interactions — then surfaces the right offer at the right moment.
- Features:
  - Context-aware answers grounded in account + behavior
  - Personalized product & offer recommendations
  - Educational nudges timed to detected signals
  - Soft, opt-in conversion CTA — never pushy

### Ventus AI Coworker (purple accent)
- Tagline: "24/7 teammate for advisors, bankers, and ops."
- What it does: Digests signals across the book, drafts outreach, and hands work off to the right human specialist with full context attached.
- Features:
  - Signal digest across the full client book
  - Drafts emails, briefs, and campaign cohorts
  - Routes to Wealth Advisor, Mortgage, Service, etc.
  - Learns from every advisor edit and reply

## Files to change

- `src/components/exec-demo/NextConversationRationale.tsx`
  - Remove the two-card scrolling layout inside the customer branch.
  - Remove the `CoworkerInboxView` embed inside the RM branch.
  - Introduce a small internal `ExplainerCard` component that renders the header / what-it-does / features layout with the appropriate accent color per audience.
  - Keep the existing `PipelineSliver` above and the audience toggle wiring untouched.
  - Drop now-unused imports (`CoworkerInboxView`, `Mail`, `MessageCircle`, etc.) — keep only what the new layout uses (`Bot`, `Sparkles`, and the small feature-row icons).

## Out of scope

- The audience toggle in `ExecDemoIntelPanel.tsx` stays as-is.
- Tablet width (560px) and the `PipelineSliver` content stay as-is.
- No changes to the actual `CoworkerInboxView` — it remains available in its dedicated tab, just no longer embedded here.
