

# Evolving Persona: Progressive Updates With Each Transaction

## What the current code does
The existing script in `enrichment-demo.ts` already has:
- 3 rotating datasets (Urban Professional, Frequent Traveler, Young Family)
- Sequential row reveal (800ms gap between rows, derived columns 300ms after each row)
- Persona appears only AFTER all 5 rows are done
- Everything fades out, then next dataset cycle starts

## What needs to change
The persona panel should update **after each row's derived columns are revealed**, not wait until the end. Each transaction adds a new signal chip and refines the persona title/description.

## Data Structure Change
Replace the single `persona` object per dataset with a `stages` array of 5 progressive states:

**Set A example:**
- After Row 1 (Whole Foods): "Health-Conscious Shopper" + 1 chip
- After Row 2 (Uber Eats): "Digital-First Consumer" + 2 chips
- After Row 3 (Amazon): "Tech-Savvy Shopper" + 3 chips
- After Row 4 (Blue Bottle): "Urban Professional" + 4 chips
- After Row 5 (Netflix): "Urban Professional" + full description + all 5 chips

## Script Logic Change
Inside the `rows.forEach` loop, after each row's derived cells are revealed, add a persona update step:
1. Briefly fade out persona panel (remove `visible` class)
2. After 200ms, swap innerHTML with the next stage's content
3. Fade persona back in (add `visible` class)
4. For row 0, this is the first time the persona appears

The persona panel starts hidden and first appears ~400ms after Row 1's derived columns are revealed.

## Animation Timeline Per Cycle (~10s)

```text
0.0s   -- Row 1 slides in
0.3s   -- Row 1 derived columns fade in
0.5s   -- Persona appears: stage 1 (1 chip)
0.8s   -- Row 2 slides in
1.1s   -- Row 2 derived columns fade in
1.3s   -- Persona updates: stage 2 (2 chips)
1.6s   -- Row 3 slides in
1.9s   -- Row 3 derived columns fade in
2.1s   -- Persona updates: stage 3 (3 chips)
2.4s   -- Row 4 slides in
2.7s   -- Row 4 derived columns fade in
2.9s   -- Persona updates: stage 4 (4 chips)
3.2s   -- Row 5 slides in
3.5s   -- Row 5 derived columns fade in
3.7s   -- Persona updates: final stage (5 chips, full description)
5.7s   -- Everything fades out
6.4s   -- Next cycle begins with new dataset
```

## CSS Addition
Add a brief crossfade class for persona swaps:
```css
.persona-wrap.updating {
  opacity: 0.3;
  transition: opacity 0.15s ease;
}
```

## Files Changed
- **Modified**: `src/components/technology/demos/enrichment-demo.ts`
  - Replace `persona` object with `stages` array in each of the 3 datasets
  - Add persona update setTimeout after each row's derived reveal
  - Add `.updating` CSS class for crossfade effect
  - Keep all existing row animation logic, timing constants, fade-out logic, and cycling logic intact

No changes to `AnimatedDemo.tsx`.

## Full Stage Data

### Set A -- Urban Professional
| Stage | Title | Description | Chips |
|---|---|---|---|
| 1 | Health-Conscious Shopper | Organic grocery preference detected. | Organic Shopper 12x |
| 2 | Digital-First Consumer | Online ordering and delivery patterns emerging. | + Digital-First 8x |
| 3 | Tech-Savvy Shopper | Active online marketplace user with diverse purchase categories. | + Online Marketplace 5x |
| 4 | Urban Professional | Premium brand affinity with specialty coffee habit. | + Coffee Enthusiast 15x |
| 5 | Urban Professional | Health-conscious, tech-savvy consumer with premium brand affinity and subscription-based lifestyle. | + Entertainment Sub 3x, Urban Lifestyle |

### Set B -- Frequent Traveler
| Stage | Title | Description | Chips |
|---|---|---|---|
| 1 | Air Traveler | Airline booking activity detected. | Air Travel 24x |
| 2 | Travel Professional | Hotel loyalty program engagement identified. | + Hotel Loyalty 18x |
| 3 | High-Mobility Professional | Consistent rental car usage across airports. | + Car Rental 9x |
| 4 | Frequent Traveler | Premium travel services and expedited screening. | + Int'l Spend 6x |
| 5 | Frequent Traveler | High-mobility professional with loyalty program engagement and premium travel preferences. | + Business Travel |

### Set C -- Young Family
| Stage | Title | Description | Chips |
|---|---|---|---|
| 1 | Household Shopper | Department store spending pattern detected. | Bulk Shopper 16x |
| 2 | Family-Focused Spender | Pediatric healthcare expenses identified. | + Family Care 11x |
| 3 | Family Entertainment | Family-oriented streaming and entertainment subscriptions. | + Education 8x |
| 4 | Young Family | Wholesale bulk purchasing for household needs. | + Healthcare 5x |
| 5 | Young Family | Household-focused spender prioritizing children's education, healthcare, and family entertainment. | + Suburban Life |

