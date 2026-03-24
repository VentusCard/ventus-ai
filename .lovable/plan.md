

## Remove Emojis from Nested Sub-Cards, Keep Cards Full Width

**File**: `src/components/demo/DemoPasswordGate.tsx`

### Changes

**Lines 521**: Remove `max-w-xl` from the container so the three cards span the full width of the beat section.

**Lines 530, 541, 551, 561–562, 571–572, 582–583**: Keep the header emojis (🎁, 🤝, 📱) on the three main cards, but remove the emoji `<span>` from each nested sub-card — leaving only the bold text label.

Result: three full-width cards, each with a 4-column grid of text-only nested cards.

