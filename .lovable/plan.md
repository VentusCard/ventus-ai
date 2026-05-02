# Fix the chatbot welcome greeting

The phone-mockup AI chatbot currently shows the literal text **"Hi {firstname}! 👋"** because the placeholder was never wired up to a real value. We'll replace the awkward greeting with a clean, name-free welcome and also drop the lingering "Bank of America product info is used as reference" disclaimer underneath.

## Change

In `src/components/demo/ConsumerAIChatView.tsx` (the welcome state at lines ~336–355):

- Replace `Hi {firstname}! 👋` with `How can I help today?`
- Keep the helper paragraph and the quick-action chips as-is
- Remove the small disclaimer line `"This chatbot is not connected to a bank. Bank of America product info is used as reference."` (residual BoA reference now that the demo says "Our Bank")

No other files need changes.
