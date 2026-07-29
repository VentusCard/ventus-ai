## Goal

Reposition the whole site around one message — **AI Behavioral Intelligence and Personalization Engine for Financial Institutions** — and make it machine-readable for both Google and AI answer engines (GEO: ChatGPT, Perplexity, Google AI Overviews).

## Current state (verified)

- `index.html` has a decent title/description but no canonical, no JSON-LD, no sitemap reference.
- `src/components/SEO.tsx` handles per-route title/description/canonical/og — good foundation, but no JSON-LD support and no keyword-aligned copy.
- There is **no `public/sitemap.xml`** and no sitemap generator.
- `public/llms.txt` exists but is thin and missing `/coworker`, `/pricing`, `/solutions/campaign-intelligence`, and the insights posts.
- ~20 indexable public routes; 8 insight posts already published.
- Semrush: head terms are tiny but very winnable — "transaction data enrichment" 210/mo (KD 7), "transaction enrichment" 170/mo (KD 6), "transaction categorization api" 110/mo (KD 16), "ai for credit unions" 90/mo (KD 23). "Behavioral intelligence" phrasing has no measurable volume yet, so it becomes the **brand/positioning** layer while the enrichment + personalization terms carry the traffic.

## Keyword architecture

| Layer | Terms | Pages |
|---|---|---|
| Brand position | AI behavioral intelligence, personalization engine for financial institutions | Home, Platform |
| Traffic head | transaction data enrichment, transaction enrichment API, transaction categorization API | Platform, new `/transaction-enrichment` pillar |
| Solution | next best offer banking, bank personalization software, customer intelligence for banks | `/solutions/*` |
| Life events | life event detection banking, life event triggers for banks | `/wealth`, existing insight post |
| Rewards | personalized rewards banking, card-linked offers personalization | `/smartrewards` |
| Audience | AI for credit unions, AI for banks | new FAQ/answer sections |

## What I'll build

**1. Head metadata (sitewide)**
- Rewrite `index.html` title/description/OG/Twitter to the new positioning; add canonical + Organization/SoftwareApplication JSON-LD.
- Extend `SEO.tsx` to accept an optional `jsonLd` prop and optional `keywords`, so each route can ship its own schema.

**2. Per-route metadata rewrite**
Rewrite titles (<60 chars) and descriptions (<160) for all ~20 public routes so each targets a distinct term instead of the current near-duplicate "— Ventus AI" pattern. Add `noindex` to internal/demo routes (`/tepilot/*`, `/internal/*`, `/demo*`, `/deckmo`, `/bankdemo`, `/bank-analytics`, `/app`) so crawl budget goes to marketing pages.

**3. Structured data (the GEO lever)**
- `Organization` + `WebSite` sitewide.
- `SoftwareApplication` on Home and Platform.
- `FAQPage` on Home (the 5 existing FAQs) and on new page-level FAQ blocks.
- `Article` + `BreadcrumbList` on every `/insights/:slug`.
- `BreadcrumbList` on `/solutions/*`.

**4. New pillar page: `/transaction-enrichment`**
The highest-intent, lowest-difficulty term has no dedicated page. Build a substantive page — what enrichment is, MCC vs semantic, the 12 lifestyle pillars, life-event layer, API shape, FAQ — internally linked from Platform, Home, and relevant insight posts. This is the page most likely to actually rank.

**5. Answer-engine content blocks**
On Home, Platform, `/smartrewards`, `/wealth`, and the new pillar page, add short "question → direct answer" sections (40–60 words each, the format AI engines quote): *What is behavioral intelligence in banking? How do banks detect life events from transactions? How does personalization increase card spend?* Each is paired with FAQPage schema.

**6. Crawl + discovery infrastructure**
- Add `scripts/generate-sitemap.ts` wired to `predev`/`prebuild`, emitting every public route plus all 8 insight slugs to `public/sitemap.xml` (base `https://ventusai.dev`).
- Add `Sitemap:` directive to `robots.txt`; keep existing per-bot blocks; explicitly allow GPTBot, PerplexityBot, ClaudeBot, and CCBot (GEO — these must not be blocked).
- Rewrite `public/llms.txt` to the full route list with the new positioning, plus every insight post.

**7. On-page semantics**
Audit each marketing page for a single H1 containing its target term, proper H2 hierarchy, descriptive alt text on imagery, and internal links from Home → pillar → solutions → insights.

## Technical notes

- Client-side Helmet is enough for Googlebot (executes JS) but **not** for social/LinkedIn crawlers, which read only static `index.html`. Per-page social previews would need SSR — I'll set solid sitewide OG tags in `index.html` as the fallback and flag this rather than silently leaving it broken.
- Canonical base stays `https://ventusai.dev` (matches the current `SEO.tsx` and where the site redirects).
- No `og:image` will be invented — hosting injects one at serve time unless you provide an absolute URL.
- No backend or demo logic touched; this is metadata, content, and static-file work only.

## Out of scope unless you say otherwise

Google Search Console verification/sitemap submission (I can run that as a follow-up once you're ready), and any paid-search work.
