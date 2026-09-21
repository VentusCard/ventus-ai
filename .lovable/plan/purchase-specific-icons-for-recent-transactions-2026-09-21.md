# Purchase-specific icons for Recent Transactions

## Goal
Make each recent transaction visually recognizable by what it represents, while retaining the existing rail labels and colors.

## Changes
- Replace the current rail-based `ReceiptText` / `Landmark` icon choice with an explicit purchase icon on each transaction row:
  - Courtside Tennis Club: sports icon
  - City Utilities: utilities/home icon
  - Mia Chen shared expense: person-to-person payment icon
  - Cash withdrawal: cash icon
  - Greenfield Landscaping: home/landscaping icon
  - Escrow — Home Closing: home purchase icon
- Keep CARD, ACH, RTP, ATM, CHECK, and WIRE as the small colored rail chips; rail remains useful context but no longer determines the main icon.
- Preserve the current row layout, colors, expansion details, copy, ordering, and interactions.

## Technical details
- Add a typed icon key to each item in the existing Immediate Value activity data.
- Map those keys to Lucide icons inside the recent-transactions tab and render the selected icon using the existing colored icon container.
- Do not change other slides or navigation.

## Verification
- Confirm all six rows show distinct, purchase-relevant icons.
- Confirm row expansion still works and the slide fits at the current presentation viewport.
- Confirm type checking and the preview build remain clean.
