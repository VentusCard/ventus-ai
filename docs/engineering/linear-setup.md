# Linear + Cursor Setup

This guide covers linking your Linear workspace to Cursor and importing the STAR / pilot roadmap issues.

## Concepts

| Term | Ventus setup |
| --- | --- |
| **Account** | Your login (Zoheb) |
| **Workspace** | The org container (rename to **Ventus AI** under [Workspace settings](https://linear.app/settings/workspace)) |
| **Team** | **Engineering** (`ENG`) — issues get IDs like `ENG-123` |
| **Project** | Grouping inside a team (STAR Go-Live, Portal, etc.) |

Account and workspace are already linked when you sign up — you do not connect them separately. You connect **Cursor → Linear workspace** via MCP or API key.

---

## Option A: Cursor MCP (recommended for day-to-day)

Use this to create/read/update issues from Cursor Composer without leaving the IDE.

### 1. Enable MCP in the repo

This repo includes `.cursor/mcp.json` with Linear's official remote MCP server.

### 2. Connect in Cursor

1. Open **Cursor Settings** (`Cmd+Shift+J` or `Cmd+,` → **MCP**).
2. Confirm **linear** appears under MCP servers and toggle it **on**.
3. On first use, Cursor opens a browser window — sign in to Linear and authorize the **Ventus AI** workspace.
4. Restart Cursor if the server shows red/disconnected.

Official docs: [Linear Cursor MCP](https://linear.app/integrations/cursor-mcp)

### 3. Verify

In Composer (`Cmd+I`), try:

```text
List Linear teams in my workspace
```

Or use the **Connect Cursor** item in Linear's sidebar (Try → Connect Cursor).

### Troubleshooting

- Toggle Linear MCP off/on and restart Cursor.
- Confirm you selected the **Ventus AI** workspace when authorizing OAuth.
- Remote MCP is still early — retry if the first connection fails.

---

## Option B: API key (recommended for bulk import)

Use this to run the one-time issue import script.

### 1. Create a personal API key

1. Linear → **Settings** (gear) → **Account** → **Security & access** → **Personal API keys**
2. Or direct: [linear.app/settings/account/security](https://linear.app/settings/account/security)
3. **Create key** → name it `Ventus import` → copy `lin_api_...`

The key is scoped to **your account** but can access workspaces you belong to (including Ventus AI).

### 2. Run the import script

```bash
cd scripts/linear
npm install
export LINEAR_API_KEY="lin_api_xxxxxxxx"
npm run dry-run    # preview counts, no writes
npm run import     # creates projects + issues
```

Optional env vars:

| Variable | Default | Purpose |
| --- | --- | --- |
| `LINEAR_TEAM_KEY` | `ENG` | Team key prefix — **Engineering** team |
| `LINEAR_IMPORT_LABEL` | `star-pilot-may-2026` | Label added to every imported issue (for filtering) |

The script skips issues that already exist with the same title in the same project (safe to re-run).

### 3. Invite Yusheng

**Settings → Workspace → Members → Invite** → add his email. He joins the same workspace and **Ventus AI** team.

---

## Option C: Linear ↔ GitHub (optional, later)

In Linear: **Settings → Integrations → GitHub** → connect `VentusCard/ventus-ai` so PRs link to issues.

---

## Repo Organization project (separate import)

Issues live in `scripts/linear/issues-repo-organization.json` (project + 22 issues). North star doc: `docs/internal/repo-organization-north-star.md`.

```bash
cd scripts/linear
export LINEAR_API_KEY="lin_api_..."
npm run dry-run:repo-org
npm run import:repo-org
```

Uses label `repo-organization` by default (override with `LINEAR_IMPORT_LABEL`). Skips issues that already exist with the same title in the project.

## After import

Suggested Linear views to create manually:

1. **P0 Go-Live** — filter: label `p0` OR priority Urgent
2. **This Week** — Cycle = current week
3. **Blocked External** — label `blocked-external`
4. By project: STAR Go-Live, Staging & Infra, Portal Phase 1, Repo Organization

---

## Rename workspace (top-left)

If the top-left still shows your personal name:

**https://linear.app/settings/workspace** → change **Workspace name** to `Ventus AI`.

This is separate from the **Ventus AI** team name in the sidebar.

---

## Daily planning

See [`docs/daily-planning.md`](../daily-planning.md). From repo root:

```bash
export LINEAR_API_KEY="lin_api_..."
npm run today
```
