

## Plan: Three-level pill hierarchy — Pillar → Category → Subcategory pills

### What the user wants

Currently pills show **category** names grouped under pillar headers. The user wants:

```text
Travel & Exploration          ← pillar header (colored dot)
  Hotels & Lodging:           ← category sub-header
    [Boutique Hotels] [Resorts]  ← subcategory pills
  Flights:
    [Airlines] [Budget Airlines]
```

### Changes in `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Revert `deriveChips`** to group by subcategory (`label`) again instead of category — each chip represents a subcategory.

2. **Change `chipsByPillar`** to a nested structure: `Map<pillar, Map<category, ChipData[]>>`. For each signal, use `s.category || s.pillar` as the category key, and `s.label` as the subcategory chip label.

3. **Update the rendering** in the pills section to iterate three levels:
   - **Pillar header**: colored dot + pillar name (existing)
   - **Category header**: indented, smaller text showing category name followed by a colon
   - **Subcategory pills**: the actual clickable chips, indented further under the category

4. **Increase font sizes slightly** — pillar header from `text-[9px]` to `text-[10px]`, category header `text-[9px]`, pills remain as-is.

### Files modified
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

