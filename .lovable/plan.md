Add a **7th message** to the thread as closure: Ventus AI delivers the prep sheet (angle + 3 talking points + short intro) for both clients in reply to the advisor's final ask.

## File
`src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx`

## Change
Append one more entry to the `REPLY_MESSAGES` array after the current last message ("Please. Angle, 3 talking points…"):

- **Sender:** `ventus`
- **Time:** `10:19 AM`
- **Nav label:** `10:19`
- **Subject prefix:** `Re: `
- **Quoted strip:** `Morgan, 10:07 AM — Angle, 3 talking points, and a short intro paragraph per client…`
- **Body (per client, using `nameA/nameB/labelA/labelB`):**
  - Short opening line: "Prep sheets below — logged both as follow-ups."
  - For each client (rendered as a labeled block):
    - **Angle** — one sentence positioning the conversation
    - **Talking points** — 3 concise bullets (curiosity-led, no product pitch)
    - **Intro paragraph** — 3-sentence draft the advisor can paste, warm and neutral
  - Closing line: "Ping me if you want either sheet reshaped after the calls."

## Copy guardrails
Same as prior turns — vaguely specific behavioral language, no timing pressure, no product push, no competitor/infra references, reference each client by name.

No other files change; the nav strip picks up the new pill automatically since it maps over `REPLY_MESSAGES`.