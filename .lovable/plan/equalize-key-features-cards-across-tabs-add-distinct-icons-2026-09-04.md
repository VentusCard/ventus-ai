# Equalize Key Features Cards Across Tabs + Add Distinct Icons

## Goal
Make all three `/bankdemo` personalization tabs (Personalized Deals, Personalized Product, Personalized Relationship) show the same number of Key features rows, then give every row its own Lucide icon and improve how each row uses its vertical space.

## Current state
- `SurfaceFeaturePanel.tsx` renders the Key features card for all three tabs from one shared `FEATURES` config.
- Row counts are uneven: Deals has 7 rows, Product has 4, Relationship has 4.
- Every row uses the same `Check` icon, top-aligned, with modest text scale.

## Proposed change

### Step 1 — Equalize row counts (target 7 per tab)
Keep the 7 existing Deals rows. Add 3 new rows each to Product and Relationship, written in the same benefit-oriented style and consistent with the platform's existing copy rules (no competitor names, no stress framing, vaguely-specific tone):

**Personalized Product additions:**
- `Eligibility pre-screening` — cards only surface when the customer's profile actually qualifies.
- `Rate and term transparency` — estimated ranges shown up front, tuned to the customer's financial band.
- `Cross-sell sequencing` — products ordered so the next offer follows naturally from the last.

**Personalized Relationship additions:**
- `Conversation memory` — follow-ups pick up where the last exchange left off, across sessions.
- `Goal tracking` — stated goals stay attached to the thread and shape future guidance.
- `Privacy-first grounding` — answers drawn only from this customer's own consented data.

(Final wording to be tuned during implementation; these keep all tabs at 7 rows.)

### Step 2 — Distinct icon per row
Extend the `FEATURES` items with an icon field (Lucide component), e.g.:
- **Deals:** Layers, MessageSquareText, Search, Clock, MapPin, Combine, CreditCard
- **Product:** Zap, Wrench, Palette, Smartphone, ShieldCheck, BadgePercent, ArrowRightLeft
- **Relationship:** Bot, Bell, UserPlus, Shield, MessagesSquare, Target, Lock

Render each icon at `w-4 h-4` inside a small rounded tinted chip so each row has a visual anchor.

### Step 3 — Better space usage
- Vertically center each row's content within its `flex-1` height instead of top-aligning.
- Slightly increase label/detail line-height and padding so the taller rows feel intentional.

### Preserve
Existing reveal animation, disabled/grayscale state with no customer selected, and the full-height card layout.

## Verification
- TypeScript + production build.
- Playwright: screenshot the Key features card on all three tabs; confirm 7 rows each, distinct icons per row, even vertical distribution, and Product/Relationship show the new copy.
