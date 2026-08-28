# Security and procurement evidence index

This index is an honest readiness tracker, not a claim that Ventus is certified or that controls
have operated for a required audit period.

| Area | Current repository evidence | Status | Required owner action |
| --- | --- | --- | --- |
| Architecture and data flow | `docs/integrations/bofa-integration-map.md`, `docs/security/aws-enterprise-readiness-audit.md` | Draft | Validate against deployed AWS resources |
| Secrets and credential rotation | `docs/security/aws-secrets-cutover-runbook.md`, `infra/security/*` | Partially implemented | Execute rotation and preserve evidence |
| CI/CD and change control | `.github/workflows/*`, `docs/engineering/lovable-promotion-workflow.md` | Implemented with gaps | Enforce protected branches and required review |
| Authentication and authorization | Connector bearer compatibility gate; signed-session-only standalone runtime scoped to one business line; separate short-lived control-plane sessions with tenant, role, business-line, subject, IdP, and four-eyes enforcement; transaction-scoped tenant context and forced RLS | Connector, runtime, and control-plane contracts implemented and tested, not connected to bank SSO or deployed | Choose SSO/OIDC provider, map authoritative groups/service identities, bind claims to tenant context, and test login/deprovisioning/isolation |
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
