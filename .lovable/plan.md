## Plan

### Goal
Add a "Business Owner Identification" input to the **External Intelligence** source group in the CapabilitiesView.

### Change
In `src/components/tepilot/insights/CapabilitiesView.tsx`, insert one new entry into the `inputs` array of the `"External Intelligence"` source group:

- **Label:** Business Owner Identification  
- **Sublabel:** Business ownership flags, registered entity name, and industry classification  
- **Icon:** `Briefcase` (already imported; re-use is acceptable within the same group)  
- **Flag:** `nonFcra: true` (consistent with other third-party enrichment items in this group)

This will increase the External Intelligence input count from 8 → 9 and the total source inputs count accordingly. No other files are affected.

### Icon note
If re-using `Briefcase` in the same group feels confusing, the plan can swap it for a new import (e.g., `Building2` from `lucide-react`) during build. The default proposal above keeps the change minimal.