# Reframe "The Gap" Section Around Behavioral Intelligence + Personalization Orchestration

## Goal
Rewrite the `ProblemStatementSection` ("The Gap") so it clearly states that Ventus provides both behavioral intelligence and personalization orchestration, and restructure the three benefit columns around the user's stated outcomes: win more products, retain for longer, and grow deposits.

## Proposed Changes

### 1. Update `src/components/ProblemStatementSection.tsx`

#### Headline and subheadline
Replace the current headline/subhead with copy that names both capabilities:
- **Headline**: "Banks have transaction data. Ventus turns it into behavioral intelligence and personalization orchestration."
- **Subheadline**: "Understand what customers do, why they do it, and act on it across every channel — automatically and at scale."

#### Three benefit columns
Restructure the existing three-column grid to match the requested outcomes:

| # | Label | Title | Body |
|---|-------|-------|------|
| 01 | WIN MORE PRODUCTS | Win more products. | Behavioral signals reveal the right product for the right customer, so offers convert instead of interrupt. |
| 02 | RETAIN FOR LONGER | Retain for longer. | Early life-event and churn signals let the bank engage before customers start shopping elsewhere. |
| 03 | GROW DEPOSITS | Grow deposits. | Personalized nudges and context-aware prompts steer surplus cash into the bank's deposit products. |

### 2. Keep the existing visual treatment
- White background, `HueField` gradient blobs, and blue accent text remain.
- Three-column responsive grid and large watermark numbers stay the same.
- No new animations, images, or layout changes.

## Outcome
"The Gap" section now reads as a clear value proposition: Ventus delivers behavioral intelligence plus personalization orchestration to win more products, retain customers longer, and grow deposits.
