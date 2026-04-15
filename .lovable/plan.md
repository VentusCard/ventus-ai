

## Redesign Offers tab as a premium consumer banking experience

### What
Rewrite `ProductCardsPhoneView.tsx` to feel like a real Chase/Amex mobile offers screen. The two AI-generated cards stay central but are presented with richer context, bigger type, and real-feeling product details — all consumer-facing (no banker jargon).

### Design

**Header**: "Your Offers" with a sparkle accent and subtle "Personalized for you" subline.

**Card 1 (Behavioral)** — Full-width white card with colored left border accent:
- Theme icon + signal label as a subtle category tag (e.g. "Tropical Getaways")
- Product name in bold 15px as the headline
- The AI quote in 13px as the description
- 3 hardcoded benefit bullets based on theme (e.g. travel → "3X points on travel & dining", "No foreign transaction fees", "$100 annual travel credit")
- Estimated annual value line (e.g. "Est. value: $450–$680/yr") from a theme lookup
- Full-width themed "Learn More →" button

**Card 2 (Life Event)** — Same white card layout, softer accent color:
- Same structure: tag → product name → quote → benefits → value → CTA
- Benefits and value come from a `THEME_BENEFITS` / `THEME_VALUE` static map

**Footer**: Tiny "Recommendations based on your financial profile" disclaimer

### Changes

**File: `src/components/exec-demo/ProductCardsPhoneView.tsx`** — Full rewrite (~190 lines)

- Add `THEME_BENEFITS: Record<string, string[]>` with 3 bullets per theme (travel, dining, home, education, retirement, etc.)
- Add `THEME_VALUE: Record<string, string>` with estimated value strings per theme
- Both card types use the same unified layout: white background, 3px left border in accent color, larger padding (p-5), bigger fonts
- Signal label as a small colored tag at top
- Product name: `text-[15px] font-bold`
- Quote: `text-[12px]` italic style
- Benefits: 3 check-mark bullets at `text-[11px]`
- Value: bold accent-colored line
- CTA: full-width rounded button
- Staggered fade-up animation (existing pattern)

No edge function changes. `ProductCard` interface unchanged.

