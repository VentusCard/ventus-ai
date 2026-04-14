

## Make product card pills match Current Holdings size and clickable

### Problem
The "Behavioral:" / "Life Event:" pills above each product card are smaller than the Current Holdings pills and not interactive.

### Changes

**`src/components/exec-demo/NextProductRationale.tsx`**

1. **Add `onPillClick` prop** to the component interface, threading it from `ExecDemoIntelPanel`.

2. **Resize the rolled-up pills** above each card to match the Current Holdings style:
   - Change from `text-[9px]` label + `text-[10px] px-2 py-0.5` pill → use same `text-[10px] font-medium px-2 py-0.5 rounded-full border` styling as Current Holdings pills
   - Use the card's theme color for the pill background/border (matching the existing color scheme)

3. **Make pills clickable**: On click, call `onPillClick(themeToPillar(card.theme), card.signal_label)` to highlight associated transactions in the left panel. Map the card's `theme` to the pillar name used by the filter system (e.g., `travel` → `Travel & Leisure`, `dining` → `Dining & Nightlife`, etc.). Add `cursor-pointer` and hover effect.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

4. **Pass `onPillClick` through** to `NextProductRationale`:
   ```tsx
   <NextProductRationale ... onPillClick={onPillClick} />
   ```

### Theme-to-Pillar mapping
A simple lookup will map card themes to the pillar names used in the signal system:
- `travel` → `Travel & Leisure`
- `dining` → `Dining & Nightlife`
- `fitness`/`wellness` → `Health & Wellness`
- `shopping` → `Shopping & Retail`
- `entertainment` → `Entertainment`
- `home` → `Home & Living`
- `education`/`family` → `Education & Family`
- `retirement` → `Financial Planning`
- `business` → `Business`
- `lifestyle` → `Lifestyle`

