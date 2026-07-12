# Security and procurement evidence index

This index is an honest readiness tracker, not a claim that Ventus is certified or that controls
have operated for a required audit period.

| Area | Current repository evidence | Status | Required owner action |
| --- | --- | --- | --- |
| Architecture and data flow | `docs/bofa-integration-map.md`, `docs/aws-enterprise-readiness-audit.md` | Draft | Validate against deployed AWS resources |
| Secrets and credential rotation | `docs/aws-secrets-cutover-runbook.md`, `infra/security/*` | Partially implemented | Execute rotation and preserve evidence |
| CI/CD and change control | `.github/workflows/*`, `docs/lovable-promotion-workflow.md` | Implemented with gaps | Enforce protected branches and required review |
| Authentication and authorization | Connector bearer compatibility gate; short-lived tenant/scope/destination sessions; internal UI presentation gate; transaction-scoped tenant context and forced-RLS migration | Session and tenant-isolation contracts implemented, not connected to bank identity or deployed; user RBAC missing | Choose SSO/OIDC provider, bind authenticated claims to both session and database tenant context, and test isolation |
| Auditability | Local UI ledger, SHA-256 server repository, composed operating-loop lineage, immutable evidence classes and measurement contracts, forced-RLS migrations, rollback-only isolation probe | Implemented and tested statically, not deployed | Deploy non-production store, run RLS probe, test backups, export, and retention |
| Incident response | No approved runbook identified | Missing | Name owner, severity model, communications, tabletop |
| Data retention and deletion | No approved policy identified | Missing | Define retention by data class and deletion SLA |
| Vendor/subprocessor inventory | Model gateway configuration and AWS dependencies are discoverable | Incomplete | Freeze provider list and document data boundaries |
| AI/model governance | Golden tests, evaluation rubric, model evaluation records, evidence-bound shadow planner, deterministic-baseline and hard-failure gates | Evaluation foundation; no runtime planner approval | Add model inventory, independent approvals, sanctioned-data benchmark, drift monitoring, and model incident process |
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
