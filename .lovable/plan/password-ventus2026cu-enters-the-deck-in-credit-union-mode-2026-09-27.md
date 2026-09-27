# Password "ventus2026cu" enters the deck in Credit Union mode

## What changes

The deck password page accepts a second password that unlocks the deck **and** switches the presentation to Credit Union terminology in one step.

- `ventus2026` — unlocks the deck in **Bank** mode (also resets any earlier Credit Union choice from this session, so the password always wins)
- `ventus2026cu` — unlocks the deck in **Credit Union** mode ("credit union" / "member" / "Our CU" wording throughout)

The gear-icon dialog keeps working as before — you can still switch modes after entering.

## Technical details

- `src/components/demo/SimplePasswordGate.tsx`: accept both passwords against the same gate; on success call `setInstitutionMode("credit-union")` for the `cu` variant and `setInstitutionMode("bank")` for the standard one (both already exist in `src/lib/institutionMode.tsx` and write `sessionStorage["deckmo_institution"]`).
- Case-insensitive match, trimmed, same as today.
- No other pages affected; `/demo` and `/bankdemo` keep their own passwords/behavior.

## Verification

- Browser test: enter `ventus2026cu` → deck opens with "Our CU" / "member" wording; enter `ventus2026` → deck opens with "Our Bank" / "customer" wording even after a CU session.
- `bunx tsgo --noEmit` clean; build log clean.
