## Refocus Campaign Studio preview on the 3-2-1 Cash Rewards card

Rework `/solutions/campaign-intelligence`'s `CampaignStudioPreview` so the entire flow revolves around a single **Cash Rewards Card (3-2-1)** — no product picker, no brand name, and the output is a **set of segmented email drafts** rather than one generic brief.

### The product (static, always shown)
- Name: **Cash Rewards Card**
- Mechanic: **3% on your top spending category · 2% on your second · 1% everything else**
- Perks: **$0 annual fee · $200 online cash rewards after $1,000 in the first 90 days**
- No bank name anywhere in copy.
- Replaces the current "Selected Product" blue card. No dropdown, no `PRODUCT_CATALOG` lookup.

### Signal builder (left column) — unchanged structure
- Keep Life Events, Spending Habits, Financial Signals, Demographics chips + Age/Income.
- Default selections tuned to the 3-2-1 story:
  - Spending Habits: `Dining & Nightlife`, `Grocery & Household`, `Gas & Fuel` (the three most common 3%/2% picks).
  - Life Events: `family`.
  - Financial Signals: none (greyed context; not the driver for card offers).
  - Demographics: `New Parent / Family Formation`; Age `35-44`; Income `$75k-$150k`, `$150k-$250k`.

### Output (right column) — segmented email drafts
Replace the single "Campaign Brief" panel with a **stacked list of 3 email drafts**, one per micro-segment derived from the selected Spending Habits. Each draft shows:
- Segment chip (e.g. "Dining-led households") + estimated reach count.
- Subject line.
- 2–3 line body preview with the personalized 3%/2% framing and a value-math line.
- Small footer row: channels (Email, Mobile Push, In-App).

Default 3 drafts:
1. **Dining-led** — 3% Dining pick, 2% Grocery. Value math: "~$280/mo dining + ~$650/mo grocery ≈ **$237/yr** vs a flat 1% card."
2. **Grocery-led family** — 3% Grocery pick, 2% Gas. Value math: "~$850/mo grocery + ~$220/mo gas ≈ **$359/yr**."
3. **Commuter** — 3% Gas pick, 2% Dining. Value math: "~$320/mo gas + ~$180/mo dining ≈ **$158/yr**."

Drafts are derived from which Spending Habits are selected — toggling habits recomputes which of the 3 drafts render (max 3, min 1). "Generate" still shows the spinner and re-reveals the list.

### Notes
- Content + layout change only; no routing, no new files.
- Audience estimator wiring stays the same; total reachable count still shows in the header.
- No brand references anywhere.
