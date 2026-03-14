
# Update Beat 5 Phase 1 Column Headers

## Changes
Update Beat 5 Phase 1 (the "connected" state) to show the new text as column headers:
- Left column header: "If we truly understand our customers"
- Right column header: "We can then provide a deeply personalized experience"

Keep the existing content structure (Demographics/Transactions on left, Analytics/UX/Rewards/Relationship on right) but add these as prominent column headers above the respective sections.

## Implementation
File: `src/components/demo/DemoPasswordGate.tsx`
- Add the new headers as prominent text above the left and right sections in Phase 1
- Style them as column headers using the existing blue, uppercase, bold pattern from the style guide
- Maintain the "Intent Data" bracket that connects the two columns
- Keep all existing card content and glassmorphism styling

This creates a visual hierarchy: Intent Data bracket connects the sections, with clear headers showing the transformation from understanding customers to delivering personalized experiences.
