# Daily planning with Linear

A simple morning routine so you always know what to work on.

---

## 5-minute morning routine

1. **Run today's digest** (terminal):
   ```bash
   export LINEAR_API_KEY="lin_api_..."   # or add to ~/.zshrc
   npm run today --prefix scripts/linear
   ```

2. **Open Linear** → **Engineering** → **My issues**

3. **Pick 3 tasks** — assign yourself, add label **`today`**

4. **Move one to In Progress** — only one active task when possible

5. **Copy** [`docs/templates/daily-plan.md`](templates/daily-plan.md) if you want a written note for the day

---

## Terminal commands

From repo root:

```bash
# Full daily view: in-progress + today label + urgent/high + blocked
npm run today --prefix scripts/linear

# Only issues assigned to you
npm run today --prefix scripts/linear -- --mine

# Only Urgent + High (minimal list)
npm run today --prefix scripts/linear -- --focus
```

### Optional shell alias

Add to `~/.zshrc`:

```bash
export LINEAR_API_KEY="lin_api_xxxxxxxx"
export LINEAR_TEAM_KEY="ENG"
alias ventus-today="npm run today --prefix ~/Ventus/ventus-ai/scripts/linear"
```

Then each morning: `ventus-today`

---

## Linear setup (one-time, ~10 min)

Create these **custom views** in Engineering → **Views** → **New view**:

### 1. Today

| Filter | Value |
| --- | --- |
| Labels | `today` |
| State | not Done, not Canceled |

Pin to sidebar. **This is your daily board.**

### 2. P0 Go-Live

| Filter | Value |
| --- | --- |
| Priority | Urgent |
| State | not Done |

### 3. Blocked

| Filter | Value |
| --- | --- |
| Labels | `blocked-external` |
| State | not Done |

### 4. My active work

| Filter | Value |
| --- | --- |
| Assignee | Me |
| State | In Progress |

---

## How to use labels

| Label | When to use |
| --- | --- |
| **`today`** | Pin to today's focus (max 3–5 issues) |
| **`p0`** | Go-live blocker — already on imported issues |
| **`blocked-external`** | Waiting on Travis, legal, Yusheng, etc. |
| **`star-pilot-may-2026`** | All imported roadmap issues (filter the batch) |

Add **`today`** each morning; remove it when done or at end of day.

---

## Weekly rhythm (Cycles)

1. Linear → **Engineering** → **Cycles** → **New cycle**
2. Name it e.g. `Week 3 — Staging + STAR integrations`
3. Drag **Urgent/High** issues from backlog into the cycle
4. Each Monday: close cycle, start new one, run `npm run week --prefix scripts/linear` (optional)

---

## Priority rules (what to pick first)

| Order | Work type | Examples |
| --- | --- | --- |
| 1 | **P0 + blocking STAR** | Staging schema, webhook payloads, Jack Henry |
| 2 | **In progress** | Finish before starting new work |
| 3 | **Labeled `today`** | What you committed to |
| 4 | **Urgent unassigned** | Assign yourself if you're the owner |
| 5 | **High** | Portal, infra hardening |
| 6 | **Blocked** | Follow up externally, don't build around blindly |

---

## Assign issues to yourself

In Linear: open issue → **Assignee** → your name.

Or bulk-select in a view → **A** → assign.

The `npm run today` script surfaces:
- Your assigned open issues
- Unassigned **Urgent/High** (so nothing falls through)
- Issues labeled **`today`**
- **`blocked-external`** separately

---

## End of day (2 min)

1. Mark finished issues **Done**
2. Remove **`today`** label from incomplete items (re-add tomorrow if still relevant)
3. Leave a comment on **blocked** issues if you chased someone
4. Optional: fill **End of day** section in daily plan template

---

## This week's default focus (Week 3)

If you're not sure what to pick, start here:

1. Staging schema + `DB_SCHEMA` + staging Lambdas
2. S3 `staging/` isolation test
3. Webhook payload enrichment
4. Salesforce connector
5. Chase Travis (CSV + SF sandbox)
6. CDK alarm deploy (if not merged yet)

Filter in Linear: **Project = Staging & Infra** OR **Project = STAR Go-Live**, **Priority = Urgent**.
