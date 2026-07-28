## New route: `/coworker`

A marketing/product page for **Ventus AI Coworker**, adapted from the blog post and prominently featuring the live AI-Coworker ↔ Advisor conversation demo already shipped in `/bankdemo`'s Next Conversation tab.

### Page sections (top to bottom)

1. **Hero**
   - Eyebrow: `VENTUS AI COWORKER`
   - Headline: "Daily intelligence and collaboration for every banking team, 24/7."
   - Subtext: condensed from the blog TL;DR — email-based digest + conversational, scope-aware follow-ups, no dashboard to log into.
   - Primary CTA → `/contact` ("Schedule a Demo"); secondary → `/insights/meet-ventus-ai-coworker` ("Read the announcement").

2. **What it is** — the two "What is it?" paragraphs from the blog on a light card.

3. **Live conversation demo — the centerpiece**
   - Embed the exact example from `/bankdemo`'s Next Conversation tab by reusing `AdvisorConversationThread` (from `src/components/tepilot/advisor-console/AdvisorConversationThread.tsx`) — the Sarah / Marco / Priya / Elena / David threads with digest → reply → follow-up exchanges.
   - Frame it in a bordered "inbox" surface with the same purple header pill used in `AdvisorConversationTabletView` ("AI Coworker ↔ Advisor").
   - Seed with `generateDashboardClients(60)` from `src/lib/randomProfileGenerator`, `density="full"`, fixed height (~720px) so the page doesn't hijack scroll.
   - Short caption above: "Try it — click any thread to read the exchange between an advisor and the Coworker."

4. **How it works** — 3-step horizontal flow (reuse `StepFlow`): Detect → Digest → Converse.

5. **Who it's for** — 4-card grid (Wealth advisors & RMs, Retail/branch leaders, Product/marketing/segmentation, Executives & LOB heads), one sentence each from the blog.

6. **Why it matters / what's different** — two-column block from the closing of the blog: meets people where they work; respects what the bank already has.

7. **CTA footer** — reuse `SolutionsCTA` → `/contact`.

### Technical details

- New file: `src/pages/CoworkerPage.tsx`, lazy-loaded. Follows `NextConversationPage.tsx` conventions: `SEO`, `useSectionReveal` + `revealStyle`, Tailwind, strict light theme, Manrope.
- Route wiring in `src/App.tsx`: add `const CoworkerPage = lazy(...)` and `<Route path="/coworker" element={<CoworkerPage />} />`. Keep it inside the standard chrome (Navbar + Footer) — not in the `showChrome === false` allowlist.
- Reused components: `AdvisorConversationThread`, `generateDashboardClients`, `SolutionsCTA`, `StepFlow`, `SEO`.
- SEO: title "Ventus AI Coworker — Daily intelligence for banking teams", description from the blog TL;DR, path `/coworker`.
- No backend, schema, or new deps.

### Out of scope

- No navbar link changes (add on request).
- No edits to `/bankdemo`, the blog post, or edge functions.