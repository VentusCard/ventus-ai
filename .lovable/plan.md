

## Add "Your Financial Snapshot" + 3 Info Cards to Membership Tab

### What
Redesign the top portion of the Membership tab to match the reference screenshot: a "Your Financial Snapshot" card showing 4 holdings, followed by a row of 3 compact cards (Your Relationship, Deals for You, Financial Wellness).

### Layout
```text
┌──────────────────────────────────┐
│ Welcome, Sarah · Preferred Member│
├──────────────────────────────────┤
│ ○ Your Financial Snapshot        │
│ $Savings  $Credit  $Mort  $Inv   │
│  $85K      $15K     $0    $550K  │
├──────────┬──────────┬────────────┤
│ ☆ Your   │ 🎁 Deals │ ✦ Financial│
│ Relation │ for You  │  Wellness  │
│ Valued   │ REI Co-op│   (78)     │
│ member   │ 10% back │ • Emergency│
│ since    │ on outdoor│  fund:Strong│
│ 2018     │ gear     │ • Debt: Imp│
│ 📍 Open  │          │ • Savings  │
│ til 6 PM │          │   On track │
├──────────┴──────────┴────────────┤
│ Advisor card + AI Tip (keep)     │
└──────────────────────────────────┘
```

### Changes

**File: `src/components/exec-demo/RelationshipPhoneView.tsx`**
- Replace the "Total Relationship + Segmented Bar" card with a **"Your Financial Snapshot"** card: section header with a circle icon, then a 4-column grid showing each holding type (icon, label, dollar amount) using the existing `HOLDING_META` and `parseCurrency` helpers
- Replace the "Financial Wellness Score" card with a **3-column grid** of compact cards:
  1. **Your Relationship** — star icon, "Valued member since 2018", branch location + open hours
  2. **Deals for You** — gift icon, a contextual deal based on customer's top pillar (e.g., "REI Co-op · 10% back on outdoor gear")
  3. **Financial Wellness** — circular score badge (reuse `computeWellness`), 3 abbreviated status lines with colored text (Strong/Improving/On track)
- Keep the Advisor Card and pinned AI Financial Tip unchanged
- Style cards with existing `rounded-xl bg-slate-50 border border-slate-100` pattern, compact text sizing consistent with the phone mockup

Single file change.

