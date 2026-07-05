# Sources → shared detail panel (like Ventus AI cards)

## Context

On `/bankdemo` → **System** tab (`CapabilitiesView.tsx`), the middle "Ventus AI System" column has two rows of cards — **Signals** and **Teams** — that share one interaction: click a card, it becomes active (ring highlight, mutually exclusive), and a shared detail panel opens below the network canvas with the item's description + an icon-card grid.

The left **Sources** column ("Inputs") currently behaves differently: each card is a self-contained accordion that expands inline into a bullet list. No shared panel, no description, no icon grid.

Goal: give each Source card the same click-to-open behavior, rendering into the **same** detail panel with the **same** format and structure as Signals/Teams.

## Panel format guarantee

The Source detail panel is not a new panel — it is the existing block at rows 974–1104 reused as-is. That means Source expansions get, in this exact order and styling:

1. Top-border separator + fade/slide-in animation (`mt-8 pt-6 border-t border-slate-100 animate-in ...`).
2. Header row: 36px colored icon tile → uppercase kind label ("Source") → bold 15px title → tinted count pill ("N inputs").
3. Description line (`text-[12px] text-slate-600`).
4. Item grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`, each item rendered by the existing icon-card branch (rows 1060–1081) — 8×8 tinted icon tile, 12.5px semibold label, 11.5px sublabel.

No parallel/duplicate panel is introduced. The only additions inside that shared block are:

- Third branch in the kind label ("Source") and count noun ("inputs").
- Optional `nonFcra` amber badge appended to the item card's label row (needed for External Intelligence items).
- Optional "Open Products tab" CTA in the panel header's right side when the active source has `onOpen` (replaces the CTA currently living inside the inline accordion for Bank Context).

Signals and Teams panels are visually unchanged.

## Scope

Frontend only. Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`.

## Changes

1. **Data enrichment.** Add a `SourceDetail`-shaped view mirroring `SignalDetail` (`label`, `icon`, `color`, `tint`, `dot`, `description`, `items[{ label, sublabel, icon, nonFcra? }]`). Enrich the 6 existing source groups (KYC, Transactions, Product Holdings, Digital Banking, External Intelligence, Bank Context) with a one-sentence group description and a short sublabel per input. Emerald palette to match the existing sources column accent (`bg-emerald-500`, `bg-emerald-50 text-emerald-700 border-emerald-200`).

2. **State model.** Add `activeSourceLabel` alongside `activeSignalLabel` / `activeTeamLabel`. Selecting any one clears the other two (three-way mutual exclusion). Extend `activeDetail` / `activeDetailKind` resolution so a source drives the same shared panel.

3. **`SourceGroupCard` refactor.** Remove the inline accordion (rows 572–604). Card becomes a single button that fires `onSelect(provider)`, shows an emerald active-state ring when this source is the active detail (same pattern as Signals/Teams), drops the `ChevronDown`, keeps the pulsing status dot and the header (icon tile + provider + `sublabel · N inputs`).

4. **Shared panel reuse.** No new panel. The existing block at rows 974–1104 renders the source detail through its existing icon-card grid branch. Additions: third kind/count branch, `nonFcra` badge in item card, and Bank Context's `onOpen` CTA moved into the panel header.

## Not in scope

- No changes to Signals, Teams, Destinations, wires, core visual, sidebar, memory files, or `AnalyticsContainer.tsx`.
- No new panel component, no alternate layout for source details.
- Group content stays the same — only per-input sublabels + group description are added.

## Files

- `src/components/tepilot/insights/CapabilitiesView.tsx` — only file touched.

## Technical notes

- Drop `openGroup` state; replace with `activeSourceLabel`.
- `activeDetail = activeSignal ?? activeTeam ?? activeSource`.
- Count noun map: signal → "detections", team → "responsibilities", source → "inputs".
- Kind label map: signal → "Signal family", team → "Team", source → "Source".
- Since every source item has an `icon`, the existing `ItemIcon`-present render branch handles them — no code path forks.
