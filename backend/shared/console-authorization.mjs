export const CANONICAL_CONSOLE_ROLES = Object.freeze([
  'ventus_platform_admin',
  'institution_admin',
  'growth_play_owner',
  'bank_operator',
  'risk_reviewer',
  'executive_viewer',
]);

const ROLE_SET = new Set(CANONICAL_CONSOLE_ROLES);
const SCENARIO_ACCESS = Object.freeze({
  'deposit-retention': {
    entitlement: 'consumer_demo',
    businessLine: 'consumer-banking',
    aliases: new Set(['consumer', 'consumer-banking']),
    queueAliases: new Set(['consumer-review', 'deposit-review', 'consumer-deposit-primacy']),
  },
  'wealth-growth': {
    entitlement: 'wealth_demo',
    businessLine: 'wealth-management',
    aliases: new Set(['wealth', 'wealth-management', 'merrill', 'merrill-wealth-management']),
    queueAliases: new Set(['wealth-advisory', 'wealth-exceptions', 'wealth-qualified-opportunities']),
  },
});

export function canonicalConsoleRole(value, fallback = null) {
  if (ROLE_SET.has(value)) return value;
  if (value === 'admin') return 'institution_admin';
  if (value === 'operator') return 'bank_operator';
  return fallback;
}

export function normalizeBusinessLine(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[_\s]+/g, '-')
    : '';
}

export function scenarioAccess(scenario) {
  return SCENARIO_ACCESS[scenario] || null;
}

export function authorizeScenarioDecision(membership, scenario) {
  const access = scenarioAccess(scenario);
  const base = authorizeScenarioScope(membership, access);
  if (!base.allowed) return base;
  if (canonicalConsoleRole(membership.role) !== 'bank_operator') {
    return { allowed: false, reason: 'role_not_authorized', businessLine: access.businessLine };
  }
  return { ...base, reason: 'authorized' };
}

export function authorizeScenarioRead(membership, scenario) {
  const access = scenarioAccess(scenario);
  const base = authorizeScenarioScope(membership, access);
  if (!base.allowed) return base;
  const role = canonicalConsoleRole(membership.role);
  if (!['bank_operator', 'growth_play_owner', 'risk_reviewer'].includes(role)) {
    return { allowed: false, reason: 'role_not_authorized', businessLine: access.businessLine };
  }
  return { ...base, reason: 'authorized' };
}

export function authorizeTodayRead(membership) {
  if (!membership || membership.status !== 'active') {
    return { allowed: false, reason: 'inactive_membership' };
  }
  const entitlements = Array.isArray(membership.entitlements) ? membership.entitlements : [];
  if (!entitlements.includes('growth_console')) return { allowed: false, reason: 'scenario_not_entitled' };
  const role = canonicalConsoleRole(membership.role);
  return CANONICAL_CONSOLE_ROLES.includes(role)
    ? { allowed: true, reason: 'authorized', aggregateOnly: role === 'executive_viewer' }
    : { allowed: false, reason: 'role_not_authorized' };
}

export function authorizedTodayScenarios(membership) {
  return Object.keys(SCENARIO_ACCESS).filter((scenario) => (
    authorizeScenarioScope(membership, scenarioAccess(scenario)).allowed
  ));
}

export function authorizeGrowthPlayRead(membership) {
  return authorizeConsoleRoles(membership, [
    'growth_play_owner', 'risk_reviewer', 'institution_admin', 'executive_viewer', 'ventus_platform_admin',
  ]);
}

export function authorizeGrowthPlayWrite(membership) {
  return authorizeConsoleRoles(membership, ['growth_play_owner']);
}

export function authorizeGrowthPlayApproval(membership) {
  return authorizeConsoleRoles(membership, ['risk_reviewer']);
}

export function authorizeResultsRead(membership) {
  const base = authorizeConsoleRoles(membership, [
    'bank_operator', 'growth_play_owner', 'risk_reviewer', 'executive_viewer', 'institution_admin', 'ventus_platform_admin',
  ]);
  if (!base.allowed) return base;
  const projectionByRole = {
    bank_operator: 'assigned_results',
    growth_play_owner: 'owned_play_results',
    risk_reviewer: 'review_results',
    executive_viewer: 'executive_aggregate',
    institution_admin: 'system_health',
    ventus_platform_admin: 'tenant_health',
  };
  return { ...base, projection: projectionByRole[canonicalConsoleRole(membership.role)] };
}

// Evidence bundles contain an immutable protocol and receipt trace. They are a
// review artifact, not an operator queue or an executive dashboard export.
export function authorizeEvidenceBundleRead(membership) {
  return authorizeConsoleRoles(membership, ['risk_reviewer']);
}

export function authorizeGovernanceRead(membership) {
  const base = authorizeConsoleRoles(membership, ['risk_reviewer', 'institution_admin', 'ventus_platform_admin']);
  if (!base.allowed) return base;
  const projectionByRole = {
    risk_reviewer: 'full_governance',
    institution_admin: 'connector_health',
    ventus_platform_admin: 'platform_health',
  };
  return { ...base, projection: projectionByRole[canonicalConsoleRole(membership.role)] };
}

export function authorizeSkillDraft(membership) {
  return authorizeConsoleRoles(membership, ['growth_play_owner']);
}

export function authorizeSkillRead(membership) {
  return authorizeConsoleRoles(membership, ['growth_play_owner', 'risk_reviewer', 'ventus_platform_admin']);
}

export function authorizeSkillTransition(membership, action) {
  const role = canonicalConsoleRole(membership?.role);
  const allowed = action === 'submit_shadow'
    ? role === 'growth_play_owner'
    : action === 'request_promotion'
      ? role === 'risk_reviewer'
      : action === 'pause'
        ? ['risk_reviewer', 'institution_admin', 'ventus_platform_admin'].includes(role)
        : false;
  const base = authorizeConsoleRoles(membership, CANONICAL_CONSOLE_ROLES);
  return base.allowed && allowed
    ? { ...base, projection: role }
    : { allowed: false, reason: base.allowed ? 'role_not_authorized' : base.reason };
}

export function authorizeSkillApproval(membership, phase, approvalType) {
  const role = canonicalConsoleRole(membership?.role);
  const expectedRole = approvalType === 'business_sponsorship'
    ? 'growth_play_owner'
    : approvalType === 'risk_review'
      ? 'risk_reviewer'
      : approvalType === 'environment_route'
        ? 'institution_admin'
        : null;
  const validPhase = ['shadow_scope', 'promotion'].includes(phase);
  const base = authorizeConsoleRoles(membership, CANONICAL_CONSOLE_ROLES);
  return base.allowed && validPhase && role === expectedRole
    ? { ...base, projection: role }
    : { allowed: false, reason: base.allowed ? 'role_not_authorized' : base.reason };
}

export function authorizeConnectionsRead(membership) {
  return authorizeConsoleRoles(membership, ['institution_admin', 'ventus_platform_admin']);
}

export function authorizeConnectionsWrite(membership) {
  return authorizeConsoleRoles(membership, ['institution_admin', 'ventus_platform_admin']);
}

export function authorizeCoworkerDelivery(membership) {
  return authorizeConsoleRoles(membership, ['growth_play_owner', 'institution_admin', 'ventus_platform_admin']);
}

function authorizeConsoleRoles(membership, allowedRoles) {
  if (!membership || membership.status !== 'active') return { allowed: false, reason: 'inactive_membership' };
  const entitlements = Array.isArray(membership.entitlements) ? membership.entitlements : [];
  if (!entitlements.includes('growth_console')) return { allowed: false, reason: 'scenario_not_entitled' };
  const role = canonicalConsoleRole(membership.role);
  return allowedRoles.includes(role)
    ? { allowed: true, reason: 'authorized' }
    : { allowed: false, reason: 'role_not_authorized' };
}

function authorizeScenarioScope(membership, access) {
  if (!access) return { allowed: false, reason: 'invalid_scenario' };
  if (!membership || membership.status !== 'active') {
    return { allowed: false, reason: 'inactive_membership' };
  }
  const entitlements = Array.isArray(membership.entitlements) ? membership.entitlements : [];
  if (!entitlements.includes('growth_console') || !entitlements.includes(access.entitlement)) {
    return { allowed: false, reason: 'scenario_not_entitled', businessLine: access.businessLine };
  }
  const businessLines = Array.isArray(membership.businessLines)
    ? membership.businessLines
    : Array.isArray(membership.businessLineScopes)
      ? membership.businessLineScopes
      : [];
  const scoped = businessLines
    .map(normalizeBusinessLine)
    .some((businessLine) => access.aliases.has(businessLine));
  if (!scoped) return { allowed: false, reason: 'business_line_not_authorized', businessLine: access.businessLine };

  const queueScopes = Array.isArray(membership.queueScopes) ? membership.queueScopes : [];
  const queueAuthorized = queueScopes.length === 0 || queueScopes
    .map(normalizeBusinessLine)
    .some((queue) => access.queueAliases.has(queue));
  return queueAuthorized
    ? { allowed: true, reason: 'scope_authorized', businessLine: access.businessLine }
    : { allowed: false, reason: 'queue_not_authorized', businessLine: access.businessLine };
}
