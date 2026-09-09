# Security and procurement evidence index

This index is an honest readiness tracker, not a claim that Ventus is certified or that controls
have operated for a required audit period.

| Area | Current repository evidence | Status | Required owner action |
| --- | --- | --- | --- |
| Architecture and data flow | `docs/security/aws-enterprise-readiness-audit.md`, `docs/architecture/intelligence-control-plane.md` | Draft | Validate against deployed AWS resources |
| Secrets and credential rotation | `docs/aws-secrets-cutover-runbook.md`, `infra/security/*` | Partially implemented | Execute rotation and preserve evidence |
| CI/CD and change control | `.github/workflows/*`, `docs/lovable-promotion-workflow.md` | Implemented with gaps | Enforce protected branches and required review |
| Authentication and authorization | Supabase email/password auth (frontend, `src/integrations/supabase/`); per-bank API keys for the product API (`api_keys` table); optional Cognito CDK foundation exists but is not wired | Supabase auth is live; enterprise SSO/OIDC, group-to-tenant mapping, and role-based access are planned (Cognito/WorkOS under evaluation). The Console API described in earlier drafts was removed | Choose SSO/OIDC provider, map authoritative groups/service identities, bind claims to tenant context, and implement role/deprovisioning/isolation |
| Auditability | Model evaluation records (`backend/sql/model-evaluation-runs.sql`), webhook delivery ledger (`backend/sql/webhook-delivery-attempts.sql`), pipeline-run tracking | Model/eval and webhook audit trails exist; tenant-scoped decision ledger, forced RLS, and backup/export/retention verification are not yet built (the prior Evidence Store stack was retired to a shell) | Implement tenant-scoped audit persistence + RLS, test backups/export/retention, and preserve evidence receipts |
| Incident response | No approved runbook identified | Missing | Name owner, severity model, communications, tabletop |
| Data retention and deletion | No approved policy identified | Missing | Define retention by data class and deletion SLA |
| Vendor/subprocessor inventory | Model gateway configuration and AWS dependencies are discoverable | Incomplete | Freeze provider list and document data boundaries |
| AI/model governance | Golden tests, evaluation rubric, model evaluation records (`backend/eval/*`), deterministic-baseline and hard-failure gates | Evaluation foundation; no runtime model-approval workflow | Add model inventory, independent approvals, sanctioned-data benchmark, drift monitoring, and model incident process |
| Business continuity | AWS infrastructure assets exist | Incomplete | Define RTO/RPO and test restore/failover |
| Privacy and DPA | No approved templates identified | Missing | Counsel review of DPA, privacy notice, data-subject handling |
| SOC 2 | Readiness work exists; no certification asserted | Gap | Scope Type I, assign control owners, collect operating evidence |
| PCI DSS | Ventus should avoid PAN/CVV and tokenise account references | Scope decision required | Obtain written scope analysis before receiving card data |
| Model risk / SR 11-7 alignment | Evaluation gates and explainable deterministic baseline | Partial | Document intended use, limitations, validation independence |

## Minimum pilot packet

- Current architecture and data-flow diagram.
- Security responsibility matrix between Ventus, cloud providers, and the bank.
- Data inventory with classification, retention, residency, and deletion commitments.
- Incident response and breach-notification process.
- Subprocessor inventory and model-provider data-boundary statement.
- Access-control design, evidence of least privilege, and credential-rotation evidence.
- Model card for each promoted task and the corresponding evaluation report.
- Pilot SOW defining scope, mutual data obligations, success gates, holdout design, and stop conditions.
