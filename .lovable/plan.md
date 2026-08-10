# Standalone Rewards Demo Page

## Goal
Create a public, rewards-only demo page that lets prospects experience the consumer-facing personalized rewards program without navigating the full /bankdemo or /deckmo flows.

## Decision
Build a new route `/rewards-demo` as a focused, auto-running consumer-rewards experience. It reuses the existing phone mockup and enrichment pipeline from /deckmo, but strips away the network diagram, password gates, and bank-side chrome so the only thing on screen is the reward program and a short value-prop header.

## What we will build

1. **New page component** — `src/pages/RewardsDemoPage.tsx`
   - Public (no password gate).
   - Minimal header: logo, one-line value prop, and a single CTA to `/contact`.
   - Auto-runs `useDemoEnrichment` on mount for a default rewards-oriented customer (`DEMO_CUSTOMERS[0]`).
   - Renders `ExecDemoPhoneView` locked to the **Rewards** tab so the phone mockup shows generated offer collections, top pick, expiring-soon row, and local perks.
   - Publishes results into `execDemoSessionStore` so the mockup behaves like the live /bankdemo customer view.
   - Adds a small persona switcher (3–4 `DEMO_CUSTOMERS`) so visitors can see different reward profiles without leaving the page.
   - Shows a lightweight loading state while enrichment runs.

2. **Route** — add `/rewards-demo` to `src/App.tsx` lazy route list.

3. **SEO** — add `<SEO title="Personalized Rewards Demo — Ventus AI" description="..." path="/rewards-demo" />` aligned with the current rewards/behavioral-intelligence copy.

4. **Theme** — strict light theme: white background, slate-200 borders, no `dark:` utilities, consistent with /bankdemo and /coworker.

## What we will reuse
- `useDemoEnrichment` hook
- `ExecDemoPhoneView` component
- `DEMO_CUSTOMERS` from `src/lib/demoData.ts`
- `execDemoSessionStore` for cross-component state
- Existing SEO component

## What we will not build
- No new edge functions or backend changes.
- No bank-side deal management UI (that already lives in /bankdemo under Personalized Deals).
- No password gate or session persistence.

## Acceptance criteria
- `/rewards-demo` loads and auto-populates the phone mockup with personalized rewards.
- The phone mockup shows the rewards tab by default.
- Switching personas refreshes the offers.
- Page is public, responsive, and has proper SEO metadata.
- Typecheck and build pass.
