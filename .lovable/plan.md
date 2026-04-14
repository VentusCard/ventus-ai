

## Plan: Rollup Cards with Carousel Deals + Boost/Suppress Logic

### Design Concept

Each rollup becomes a standalone card. Inside each card, deals rotate horizontally in a carousel. Each deal has a visual **boost/suppress indicator** showing why it was ranked up or down based on recent spending.

```text
┌─────────────────────────────────────────────┐
│ ✦ Winter Sports Enthusiast    5 deals    ▸▸ │
│                                             │
│  ALREADY PURCHASED (dimmed, struck-through) │
│  ┄┄ Vail Ski Pass ··· ✓ Bought Feb ┄┄┄┄┄  │
│  ┄┄ Giro Helmet  ··· ✓ Bought Mar ┄┄┄┄┄   │
│                                             │
│  ┌────────────────┐  ┌────────────────┐     │
│  │ GoPro Hero 12  │  │ Hestra Gloves  │ ◀▶  │
│  │ 20% Off        │  │ 15% Off        │     │
│  │ "Capture every │  │ "Keep warm on  │     │
│  │  run this..."  │  │  the slopes"   │     │
│  │ ▲ BOOSTED      │  │ ▲ BOOSTED      │     │
│  │ Gap: No action │  │ Gap: No action │     │
│  │ cam detected   │  │ gloves bought  │     │
│  └────────────────┘  └────────────────┘     │
│  ● ● ○                                     │
└─────────────────────────────────────────────┘
```

Each deal card shows a small tag:
- **▲ Boosted** (green) — "Gap detected: no gloves in history" 
- **— Neutral** (gray) — standard relevance
- **▼ Suppressed** (red/dimmed) — "Already purchased: ski pass found in Feb"

Suppressed items appear as a collapsed "Already covered" strip above the carousel, showing what was detected as already purchased, reinforcing the intelligence.

### Changes

**1. Edge function `supabase/functions/generate-next-offers/index.ts`**
- Add spending context per rollup: pass the actual merchants/categories the customer has already spent on within each cluster
- Update the prompt to ask the AI to return a `signal` field per deal: `"boost" | "suppress" | "neutral"` with a short `signalReason` (e.g., "No action cam detected", "Ski pass already purchased")
- Updated output shape per deal: `{ id, merchant, product, rewardValue, message, cta, signal: "boost"|"suppress"|"neutral", signalReason: "short reason" }`

**2. `src/components/exec-demo/NextOfferRationale.tsx`** — Complete redesign:
- Each rollup group becomes a **card** with a header pill and deal count
- **Suppressed deals** render as a compact "Already covered" strip at the top of the card — dimmed merchant names with checkmarks, showing what was detected in their spending
- **Boosted + neutral deals** render in a horizontal **auto-rotating carousel** (using CSS scroll-snap or a simple interval-based slider)
- Each deal card in the carousel includes a small colored signal badge: green "▲ Boosted" with reason, or gray "— Neutral"
- Carousel has dot indicators at the bottom and auto-advances every 4 seconds
- Cards animate in with staggered reveal

**3. Types update in `NextOfferRationale.tsx`**
- `GeneratedOffer` gets two new fields: `signal: "boost" | "suppress" | "neutral"` and `signalReason: string`
- No changes to parent components needed — the grouped structure stays the same

### What stays the same
- The seasonal spend heatmap above remains untouched
- The rollup pills at the very top of the offers section remain
- The strategy header ("X clusters → Y deals") remains
- Parent components (`PurchaseCycleTimeline`, `ExecDemoIntelPanel`, `ExecDemoPage`) need no structural changes — same data flow

