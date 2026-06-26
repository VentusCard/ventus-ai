## Goal
Make the 5 signal chips inside the Ventus Core card clickable. Selecting one expands a detail panel below the network diagram listing the **actual things Ventus detects** in that family, sourced from the live edge-function logic (not generic placeholders).

## Single file changed
`src/components/tepilot/insights/CapabilitiesView.tsx`

## 1. Extend `SIGNALS` with real detection data

Each entry gains `description` + `items[]` (label + sublabel). Content sourced from `analyze-lifestyle-signals`, `synthesize-persona`, `ventus-classify-transactions`, `ventus-travel-detection`, `generate-lifestyle-signals`, and `ventus-risk-detection`.

**Life Event** — "Major life-stage transitions inferred from merchant-level transaction clusters with minimum-evidence thresholds."
- Home Purchase — Realtor, title/escrow, mortgage, HOA setup, first mortgage payment
- New Baby — OB/midwife, buybuy BABY, pediatrician, daycare, hospital L&D
- Wedding / Engagement — Jeweler ($2k+), venue, bridal salon, photographer, registry
- College Prep for Dependent — SAT/ACT/Kaplan, Common App, bursar deposits, college tours
- Business Formation — LegalZoom/Stripe Atlas, business banking, commercial leasing
- Elder Care — Assisted living, home health aide, geriatric care, hospice, DME
- Retirement Planning — Advisor fees, estate attorney, Medicare supplement, downsizing
- Relocation — Long-distance movers, vehicle shipping, extended-stay 7+ nights, utility setup in new metro
- Inheritance / Windfall — Large one-time inflow + estate attorney or trust services

**Behavioral (Lifestyle Pillars)** — "Recurring spending habits across 11 lifestyle pillars from merchant + subcategory clusters."
- Sports & Active Living — Equinox, Lululemon, REI, fitness classes, team leagues
- Food & Dining — Whole Foods, Starbucks, Chipotle, delivery, meal kits
- Travel & Exploration — Flights, hotels, car rentals, tours, travel insurance
- Home & Living — Mortgage, utilities, Home Depot, furniture, commuting
- Style & Beauty — Zara, Sephora, salon, jewelry, accessories
- Health & Wellness — Doctor visits, pharmacy, therapy, spa, supplements
- Technology & Digital Life — Spotify, Netflix, Adobe, devices, cloud
- Family & Community — Childcare, gifts, religious orgs, kids activities
- Pets — Chewy, vet care, grooming, pet insurance
- Entertainment & Culture — Movies, concerts, museums, books, gaming
- Travel Trip Reconstruction — Anchor + non-home-zip clustering into dated trips with spend breakdown

**Financial** — "Cash-flow, balance, and credit posture inferred from payroll, deposits, and outflow streams."
- Active payroll deposit — Recurring employer ACH on consistent cadence
- Recent large inflow — One-off deposit well above payroll baseline (windfall/bonus)
- Deposit balance trending up — Checking/savings growing across statements
- Investable assets tier — Idle balances above operating-cash needs
- Funds external brokerage — Outbound ACH to Schwab/Fidelity/Robinhood (wallet share)
- Active mortgage payer — Recurring mortgage servicer outflow
- Low credit utilization — Headroom on revolving lines
- Healthy DTI — Debt service comfortably below underwriting thresholds
- Subscription stack load — 10+ active recurring digital subscriptions

**Demographic (Inferred)** — "Household and life-stage attributes inferred from spend patterns, beyond KYC."
- Age range — Bucketed 18–24 / 25–34 / 35–44 / 45–54 / 55–64 / 65+
- Income band — <$50K / $50–100K / $100–150K / $150K+ (from payroll + spend volume)
- Region — Northeast / Southeast / Midwest / Southwest / West / Northwest
- Account tenure — New (<1y), Established (1–5y), Loyal (5+y)
- Likely homeowner — Mortgage, Home Depot/Lowe's, HOA fees
- Parent of young children — Daycare, pediatric, Carter's, infant formula volume
- Parent of school-age — Tuition, kids activities, SAT/ACT prep
- Dual-income household — Two distinct payroll streams
- Pre-retiree / empty nester — Medicare supplement, downsizing, no dependent-linked spend
- Beneficiary reasoning — Spend benefits self vs. dependent vs. third-party gift

**Risk** — "Deterministic keyword/MCC flags for Vice, Financial Distress, and model-routed AML — bucketed with severity scores."
- Adult entertainment — OnlyFans, cam sites, adult processors (CCBill/Epoch), MCC 5967
- Offshore / high-risk gambling — Bovada, Stake.com, Roobet, Curaçao books (weight 5)
- Sports betting — DraftKings SB, FanDuel SB, BetMGM, PrizePicks (weight 3)
- Casino & table games — MGM, Bellagio, Foxwoods, DraftKings Casino (weight 3)
- Payday & short-term credit — ACE Cash Express, Advance America, Earnin, Dave (weight 5)
- Debt collection & relief — Portfolio Recovery, Freedom Debt Relief, bankruptcy filings (weight 5)
- Check cashing & money services — Western Union, MoneyGram, MoneyPak reloads (weight 4)
- Overdraft & NSF activity — Aggregated fee events; severity escalates at 5+
- Subprime credit & rent-to-own — Credit One, OpenSky, Rent-A-Center, DriveTime (weight 3)
- Crypto mixing — Tornado Cash, Wasabi, CoinJoin, Monero exchanges (weight 4)
- Suspicious international — Merchant name contains INTL/OFFSHORE + non-US zip
- AML structuring — Multiple deposits/withdrawals just below $10K (model-routed)
- AML round-number layering — Repeated round-number cash-equivalent patterns
- AML cross-border wires — Wire patterns inconsistent with home zip

## 2. Interaction & UI

- Add `const [activeSignal, setActiveSignal] = useState<string>("Life Event")` — default opens Life Event so the panel is visible on first paint.
- Convert each chip from `<div>` to `<button>` with `onClick={() => setActiveSignal(s.label)}`.
- Selected chip: add `ring-2 ring-white/50 shadow-lg`; unselected: current style + `hover:brightness-110`.
- Render a detail panel **inside the same outer white card**, between the network canvas and the existing footer row, separated by `border-t border-slate-100 mt-6 pt-6`:
  - Header: signal-colored icon tile + signal label (15px bold) + description (12px slate-600) + small badge `{items.length} detections`
  - 2-column grid (`md:grid-cols-2 gap-x-6 gap-y-3`) of items: small colored dot (signal color), label (semibold 12.5px), sublabel (11.5px slate-500)
  - Subtle entrance: `animate-in fade-in slide-in-from-top-1 duration-200`, keyed by `activeSignal` so it replays on switch

## Out of scope
- No navigation, no backend calls, no edits to wires/sources/destinations
- Content is static within the component
