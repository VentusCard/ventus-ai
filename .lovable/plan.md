## Simplify the capability panels in Next‑Conversation

**File:** `src/components/exec-demo/NextConversationRationale.tsx` (~lines 350–418)

The current 2‑row stack (WHAT IT DOES / WHERE IT PLUGS IN) wastes vertical space with only 3 short bullets each, yet the panel already feels cramped when read. Fix by flattening — no new content, just better use of what's there.

### New layout (same for both AI Banking Assistant and Ventus AI Coworker)

Single panel body, no inner card‑in‑card. A tight two‑column grid:

```text
┌─ Ventus AI Coworker ─────────────────────────────────┐
│                                                      │
│  WHAT IT DOES              │  WHERE IT PLUGS IN      │
│  ─ Digests overnight       │   [Advisor inbox]       │
│    signals → morning brief │   [CRM tasks]           │
│  ─ Builds candidate lists  │   [Approval-gated       │
│    for campaigns           │    outreach]            │
│  ─ Drafts follow-up emails │                         │
│    with evidence attached  │                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Changes

- Remove the two nested `rounded-lg border … bg-*-50/40` sub‑cards; keep only the outer panel border/header.
- Replace `grid-rows-2` with `grid grid-cols-[1.4fr_1fr] gap-6 p-4`.
- Left col: small uppercase label ("WHAT IT DOES" / "CONTEXT IT HAS"), then a clean bullet list — icon + one line each, comfortable line-height, no forced `justify-around` stretching.
- Right col: small uppercase label ("WHERE IT PLUGS IN" / "CONVERSATIONS IT HANDLES"), then the chips stacked in a natural `flex flex-wrap gap-1.5`, top-aligned (not vertically centered).
- Drop the per-section header icons (Briefcase / PlugZap / Database / MessageCircle) — the panel header icon is enough. Keep the small bullet/chip icons.
- Text sizes unchanged (12px body, 11px chips, 11px uppercase labels).
- Colors/tokens untouched (purple for coworker, blue for assistant; strict light theme).
- No prop, data, or behavior changes; no other files touched.

Result: same information, half the visual chrome, content sits naturally at the top of the panel instead of being stretched to fill two boxes.
