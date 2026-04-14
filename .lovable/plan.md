

## Plan: Scale up the middle section content

### What changes

Increase font sizes, spacing, and element sizes throughout the middle intel panel so content fills the available space better and feels less cramped.

### Changes in `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Outer container** (line 244): Increase padding from `px-5 py-2` → `px-6 py-4`

2. **Persona card** (line 247): Increase padding from `px-4 py-3` → `px-5 py-4`, margin `mb-2` → `mb-3`

3. **Description text** (line 262): `text-[11px]` → `text-[13px]`

4. **Synthesize button** (line 272): `text-[12px] px-5 py-2.5` → `text-[13px] px-6 py-3`

5. **Behavioral Intelligence button** (lines 270-289): `text-[11px]` → `text-[13px]`, icon `w-4 h-4` → `w-5 h-5`

6. **Rollup pills section** (line 297): `gap-2 mb-2` → `gap-2.5 mb-3`

7. **Signal breakdown toggle** (line 306): `text-[10px]` → `text-[11px]`, `mb-2` → `mb-3`

8. **Pillar rows** (line 323): `py-1.5` → `py-2.5`

9. **Pillar left column** (line 326): `w-[90px]` → `w-[100px]`, pillar dot `w-1.5 h-1.5` → `w-2 h-2`, pillar name `text-[10px]` → `text-[12px]`

10. **Right column categories + subcategories** (line 331): `gap-1` → `gap-1.5`
    - Category pills (line 336): `text-[10px] px-2 py-0.5` → `text-[11px] px-2.5 py-1`
    - Subcategory text (line 355): `text-[11px]` → `text-[12px]`
    - Count/spend spans: `text-[10px]` → `text-[11px]`

11. **Tab bar** (line 383): `p-0.5 mb-1` → `p-1 mb-2`, tab buttons `text-[11px] py-2` → `text-[12px] py-2.5`, icons `w-3.5 h-3.5` → `w-4 h-4`

### Files modified
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

