# Section 4: KYC and income within the signal story

## Requested changes
- On both /deckmo Section 4 beats, remove the standalone profile strip containing “Ricky J #45275487” and the age, location, household-income, and relationship-tier line. Keep the slide headline unchanged.
- Add one internal **KYC** parent pill as the first signal in **Demographics**, with lighter nested attributes for **Ricky J**, **Customer ID 45275487**, **Age 34**, **San Francisco, CA 94123**, and **Preferred tier**. Use compact connecting words and the existing nested-pill treatment.
- Move the existing payroll-income signal from Demographics to **Financial**, before investing and savings. Include both payroll income and **Est. annual household income $500K** in its nested details, clearly distinguishing observed salary from the household estimate.
- Preserve the existing payroll values and supporting transactions; this is a placement change, not an income recalculation.

## Details and behavior
- Clicking KYC opens a profile-detail pop-up showing the same existing customer fields. Label it as customer-profile information, not ledger evidence; do not display an empty transaction table or invent verification status, contact details, or other KYC fields.
- The income pop-up retains its payroll evidence and adds the clearly labeled annual household-income estimate.
- Keep five families in their current order, internal pills before external pills, family colors, nested styling, and the two-step reveal. KYC appears with the internal reveal; outside signals and their lead-ins retain their current behavior.
- Preserve the story width, larger left-hand headings, and vertical-space treatment. Adapt connecting prose so both affected rows read naturally after the move.
- Leave Sections 2 and 3, including their customer profile/KYC displays, unchanged. Pill clicks do not navigate slides.

## Technical details
- Reuse `RICKY_KYC_PROFILE` as the single source of profile attributes and the household estimate.
- Update story signal definitions, family placement, clauses, and details in `deckmoScript.ts`, with nested segments in `deckmoSignalAttributes.ts`.
- Remove only the Section 4 profile strip in `RickySignalStory.tsx`; add an explicit customer-profile detail branch so KYC is not treated as a payment rail or inferred transaction signal.
- Update the existing story tests for 15 signals, KYC’s Demographics placement, income’s Financial placement, no duplication, and existing family/external ordering. Add concrete checks for the profile values and the distinction between annual estimated household income and payroll evidence.

## Validation
- Run the relevant deck story, attribute, rail, enrichment, and navigation tests; check the preview for errors.
- Verify both Section 4 beats at 1375×842, 1024×768, and 1903×1024: complete KYC attributes, readable Financial row, no clipped content, intact reveal, and no standalone profile strip.
- Open KYC and income pop-ups, confirm profile facts versus payroll evidence, and verify Sections 2 and 3 remain unchanged.