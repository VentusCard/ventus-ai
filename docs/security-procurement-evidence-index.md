# Security and procurement evidence index

This index is an honest readiness tracker, not a claim that Ventus is certified or that controls
have operated for a required audit period.

| Area | Current repository evidence | Status | Required owner action |
| --- | --- | --- | --- |
| Architecture and data flow | `docs/bofa-integration-map.md`, `docs/aws-enterprise-readiness-audit.md` | Draft | Validate against deployed AWS resources |
| Secrets and credential rotation | `docs/aws-secrets-cutover-runbook.md`, `infra/security/*` | Partially implemented | Execute rotation and preserve evidence |
| CI/CD and change control | `.github/workflows/*`, `docs/lovable-promotion-workflow.md` | Implemented with gaps | Enforce protected branches and required review |
| Authentication and authorization | Connector bearer gate; internal UI presentation gate | Not pilot-ready | Choose SSO/OIDC provider and implement tenant RBAC |
| Auditability | Local ledger, immutable measurement contracts, and SQL migrations | Designed and tested, not deployed | Deploy, test RLS, backups, export, and retention |
| Incident response | No approved runbook identified | Missing | Name owner, severity model, communications, tabletop |
| Data retention and deletion | No approved policy identified | Missing | Define retention by data class and deletion SLA |
| Vendor/subprocessor inventory | Model gateway configuration and AWS dependencies are discoverable | Incomplete | Freeze provider list and document data boundaries |
| AI/model governance | Golden tests, evaluation rubric, model evaluation records | Evaluation foundation | Add model inventory, approvals, drift and incident process |
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
