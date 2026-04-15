

## Simplify Relationship tab: advisor card with subtle nudge

### What
Strip out the entire life-event card (suggestions, CTAs, event header) and replace it with just the James Rivera advisor card featuring a subtle, warm nudge line like "Major milestone ahead? Let's plan together."

### Changes

**File: `src/components/exec-demo/RelationshipPhoneView.tsx`**

1. **Remove** the entire life-event card block (lines 144-210) — the event header, two-column grid with suggestions, CTAs, and the nested advisor section
2. **Remove** unused imports and data (`EVENT_META`, `EVENT_KEYWORD_MAP`, `resolveEventMeta`, `DEFAULT_META`, event-specific icons like `Sunset`, `GraduationCap`, `Gift`, `Briefcase`, `Baby`, `Heart`, `Sparkles`)
3. **Replace with** a simple, clean advisor card after the divider:
   - Rounded card with `bg-slate-50`, `p-3`
   - Row layout: JR avatar circle (left) + name/title (middle) + buttons (right)
   - Below the name row: a single subtle italic line — `"Major milestone ahead? Let's plan together, {firstName}."`
   - Two small buttons: Schedule + Message (same style as current)
4. Keep `detectedLifeEvents` prop for the `onGoToAI` message context (uses first event name if available)

### Result
```text
┌──────────────────────────────┐
│ Welcome, Sarah               │
│ ● Preferred Member           │
├──────────────────────────────┤
│ [Savings] [Credit]           │
│ [Mortgage][Investments]      │
│ ★ Member since 2018     📍  │
├──────────────────────────────┤
│ (JR) James Rivera            │
│      Senior Relationship Mgr │
│ "Major milestone ahead?      │
│  Let's plan together, Sarah."│
│      [Schedule] [Message]    │
└──────────────────────────────┘
```

Compact, subtle, fits without scrolling. One file change.

