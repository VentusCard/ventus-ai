# Section 1 — add a standard filters sidebar (~30% on the right)

Reshape `ProductPickerSection` from a single column into a 2-column grid: product search/detail on the left (~70%), a new **Audience filters** sidebar on the right (~30%) holding the standard demographic filters.

## Layout

```text
┌──────────────── Section 1 ────────────────────────────────┐
│ ┌───────────────────────────────┐ ┌─────────────────────┐ │
│ │ Search + selected product     │ │  Audience filters   │ │
│ │ detail (tagline, fee,         │ │  (age, income,      │ │
│ │ positioning)                  │ │   gender, region,   │ │
│ │                               │ │   household)        │ │
│ │  ~70% width                   │ │  ~30% width         │ │
│ └───────────────────────────────┘ └─────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

Implementation: wrap the existing content in `grid grid-cols-10` — left column `col-span-7`, right column `col-span-3`. Sidebar is sticky-feeling (`self-start`) with its own header.

## Filters in the sidebar

Compact controls, all light-theme:

1. **Age range** — `Slider` (range), 18–85, default 25–65. Read-out: "25 – 65".
2. **Household income** — `Slider` (range), $0–$500K with $10K steps, default $50K–$200K. Read-out formatted as "$50K – $200K".
3. **Gender** — `ToggleGroup` (multi): Female / Male / Other. All on by default.
4. **Region** — `Select` with US census regions: Northeast / Midwest / South / West / All regions (default).
5. **Household type** — checkbox list: Single, Couple, Family with kids, Empty nester. All checked by default.

A muted "Reset filters" link sits at the bottom of the sidebar.

State is local to `ProductPickerSection` (no parent wiring) — these filters are presentational for now and do not feed into the funnel math in Section 2. A small footnote under the filters reads: *"Applied to the addressable audience in Section 2."* This keeps the change scoped to UI, matching the user's request.

## Files to edit

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — wrap children in the 7/3 grid and add an inline `AudienceFiltersSidebar` sub-component with the controls above. Uses existing shadcn `Slider`, `Select`, `ToggleGroup`, `Checkbox`, `Label`.

No changes to Sections 2 or 3 or to the parent view.
