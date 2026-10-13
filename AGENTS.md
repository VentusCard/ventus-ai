# Project Architecture Decisions

- Deck-specific autonomous carousel behavior must be enabled through explicit props rather than inferred from presentation mode, so shared phone views remain unchanged outside the deck.
- The deck's raw rail overview derives representative examples and extracted fields from the existing Ricky fixture in a separate helper; keep it scoped to the first two visibility beats so enrichment and signal views retain their original data and behavior.
