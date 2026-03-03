

# Rename "Customer Engagement" to "Customer Experience"

## Goal
Reframe this product from a campaigns/segmentation tool into a **next-gen banking UX layer** — Ventus powering the customer experience itself, not just marketing to customers.

## Changes

### 1. `src/components/PlatformTabs.tsx` (lines 32-41)

**Current:**
```
label: "Customer Engagement"
heading: "Customer Engagement"
description: "Move beyond batch-and-blast. Build micro-segments..."
capabilities: [life event triggers, lifestyle pillar targeting, AI campaign briefs]
```

**Updated:**
```
label: "Customer Experience"
heading: "Customer Experience"
description: "Power a next-gen banking UX that adapts to every customer. Transaction intelligence drives personalized home screens, lifestyle-aware budgeting, and contextual nudges — making your app feel built for each individual."
capabilities:
  - "Lifestyle-aware interfaces — dynamically adapt app content, budgeting views, and product highlights based on each customer's spending pillars"
  - "Contextual nudges — surface timely insights like over-budget alerts and spending shifts at the moment they matter, inside the banking experience"
  - "Life stage personalization — detect new parents, movers, and retirees from transaction patterns and tailor the entire UX to their current reality"
```

### 2. `src/components/Navbar.tsx` (lines 30-35)

**Current:**
```
title: "Customer Engagement"
desc: "Hyper-targeted campaigns and segments powered by real behavioral intelligence."
```

**Updated:**
```
title: "Customer Experience"
desc: "Transaction intelligence powering personalized banking interfaces, lifestyle-aware budgeting, and contextual nudges."
```

### 3. `src/pages/Engagement.tsx`

Update hero copy to match the new framing:
- Subtitle label: "Customer Engagement" becomes "Customer Experience"
- Headline: "Your bank app." stays, but the italic subline changes from "Personalized to every customer's life." to "Redesigned around every customer's life."

### 4. No route or file rename
The `/engagement` route and `Engagement.tsx` filename stay the same — renaming routes would break bookmarks and is unnecessary for a copy update.

## What This Achieves
- Shifts positioning from "we help you run campaigns" (marketing tool) to "we power the UX" (platform infrastructure)
- The preview card in PlatformTabs (budgeting pillars) already shows a UX concept — the copy now matches
- Differentiates from the campaigns/segmentation features already covered by the SegmentBuilder in tepilot

