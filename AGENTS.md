# Project Architecture Decisions

- Deck-specific autonomous carousel behavior must be enabled through explicit props rather than inferred from presentation mode, so shared phone views remain unchanged outside the deck.
- The deck's raw rail overview derives representative examples and extracted fields from the existing Ricky fixture in a separate helper; rail blocks appear on beat 2.1 only, while 2.2 shows the KYC block above the rolling raw ledger at the shared roller speed so enrichment and signal views retain their original data and behavior.
- Ricky's KYC block and profile heading share structured deck-profile data; keep KYC separate from payment-rail grouping and signal pillars to avoid treating identity fields as transactions or inferred signals.
- Deckmo slide state is authoritative and changes only through explicit arrow controls or its tested keyboard mapping; do not derive deck navigation from scrolling or embedded interactions.
- The signal story is its own deck section after The Complete Picture with a two-step internal-then-external reveal; it uses deck-scoped natural-height family rows with inline narrative pills and evidence on demand; shared grid rows keep headers aligned without DOM measurements, while other Ricky scenes remain unchanged.
- Signal story wording uses deck-scoped structured attribute and connector segments rendered as noninteractive child labels within one parent button; payment summaries use integer-cent calculations from the existing fixture so observed payments, estimates, and external context remain distinct.
