## Goal

Make the new positioning statement the single source of truth across the site: signals from **spending behavior, financial behavior, and major life events**, built from **proprietary behavioral enrichment on multi-rail internal data + externally observed signals from national data partnerships**, **orchestrated into the systems banks already run**, delivering **higher interchange, stronger deal redemption, product growth, and retention**.

Three things are currently off-message and will be fixed everywhere: "transaction intelligence platform/layer" language, no mention of external national data partnerships, and no mention of business outcomes.

## 1. Canonical copy source

Add `src/lib/companyCopy.ts` exporting the approved boilerplate in three lengths (one-liner, 2-sentence, full paragraph) plus the outcome list and the three signal families. Every surface below imports from it so future edits happen in one place.

## 2. FAQ overhaul (both FAQ surfaces)

Rewrite the question sets in `src/pages/Index.tsx` (homepage FAQ, also feeds FAQPage schema) and `src/pages/FAQ.tsx` (which is currently stale/short and has no schema at all). One shared, deduplicated set:

- What is Ventus AI? (new description verbatim-aligned)
- What signals does Ventus extract? (spending behavior, financial behavior, major life events)
- Where does the data come from? (multi-rail internal data + externally observed signals from national data partnerships) — new
- What is proprietary behavioral enrichment / how is it different from enrichment vendors?
- How does Ventus orchestrate into the systems we already run? (digital banking, CRM, campaign, rewards, advisor)
- What results can an institution expect? (interchange, deal redemption, product growth, retention) — new
- How does life event detection work?
- Is our data secure?
- Who inside the bank uses it?

`src/pages/FAQ.tsx` also gets the `SEO` component with `faqSchema` + breadcrumbs (it has none today). Answers in `src/pages/TransactionEnrichmentPillar.tsx` get updated for the external-signal and outcomes language while keeping their enrichment-specific keyword targeting.

## 3. Footer

`src/components/Footer.tsx`:
- Replace the brand blurb "The transaction intelligence layer for modern financial institutions." with the one-line version of the new description.
- Add a compact outcomes line (interchange · redemption · product growth · retention).
- Add a "Learn" column grouping so the SEO pillar pages (`/transaction-enrichment`, `/platform`, `/insights`, FAQ) are separate from `/about` and `/contact`, improving internal link structure. Existing links all preserved; `/about` added (currently unlinked from the footer).

## 4. Company description surfaces

- `src/pages/About.tsx`: replace the "What is Ventus AI?" paragraph with the new description, and add an outcomes section (interchange, deal redemption, product growth, retention) plus a data-sources section covering multi-rail internal data and national data partnerships. Add `SEO` with Organization schema (About currently has no metadata).

## 5. SEO / GEO

- `src/lib/seoSchema.ts`: update `organizationSchema.description`, `softwareApplicationSchema.description`/`featureList`, and `knowsAbout` to include external observed signals, multi-rail data, interchange lift, and deal redemption.
- `index.html`: refresh `<meta name="description">`, og/twitter descriptions, and the inline Organization JSON-LD fallback to the new one-liner.
- `public/llms.txt`: rewrite the summary block and key-facts section (inputs now include externally observed signals from national data partnerships; add an Outcomes section). Add `/about` and `/faq` to the page list.
- Per-route descriptions on the highest-value pages (`/`, `/platform`, `/transaction-enrichment`, solutions pages) get the outcome language woven in where it fits naturally without keyword stuffing.
- `scripts/generate-sitemap.ts`: confirm `/faq` and `/about` are present; add if missing. No `lastmod` values will be fabricated.

## Technical notes

- No backend, schema, or business-logic changes — copy, metadata, and JSON-LD only.
- The site currently describes "five signal layers" (spending habits, life events, financial signals, demographics, risk). The new description names three families. I'll keep the five-layer taxonomy as the product-detail view and lead with the three families as the positioning, framing demographics and risk as supporting layers — so the demo UI and pill taxonomy stay untouched and consistent.
- Verification: `tsgo` typecheck plus a Playwright pass on `/`, `/faq`, `/about`, `/transaction-enrichment` to confirm one H1, correct canonicals, and valid JSON-LD.
