# Project Architecture Decisions

- Deck-specific autonomous carousel behavior must be enabled through explicit props rather than inferred from presentation mode, so shared phone views remain unchanged outside the deck.
- The deck's raw rail overview derives representative examples and extracted fields from the existing Ricky fixture in a separate helper; keep it scoped to the first two visibility beats so enrichment and signal views retain their original data and behavior.
- Ricky's KYC block and profile heading share structured deck-profile data; keep KYC separate from payment-rail grouping and signal pillars to avoid treating identity fields as transactions or inferred signals.
- Deckmo slide state is authoritative and changes only through explicit arrow controls or its tested keyboard mapping; do not derive deck navigation from scrolling or embedded interactions.
- The combined visibility signal story uses a deck-scoped inline narrative component with evidence on demand; keep other Ricky scenes unchanged to avoid altering The Complete Picture.
