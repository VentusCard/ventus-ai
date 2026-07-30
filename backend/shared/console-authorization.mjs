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
  },
  'wealth-growth': {
    entitlement: 'wealth_demo',
    businessLine: 'wealth-management',
    aliases: new Set(['wealth', 'wealth-management', 'merrill', 'merrill-wealth-management']),
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
  if (!access) return { allowed: false, reason: 'invalid_scenario' };
  if (!membership || membership.status !== 'active') {
    return { allowed: false, reason: 'inactive_membership' };
  }
  if (canonicalConsoleRole(membership.role) !== 'bank_operator') {
    return { allowed: false, reason: 'role_not_authorized' };
  }
  const entitlements = Array.isArray(membership.entitlements) ? membership.entitlements : [];
  if (!entitlements.includes('growth_console') || !entitlements.includes(access.entitlement)) {
    return { allowed: false, reason: 'scenario_not_entitled' };
  }
  const businessLines = Array.isArray(membership.businessLines)
    ? membership.businessLines
    : Array.isArray(membership.businessLineScopes)
      ? membership.businessLineScopes
      : [];
  const scoped = businessLines
    .map(normalizeBusinessLine)
    .some((businessLine) => access.aliases.has(businessLine));
  return scoped
    ? { allowed: true, reason: 'authorized', businessLine: access.businessLine }
    : { allowed: false, reason: 'business_line_not_authorized', businessLine: access.businessLine };
}
