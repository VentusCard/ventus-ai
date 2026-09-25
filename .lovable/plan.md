# Beat 8.4: Unified AI Chatbot Phone Wall

## Goal
Make all four Beat 8.4 phones feel like the same banking assistant demonstrating different context-aware conversations, rather than separate app screens.

## Changes
- Keep the existing 8.3 AI assistant phone as the left anchor and preserve its Hawaii conversation and persistence exactly.
- Replace the three custom miniature screens with the same complete phone frame used by the AI assistant, including identical:
  - status/header treatment
  - customer identity
  - four-item bottom navigation bar
  - active AI tab styling
  - outer phone dimensions, border, and wrapping
- Present each additional capability as a conversation inside the AI chatbot:
  - **Financial planning:** a home-purchase planning exchange grounded in Ricky’s goals and travel behavior.
  - **Subscription management:** an exchange identifying recurring payments and the Spotify price change.
  - **Complete financial picture:** an exchange connecting home purchase, business-owner, travel, tennis, and pet-care signals.
- Seed each phone with a concise user question and assistant response so all four examples are immediately visible.
- Keep the text input active in every phone. New typed questions will use the existing live assistant with Ricky’s full context.
- Give each phone its own conversation key so messages never bleed between examples or overwrite the persistent Hawaii conversation.
- Retain the current animation: the original AI phone shifts left, then the other three matching chatbot phones roll in sequentially from the right.
- Preserve the reduced-motion fallback and the current arrow-only deck navigation.

## Chat UI foundation
- Install and compose the documented AI Elements conversation, message, prompt-input, and loading primitives before adapting the shared chatbot surface.
- Preserve the current light visual treatment, dark readable assistant text, high-contrast user messages, markdown rendering, and compact phone sizing.
- Keep assistant messages unfilled and ensure the composer button remains fixed-size, centered, and clear of typed text.

## Validation
- Verify Beat 8.4 shows four matching phone shells and identical navigation bars at 1540×855 and 1920×1080 without clipping or text overflow.
- Verify each phone’s visible content is entirely a chatbot conversation, with no standalone planning/cards screen.
- Verify typing and sending a question works independently in each phone.
- Verify visiting 8.4 does not replay or duplicate the Hawaii question, and returning to 8.3 preserves its conversation.
- Verify 8.3 → 8.4 → 9.1 arrow navigation, staged roll-in, reduced-motion behavior, and a clean build.
