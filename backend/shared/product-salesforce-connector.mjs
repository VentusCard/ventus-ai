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
    async readOutcome({ tenantId, decisionRecordId }) {
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
        return await salesforce.readOutcome({ config, decisionRecordId, tenantId });
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
