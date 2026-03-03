

# Engagement Demo: Right Panel Bank App Mockup

## Overview
Replace the right panel's "Engagement Triggers" list with a mobile banking app mockup styled with browser chrome (traffic light dots + address bar), showing the personalized consumer experience Ventus intelligence powers.

## Changes (single file)

### File: `src/components/technology/demos/VentusEngagementDemo.tsx`

**Remove**: The `engagementTriggers` data array and the entire right panel rendering (lines 19-25, 148-190).

**Add**: A new right panel containing a browser-chrome-framed mobile banking app with:

1. **Browser chrome header** (matching PlatformTabs style):
   - Three traffic light dots (red, yellow, green)
   - Mono URL: `metrobank.com/app`

2. **App header inside the frame**:
   - "Metro Bank" label
   - "Good morning, Sarah" greeting
   - "Your personalized banking experience" subtitle

3. **Section 1 -- Lifestyle Profile Banner**:
   - Full-width card with blue-to-purple soft gradient background
   - Bold "WELLNESS EXPLORER" label in white
   - Subtext: "You balanced fitness, healthy dining, and travel this quarter"
   - Small "Powered by Ventus AI" in bottom-right corner, muted

4. **Section 2 -- "FOR YOU" Personalized Offers**:
   - Small uppercase "FOR YOU" label
   - Three offer rows with the same card styling as the left panel:
     - REI Co-op -- "Get 10% back on outdoor gear" with "Outdoor" tag
     - Sweetgreen -- "$5 off your next order" with "Dining" tag
     - Equinox -- "First month free" with "Wellness" tag
   - Each row includes a small match percentage indicator

5. **Section 3 -- Contextual Nudge**:
   - Small alert-style card with a sparkle icon
   - Text: "Your Wellness spend is 28% higher this month -- you're on track for your fitness goal"

**Animation**: The right panel fades in when `triggersVisible` becomes true (same trigger as current). Offer rows stagger in with incremental delays.

**Below the split panel** (before the Replay button): A centered italic gray caption: "The bank app experience above is powered entirely by Ventus transaction intelligence -- no manual configuration required."

**Keep unchanged**: Header bar, left panel, animation logic, Replay button, all state management.
