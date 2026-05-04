## Update `ContactFormDialog` (the "Next Step" modal)

Replace the current two-column layout with a single, centered, breathable slide. No cards, borders, or shadows.

### Layout (top → bottom)

1. **Header** — Ventus logo centered, with the existing tagline ("Future of banking should be both smart and personal") below it in muted slate. Remove the divider bar and bottom border line for a cleaner look.

2. **Middle section** — three stacked blocks, generous vertical spacing (`space-y-10` or `space-y-12`), centered:
   - `BANKING TODAY` (xs, uppercase, tracking-widest, slate-400) → "Generic. Static. The same for everyone." (lg, regular, slate-800)
   - `WITH VENTUS AI` (xs, uppercase, tracking-widest, blue-600) → "Personalized. Intelligent. Built for each customer." (lg, regular, slate-800)
   - `WHAT'S NEXT` (xs, uppercase, tracking-widest, slate-900) → "Autonomous with warmth — banks that know their customers, serve them better." (lg, medium, blue-600)

3. **Bottom section** — large centered navy line (text-2xl, medium, slate-900): "Come find us in the networking hall." Below it, small grey text (text-xs, slate-400): "ventusai.com".

### Structural changes
- Remove the entire right "Learn More" column and the two-column grid.
- Remove the left "Mission" panel chrome (`bg-slate-50`, border, MISSION header).
- Replace `DialogContent` inner with a single padded centered container (e.g., `px-16 py-16` or similar), white background.
- Make the default Radix close button subtle: pass a custom close via styling or hide it (Radix `DialogContent` renders an X by default; override with custom subtle X using `text-slate-300 hover:text-slate-500`, no border/circle). Simplest: rely on default but soften via dialog content child styling, or pass `[&>button]:opacity-30 [&>button]:hover:opacity-60` utility on `DialogContent`.

### File touched
- `src/components/ContactFormDialog.tsx` — replace body content per above. No other files need changes.

### Visual notes
- Manrope font (already inherited via demo page).
- Strict light theme; only blue accents are the `WITH VENTUS AI` label and the `WHAT'S NEXT` value line.
- Keep dialog max width around `sm:max-w-2xl` (narrower than current 5xl) to enforce the airy single-column feel.
