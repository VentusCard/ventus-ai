# Homepage rebuild

Rebuild the marketing homepage around named customer signals, following the section-by-section spec exactly. Copy, numbers, and ordering are used verbatim as given.

## New page order

1. Hero (dark)
2. Outcomes (light)
3. The Signals (dark)
4. One Customer (light)
5. Automated Flows (dark)
6. AI Coworker (light, purple accent)
7. Governance (dark)
8. Integration (light)
9. FAQ (light)
10. Closing CTA (light)
11. Footer (dark)

## Removals

- The "A shared understanding of the customer." section with the Context Plane and the Understand / Decide / Activate trio (`IntelligenceSection.tsx`) is deleted, along with its nav link.
- The current scroll-driven hero is replaced. It renders raw transaction descriptor strings, which the new rules forbid. Its file and any other homepage component that only existed to show descriptor rows are removed so nothing is orphaned.
- `ProblemStatementSection` is replaced by the new Outcomes section.

## Sections

**Hero (dark).** Eyebrow, two-tone headline with "Not why." de-emphasized, subheadline, primary "Schedule Demo" and secondary "See the platform". Right side is a customer signal panel for `cust_013`: a "4 signals" chip in the header, three confidence-marked signal pills (College-Bound Child strong, Frequent Traveler, Young Parent), then a "Next actions" list with the PRODUCT, OFFER, and ALERT rows. No transaction rows anywhere in it.

**Outcomes (light).** Four cards, 4 across on desktop, 2x2 tablet, stacked mobile, with the exact labels and body copy supplied.

**The Signals (dark).** Heading and subheading as given, then the 24 named signals as a dense flowing pill wall with offset rows and four to five accent hues drawn from existing tokens. Below it the four stat items (5 signal families, 12 lifestyle pillars, 9 life-event categories, 14 risk categories) and the low-emphasis evidence line.

**One Customer (light).** Three numbered steps, horizontal with a connecting line on desktop and vertical on mobile, using the Observed / Detected / Acted on copy, plus the centered closing line at larger than body size.

**Automated Flows (dark).** Two columns: left copy paragraphs as written, right a 529 College Savings Plan product card with meta, green Active pill, three trigger rows (label, type, toggle shown on) and the lock-icon footer note.

**AI Coworker (light, purple accent).** Four cards in a 2x2 grid with the supplied copy, then an email mockup: avatar, sender name and address, subject line, a "Daily Digest" purple pill, and a five-column table (Household, Signal, Best-fit product, Annual benefit, Outreach window) with three rows. The table scrolls horizontally on narrow screens instead of overflowing.

**Governance (dark).** Keeps the existing heading and Decision Control panel layout. New subheading and four numbered rows with right-aligned status pills IN SCOPE, EDITABLE, HUMAN REVIEW, RETAINED, plus the closing line under the panel.

**Integration (light).** Keeps heading and subheading, adds the new body line, and splits the diagram into LIVE TODAY (Salesforce Financial Services Cloud, Plaid, REST API with per-institution keys) and SUPPORTED (core processor feeds, data warehouse exports, rewards engines, digital banking apps, with the FIS, Fiserv, Jack Henry, Databricks and Snowflake logos moved here at lower contrast).

**FAQ (light).** The homepage currently has no FAQ section; the FAQ lives on its own route. I will add an FAQ section to the homepage using the existing FAQ content and accordion so the section exists as specified, without changing the FAQ copy or the standalone page.

**Closing CTA (light).** New heading and subheading, existing "Schedule a Demo" button.

**Footer (dark).** Layout kept, description and strip line replaced with the new text.

## Navigation

Floating nav links become Platform, Coworker, Governance, Integrations, Insights, plus the blue Schedule Demo button. Platform anchors to the signals section, Coworker to the AI Coworker section, Integrations to integration, Insights stays a route link. Every anchor resolves to a section that exists.

## Technical notes

- New components under `src/components/home/`: `HeroSection`, `OutcomesSection`, `SignalWallSection`, `OneCustomerSection`, `AutomatedFlowsSection`, `CoworkerSection`. Governance, Integration, CTA, Footer and Navbar are edited in place.
- `src/pages/Index.tsx` composes the new order; SEO metadata is left as is.
- All colors, spacing, and type come from existing Tailwind tokens and the Manrope stack. No new fonts or scales.
- Checks before finishing: no descriptor strings, no em dashes, alternating backgrounds, consistent container width and vertical padding, AA contrast on dark sections, and no horizontal scroll at 1440, 1024, 768, and 375, verified in the browser.
