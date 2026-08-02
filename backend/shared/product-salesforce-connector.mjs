import { createHash } from 'node:crypto';
import { createSalesforceFscService } from './salesforce-fsc.mjs';
import { buildSalesforceTaskRecord } from './salesforce-task-record.mjs';

export class ProductSalesforceConnectorError extends Error {
  constructor(message, { code = 'product_connector_error', terminalFailure = false } = {}) {
    super(message);
    this.name = 'ProductSalesforceConnectorError';
    this.code = code;
    this.terminalFailure = terminalFailure;
  }
}

/**
 * Server-only Salesforce/FSC adapter for approved Console actions.
 * It deliberately accepts a Decision Package from the durable journey, never
 * browser-supplied task fields or relationship IDs.
 */
export function createProductSalesforceConnector({ getSecrets, fscService } = {}) {
  if (typeof getSecrets !== 'function') throw new Error('getSecrets is required');
  const salesforce = fscService || createSalesforceFscService({ buildTaskRecord: buildSalesforceTaskRecord });
  if (typeof salesforce.deliver !== 'function') throw new Error('fscService.deliver is required');

  return {
    async testConnection({ mapping } = {}) {
      if (typeof salesforce.healthCheck !== 'function') {
        throw new ProductSalesforceConnectorError('Salesforce connection testing is not available for this connector.', {
          code: 'salesforce_connection_test_unavailable', terminalFailure: true,
        });
      }
      const config = normalizeConfig(await getSecrets());
      if (!config.salesforceLoginUrl || !config.salesforceClientId || !config.salesforceClientSecret) {
        throw new ProductSalesforceConnectorError(
          'The product Salesforce connector is not configured for this environment.',
          { code: 'salesforce_connector_unconfigured', terminalFailure: true },
        );
      }
      try {
        const outcomeMapping = mapping?.configuration ?? mapping;
        const result = outcomeMapping && typeof salesforce.verifyOutcomeMapping === 'function'
          ? await salesforce.verifyOutcomeMapping({ config, mapping: outcomeMapping })
          : await salesforce.healthCheck({ config });
        return {
          connector: 'salesforce-fsc',
          check: cleanText(result?.check, 80) || 'authenticated_api_read',
          detail: result?.check === 'outcome_mapping_verified'
            ? `Approved outcome mapping verified for ${cleanText(result?.decisionObject, 120)} in ${cleanText(result?.instanceDomain, 180) || 'the configured Salesforce org'}.`
            : `Authenticated API read succeeded for ${cleanText(result?.instanceDomain, 180) || 'the configured Salesforce org'}.`,
        };
      } catch (error) {
        if (error?.name === 'SalesforceFscError' && /authentication|token response/i.test(String(error.message))) {
          throw new ProductSalesforceConnectorError(
            'Salesforce authentication is not configured for the product connector.',
            { code: 'salesforce_auth_invalid', terminalFailure: true },
          );
        }
        throw error;
      }
    },
    async deliver({ tenantId, decisionPackage, decisionPackageV12 = null, source = 'ventus-growth-console' }) {
      validateDecisionPackage({ tenantId, decisionPackage });
      validateDecisionPackageV12(decisionPackageV12, decisionPackage);
      const config = normalizeConfig(await getSecrets());
      if (!config.salesforceLoginUrl || !config.salesforceClientId || !config.salesforceClientSecret) {
        throw new ProductSalesforceConnectorError(
          'The product Salesforce connector is not configured for this environment.',
          { code: 'salesforce_connector_unconfigured', terminalFailure: true },
        );
      }
      const selectedAction = decisionPackage.recommendation.selectedAction;
      let result;
      try {
        result = await salesforce.deliver({
          config,
          tenantId,
          body: {
            source,
            priority: decisionPackage.moment.confidence >= 85 ? 'High' : 'Normal',
            subject: `${decisionPackage.growthPlay.name} - ${selectedAction.title}`,
            insight: {
              customerRef: decisionPackage.subject.token,
              whyNow: decisionPackage.moment.summary,
              moment: decisionPackage.moment.type,
              recommendedAction: selectedAction.instructions || selectedAction.title,
              expectedOutcome: `Measure ${decisionPackage.growthPlay.primaryMetric} over ${decisionPackage.outcome.windowDays} days.`,
              evidence: decisionPackage.moment.evidence,
              controls: decisionPackage.governance.controls,
              destination: selectedAction.destination,
              growthPlay: decisionPackage.growthPlay.name,
              businessLine: decisionPackage.growthPlay.businessLine,
              decisionRef: decisionPackage.decisionId,
              sourceName: source,
              confidence: decisionPackage.moment.confidence,
              decisionPackageDigest: decisionPackageV12?.packageDigest ?? null,
            },
            decisionPackage,
            decisionPackageV12,
            fsc: {
              createReferral: config.salesforceCreateReferral,
            },
          },
        });
      } catch (error) {
        if (error?.name === 'SalesforceFscError' && /authentication|token response/i.test(String(error.message))) {
          throw new ProductSalesforceConnectorError(
            'Salesforce authentication is not configured for the product connector.',
            { code: 'salesforce_auth_invalid', terminalFailure: true },
          );
        }
        throw error;
      }
      return sanitizeDelivery(result);
    },
    async readOutcome({ tenantId, decisionRecordId, mapping }) {
      if (typeof salesforce.readOutcome !== 'function') {
        throw new ProductSalesforceConnectorError('Salesforce outcome return is not available for this connector.', {
          code: 'salesforce_outcome_return_unavailable', terminalFailure: true,
        });
      }
      const config = normalizeConfig(await getSecrets());
      if (!config.salesforceLoginUrl || !config.salesforceClientId || !config.salesforceClientSecret) {
        throw new ProductSalesforceConnectorError(
          'The product Salesforce connector is not configured for this environment.',
          { code: 'salesforce_connector_unconfigured', terminalFailure: true },
        );
      }
      try {
        return await salesforce.readOutcome({
          config,
          decisionRecordId,
          tenantId,
          mapping: mapping?.configuration ?? mapping,
        });
      } catch (error) {
        if (error?.name === 'SalesforceFscError' && /authentication|token response/i.test(String(error.message))) {
          throw new ProductSalesforceConnectorError(
            'Salesforce authentication is not configured for the product connector.',
            { code: 'salesforce_auth_invalid', terminalFailure: true },
          );
        }
        throw error;
      }
    },
  };
}

function validateDecisionPackage({ tenantId, decisionPackage }) {
  if (!decisionPackage || typeof decisionPackage !== 'object' || Array.isArray(decisionPackage)) {
    throw new ProductSalesforceConnectorError('A server Decision Package is required.', {
      code: 'invalid_decision_package', terminalFailure: true,
    });
  }
  if (decisionPackage.tenantId !== tenantId) {
    throw new ProductSalesforceConnectorError('Decision Package tenant does not match the active institution.', {
      code: 'decision_tenant_mismatch', terminalFailure: true,
    });
  }
  if (decisionPackage.governance?.policyStatus !== 'cleared') {
    throw new ProductSalesforceConnectorError('The Decision Package is not cleared for delivery.', {
      code: 'delivery_policy_not_cleared', terminalFailure: true,
    });
  }
  if (!['accepted', 'modified'].includes(decisionPackage.response?.status)) {
    throw new ProductSalesforceConnectorError('A durable human response is required before delivery.', {
      code: 'delivery_response_missing', terminalFailure: true,
    });
  }
  if (!decisionPackage.recommendation?.selectedAction?.id) {
    throw new ProductSalesforceConnectorError('The Decision Package does not contain an approved action.', {
      code: 'delivery_action_missing', terminalFailure: true,
    });
  }
}

function validateDecisionPackageV12(packageV12, decisionPackage) {
  if (packageV12 === null || packageV12 === undefined) return;
  if (!packageV12 || typeof packageV12 !== 'object' || Array.isArray(packageV12)) {
    throw new ProductSalesforceConnectorError('Decision Package v1.2 is malformed.', { code: 'invalid_decision_package_v12', terminalFailure: true });
  }
  if (packageV12.schemaVersion !== '1.2' || typeof packageV12.packageDigest !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(packageV12.packageDigest)) {
    throw new ProductSalesforceConnectorError('Decision Package v1.2 identity is invalid.', { code: 'invalid_decision_package_v12', terminalFailure: true });
  }
  if (packageV12.decisionId !== decisionPackage.decisionId || packageV12.tenantId !== decisionPackage.tenantId) {
    throw new ProductSalesforceConnectorError('Decision Package v1.2 does not match the delivery decision.', { code: 'decision_package_v12_mismatch', terminalFailure: true });
  }
  const required = [
    packageV12.createdAt,
    packageV12.growthPlay?.id,
    packageV12.growthPlay?.protocolId,
    packageV12.subject?.token,
    packageV12.subject?.scope,
    packageV12.moment?.type,
    packageV12.moment?.summary,
    packageV12.moment?.confidenceBand,
    packageV12.moment?.observedAt,
    packageV12.moment?.urgency,
    packageV12.recommendation?.selectedAction?.id,
    packageV12.recommendation?.rationale,
    packageV12.recommendation?.actionCatalogVersion,
    packageV12.governance?.policyStatus,
    packageV12.governance?.approvalStatus,
    packageV12.governance?.exceptionStatus,
    packageV12.decisionMethod?.runtimeType,
    packageV12.decisionMethod?.runtimeVersion,
    packageV12.workflowIntent?.connector,
    packageV12.workflowIntent?.destination,
    packageV12.workflowIntent?.ownerRole,
    packageV12.measurementPlan?.metric,
  ];
  if (required.some((value) => typeof value !== 'string' || value.length === 0)
    || !['customer', 'household', 'account', 'business'].includes(packageV12.subject.scope)
    || !['low', 'medium', 'high'].includes(packageV12.moment.confidenceBand)
    || !['routine', 'time-sensitive', 'urgent'].includes(packageV12.moment.urgency)
    || !['cleared', 'suppressed', 'review'].includes(packageV12.governance.policyStatus)
    || !['approved', 'not_attested'].includes(packageV12.governance.approvalStatus)
    || !['none', 'open', 'resolved'].includes(packageV12.governance.exceptionStatus)
    || !['deterministic', 'model_assisted'].includes(packageV12.decisionMethod.runtimeType)
    || !Array.isArray(packageV12.decisionMethod.skillVersions)
    || packageV12.decisionMethod.skillVersions.some((value) => typeof value !== 'string' || !value)
    || !Array.isArray(packageV12.measurementPlan.outcomeEventTypes)
    || !Array.isArray(packageV12.measurementPlan.outcomeSourceSystems)
    || !Number.isInteger(packageV12.measurementPlan.windowDays)
    || packageV12.measurementPlan.windowDays < 1
    || (packageV12.governance.protocolApprovalId !== null && typeof packageV12.governance.protocolApprovalId !== 'string')
    || (packageV12.governance.approvalStatus === 'approved' && !packageV12.governance.protocolApprovalId)
    || (packageV12.evidenceClass !== 'fixture' && packageV12.governance.approvalStatus !== 'approved')
    || (packageV12.recommendation.selectedAction.connector
      && packageV12.recommendation.selectedAction.connector !== packageV12.workflowIntent.connector)
    || (packageV12.recommendation.selectedAction.destinationKey
      && packageV12.recommendation.selectedAction.destinationKey !== packageV12.workflowIntent.destination)) {
    throw new ProductSalesforceConnectorError('Decision Package v1.2 is incomplete.', { code: 'invalid_decision_package_v12', terminalFailure: true });
  }
  const { packageDigest, ...immutable } = packageV12;
  if (packageDigest !== canonicalDigest(immutable)) {
    throw new ProductSalesforceConnectorError('Decision Package v1.2 digest does not match its immutable content.', { code: 'invalid_decision_package_v12', terminalFailure: true });
  }
}

function canonicalDigest(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function normalizeConfig(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    salesforceLoginUrl: cleanConfiguredValue(source.salesforceLoginUrl).replace(/\/$/, ''),
    salesforceClientId: cleanConfiguredValue(source.salesforceClientId),
    salesforceClientSecret: cleanConfiguredValue(source.salesforceClientSecret),
    // This is a non-production mapping convenience only. A bank implementation
    // must resolve the account from a governed native-system identity mapping.
    salesforceDemoAccountId: cleanConfiguredValue(source.salesforceDefaultAccountId),
    salesforceReferralRecordTypeId: cleanConfiguredValue(source.salesforceReferralRecordTypeId),
    salesforceCreateReferral: source.salesforceCreateReferral === true || source.salesforceCreateReferral === 'true',
  };
}

function sanitizeDelivery(result) {
  if (!result?.id || !result?.url) {
    throw new ProductSalesforceConnectorError('Salesforce returned an incomplete delivery receipt.', {
      code: 'salesforce_incomplete_receipt', terminalFailure: false,
    });
  }
  return {
    object: cleanText(result.object, 80) || 'Salesforce record',
    id: cleanText(result.id, 80),
    url: requireHttps(result.url),
    records: {
      decision: sanitizeRecord(result.records?.decision),
      referral: sanitizeRecord(result.records?.referral),
      task: sanitizeRecord(result.records?.task),
    },
    warnings: Array.isArray(result.warnings)
      ? result.warnings.slice(0, 4).map((item) => ({
        stage: cleanText(item?.stage, 80),
        message: cleanText(item?.message, 220),
      })).filter((item) => item.stage || item.message)
      : [],
  };
}

function sanitizeRecord(record) {
  if (!record?.id || !record?.url) return null;
  return { id: cleanText(record.id, 80), url: requireHttps(record.url) };
}

function requireHttps(value) {
  const url = new URL(String(value));
  if (url.protocol !== 'https:') {
    throw new ProductSalesforceConnectorError('Salesforce receipt URL must use HTTPS.', {
      code: 'salesforce_receipt_url_invalid', terminalFailure: false,
    });
  }
  return url.toString();
}

function cleanConfiguredValue(value) {
  const cleaned = cleanText(value, 1024);
  return cleaned.startsWith('CONFIGURE_') ? '' : cleaned;
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
}
