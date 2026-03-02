

## Replace "How It Works" with Animated Architecture Diagram

Replace the current "How It Works" section (BeforeAfterAnimation) on the homepage with an animated, interactive architecture diagram inspired by the pitch deck slide. The diagram shows how Ventus Suite plugs into a bank's existing infrastructure across three pillars, flowing down to a Personalized Banking Experience.

### Content Structure (top to bottom)

1. **Bank Partner Database** -- rounded card at top: "BANK PARTNER DATABASE" + "Existing Transaction Data"
2. **Connector line** down to...
3. **Ventus Suite** -- bold blue bar
4. **Three connector lines** branching to three pillar columns
5. **Three Pillars** side by side (stacked on mobile):
   - **Analytics and Targeting**: Existing Stack (BI Dashboards, Segment Tools, Data Warehouse) vs Ventus (Persona Dashboards, Behavioral Segmentation, Smart Budgeting Tools, Targeted Campaigns)
   - **Rewards and Deals**: Existing Stack (Card Reward Programs, Reward Aggregators like CardLinx/Figg, Partner Portals) vs Ventus (Lifestyle-Matched Offers, Real-Time Deal Matching, Personalized Rewards Experience)
   - **Wealth and Relationship**: Existing Stack (Salesforce/HubSpot, Planning Software like eMoney) vs Ventus (External account aggregation e.g. Plaid, Holistic budgeting, Proactive Life Event Alerts, WM CoPilot Suite, Automated Meeting Prep) -- **added: "Connect external accounts at other banks"**
6. **Connector lines** down from each pillar to...
7. **Personalized Banking Experience** -- amber/orange banner with four pills: Next Gen UX, Lifestyle Budgeting, Personalized Rewards, Relationship Intelligence

### Animation Flow
- Elements appear in a staggered top-to-bottom sequence as the section scrolls into view
- Bank Partner Database fades in first
- Connector lines animate downward (draw effect)
- Ventus Suite bar slides in
- Three pillars fade in left-to-right with slight delay
- Within each pillar, existing stack appears first, then Ventus card with a slight scale-in
- Bottom banner slides up last
- Subtle arrow pulse animations on connector lines

### Visual Design
- Section label: "HOW IT WORKS" in blue uppercase
- Headline: "A modular intelligence layer that works with your existing stack."
- Dark navy (#0f172a) cards for Ventus capabilities, white/light gray for existing stack
- Blue accent (#2563EB) for Ventus labels and connector lines
- Amber/orange (#f59e0b) gradient for the bottom Personalized Banking Experience bar
- Clean enterprise aesthetic matching site theme

### Mobile Responsiveness
- Three pillars stack vertically on mobile
- Each pillar's existing/Ventus pair displayed side by side within a card
- Connector lines simplified to vertical arrows on mobile

### Technical Details

| File | Change |
|------|--------|
| `src/components/ArchitectureDiagram.tsx` | **New file** -- the full animated architecture diagram component |
| `src/pages/Index.tsx` | Replace BeforeAfterAnimation import/usage (lines 65-79) with ArchitectureDiagram |

The BeforeAfterAnimation component file remains untouched (still used on /enrichment page's "Learn More" link target). Only the Index.tsx reference changes.

