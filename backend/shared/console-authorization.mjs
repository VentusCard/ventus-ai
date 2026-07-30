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
