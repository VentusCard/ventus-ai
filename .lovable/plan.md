

## Goal
On the Next-Conversation tab, make each column fill the available height with the "Open" CTA button anchored to the bottom, and bump up text sizes so the content uses the space.

## Changes — `src/components/exec-demo/NextConversationRationale.tsx`

### 1. Column containers (lines 427, 515)
Add `h-full` and `flex-1` so each column stretches; wrap content above the button in a `flex-1` content area to push the button down.

Structure per column:
```
<div className="... flex flex-col h-full">
  <div className="flex-1 space-y-3 overflow-hidden"> ...content cards... </div>
  <button className="w-full ..." />  ← anchored at bottom (no mt-auto needed)
</div>
```

### 2. Larger typography
Bump up the cramped text:
- Section labels (`text-[10px]` → `text-xs`)
- Card headers (`text-[10px]` → `text-sm`, semibold)
- Subjects/triggers (`text-[10px]/[9px]` → `text-sm/text-xs`)
- Bullet items (`text-[10px]` → `text-sm`, slightly more line-height)
- "Knows / Can answer / Personalized prep brief includes" mini-labels (`text-[9px]` → `text-[11px]`)
- Bullet dots: `w-1 h-1` → `w-1.5 h-1.5`
- Card padding: `px-2.5 py-2` → `px-3 py-2.5`
- Card spacing: `space-y-2` → `space-y-2.5`

### 3. CTA buttons (lines 503–513, 592–602)
- Slightly larger: `text-[11px]` → `text-sm`, `py-2` → `py-2.5`
- Remove `mt-auto` (parent flex now handles bottom-anchoring via `flex-1` spacer above)

### 4. Action pills section (Wealth column, lines 557–589)
Keep but slightly larger pill text (`text-[10px]` → `text-[11px]`) so it doesn't look mismatched.

### Verification target
Both "Open AI Banking Assistant" (left) and "Open WM CoPilot" (right) buttons sit on the same horizontal line at the bottom of the panel, regardless of how much content each column has. Content above expands to fill, with readable (~13–14px) text.

### Out of scope
- All-Signals roll-up view (untouched)
- Playbook content / props / data shape

