

# Ventus AI Intelligent Orchestration — Hero Animation Redesign

## Overview
Complete rewrite of `EnrichmentMockup.tsx` into a multi-customer, multi-phase orchestration showcase. The card cycles between two customer profiles, each demonstrating the full Ventus pipeline: demographics + rapid transaction ingestion, then 4 intelligence output cards, followed by a horizontal 3D page-flip to the next customer.

Credit card sources are anonymized — shown as generic labels like "Card ending ••4821" or "Checking ••7390" instead of real brand names.

---

## Data — Two Customer Profiles

### Customer 1: "The Homeowner"
- **Demographics**: Michael R., 42, Family of 4, Wellesley MA, High Income
- **Transactions** (~20, from anonymized accounts):
  - **Card ••4821**: Home Depot $847, Lowe's $312, Pottery Barn $1,245, Restoration Hardware $2,180, Ferguson $489, Sherwin-Williams $167
  - **Card ••9053**: Vail Resorts $3,200, United Airlines $1,890, Delta Sky Club $45, Marriott Bonvoy $892
  - **Checking ••7390**: Whole Foods $187, Trader Joe's $94, Blue Apron $62, Peloton $44
  - **Card ••2156**: Benjamin Moore $234, Houzz Pro $89, West Elm $567, Crate & Barrel $423, Ace Hardware $78
- **Output Cards**:
  1. **Dynamic Persona** (purple accent): Urban homeowner, high-spend renovation, annual ski trips, health-conscious family
  2. **Analytics Intelligence** (blue accent): "Recommend Premium Home Equity line — spending indicates major renovation ($8K+ in 6 weeks)"
  3. **Smart Rewards** (emerald accent): Home Depot 5% cashback, Lowe's bonus points, Vail ski pass deal, Whole Foods family bundle
  4. **Relationship Intelligence** (amber accent): "Life Event: Major Home Renovation from 8 transactions across 3 accounts. Sent meeting prep to wealth advisor."

### Customer 2: "The New Parent"
- **Demographics**: Sarah & David L., 34, Growing Family, Brooklyn NY, Upper-Middle Income
- **Transactions** (~20, from anonymized accounts):
  - **Card ••3347**: Buy Buy Baby $234, Amazon Baby Registry $189, Pottery Barn Kids $567, Hanna Andersson $89, Carter's $124
  - **Card ••8812**: Whole Foods $203, Instacart $87, DoorDash $142, Sweetgreen $34, Blue Apron $62
  - **Checking ••5501**: Walgreens $67, CVS $45, Walgreens $52, One Medical $250
  - **Card ••6274**: Babylist $312, Snoo Rental $159, Owlet $299, Uppababy $1,049, 529 Plan $500
- **Output Cards**:
  1. **Dynamic Persona** (purple): New parent, nesting phase, health-focused, meal delivery reliant, financial planner
  2. **Analytics Intelligence** (blue): "Recommend family rewards card — baby spend is 40% of wallet. Projected annual value: $1,200"
  3. **Smart Rewards** (emerald): Buy Buy Baby 8% cashback, Whole Foods family discount, One Medical family plan, 529 match
  4. **Relationship Intelligence** (amber): "Life Event: New Baby from 12 transactions across 4 accounts. Sent family planning package to advisor."

---

## Animation Flow (per customer, ~10s total)

| Phase | Duration | Left Panel | Right Panel |
|-------|----------|------------|-------------|
| 1. Demographics | ~1s | Profile card fades in (name, age, family, location, income) | Empty |
| 2. Transaction Scroll | ~3s | Rapid-scroll animation of ~20 transactions with small "Card ••XXXX" badges, settling on last ~6 visible | Subtle "Processing..." shimmer |
| 3. Intelligence Cards | ~4s | Settled transactions remain | 4 cards appear staggered (500ms apart) |
| 4. Hold | ~2s | Full state visible | All 4 cards displayed |
| 5. Page Flip | ~0.8s | 3D rotateY transition out | Next customer rotates in |

---

## Component Layout

```text
+----------------------------------------------------+
| [*] Ventus AI Intelligent Orchestration       Live  |
+----------------------+-----------------------------+
| CUSTOMER PROFILE     |  INTELLIGENCE OUTPUT        |
| Michael R., 42       |                             |
| Family of 4, MA      |  [Persona Card]             |
| High Income          |                             |
|                      |  [Analytics Card]           |
| TRANSACTION FEED     |                             |
| [••4821] Home Depot  |  [Rewards Card]             |
| [••9053] United Air  |                             |
| [••7390] Whole Foods |  [Relationship Card]        |
| ...rapid scroll...   |                             |
+----------------------+-----------------------------+
```

---

## Technical Details

### File Changed
- **`src/components/hero/EnrichmentMockup.tsx`** — Complete rewrite

### Implementation
- Header renamed to "Ventus AI Intelligent Orchestration", keeps green pulsing dot + "Live" badge
- Card width increased from 480px to ~540px
- State machine with phases: `profile` -> `scroll` -> `cards` -> `hold` -> `flip`
- Customer index alternates 0, 1, 0, 1...
- Transaction rapid scroll uses CSS `@keyframes` translateY animation, then settles
- Each account shown with a small gray pill: "Card ••4821" (no real brand names)
- Right panel: 4 compact mini-cards with colored left border accent (4px), staggered `animation-delay`
- 3D page flip via `transform: perspective(1200px) rotateY(...)` with CSS transition
- Timeout scheduling via existing `useRef` array cleanup pattern
- Component remains hidden on mobile (parent already has `hidden lg:flex`)
