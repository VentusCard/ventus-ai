const API_VERSION = 'v61.0';
const SALESFORCE_ID = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;

const OBJECT_DEFINITIONS = [
  {
    key: 'client',
    label: 'Client relationship',
    name: 'Account',
    purpose: 'Anchor a Ventus decision to the institution customer record.',
    fields: ['Id', 'IsPersonAccount', 'PersonContactId', 'RecordTypeId'],
  },
  {
    key: 'financial_account',
    label: 'Financial account',
    name: 'FinServ__FinancialAccount__c',
    purpose: 'Reference FSC account context without copying customer balances.',
    fields: ['Id', 'FinServ__PrimaryOwner__c', 'FinServ__Household__c', 'FinServ__RecordTypeName__c'],
  },
  {
    key: 'referral',
    label: 'Referral workflow',
    name: 'Lead',
    purpose: 'Route an institution-approved qualified opportunity.',
    fields: ['Id', 'RecordTypeId', 'OwnerId', 'Status', 'Description'],
  },
  {
    key: 'task',
    label: 'Employee task',
    name: 'Task',
    purpose: 'Place the next action in the employee workflow.',
    fields: ['Id', 'WhoId', 'WhatId', 'OwnerId', 'Subject', 'Status', 'ActivityDate', 'Priority'],
  },
  {
    key: 'decision',
    label: 'Ventus decision receipt',
    name: 'Ventus_Decision__c',
    purpose: 'Mirror governed evidence, approval, workflow, and outcome references.',
    fields: [
      'Id',
      'Client_Account__c',
      'Decision_Reference__c',
      'Growth_Play__c',
      'Business_Objective__c',
      'Customer_Moment__c',
      'Recommended_Action__c',
      'Confidence__c',
      'Evidence_Class__c',
      'Policy_Status__c',
      'Human_Response__c',
      'Outcome_Status__c',
      'Outcome_Event_Type__c',
      'Outcome_Metric__c',
      'Outcome_Amount__c',
      'Outcome_Occurred_At__c',
      'Outcome_Source_Record_Id__c',
      'Outcome_Reason_Code__c',
      'Workflow_Record_Id__c',
      'Decision_Package__c',
    ],
  },
];

const CANONICAL_MAPPINGS = [
  { key: 'subject.account_id', label: 'Customer account anchor', object: 'Account', field: 'Id', required: true },
  { key: 'workflow.task_account', label: 'Employee task relationship', object: 'Task', field: 'WhatId', required: true },
  { key: 'decision.account', label: 'Decision-to-customer relationship', object: 'Ventus_Decision__c', field: 'Client_Account__c', required: true },
  { key: 'decision.reference', label: 'Ventus decision reference', object: 'Ventus_Decision__c', field: 'Decision_Reference__c', required: true },
  { key: 'outcome.status', label: 'Outcome status', object: 'Ventus_Decision__c', field: 'Outcome_Status__c', required: true },
  { key: 'outcome.metric', label: 'Outcome metric', object: 'Ventus_Decision__c', field: 'Outcome_Metric__c', required: true },
];

export class SalesforceFscError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'SalesforceFscError';
    this.status = status;
  }
}

export function createSalesforceFscService({ fetchImpl = fetch, buildTaskRecord }) {
  if (typeof buildTaskRecord !== 'function') throw new Error('buildTaskRecord is required');

  async function authenticate(config) {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.salesforceClientId,
      client_secret: config.salesforceClientSecret,
    });
    const response = await fetchImpl(`${config.salesforceLoginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!response.ok) throw new SalesforceFscError(`Salesforce authentication failed (${response.status})`, 502);
    const data = await response.json();
    if (!data.access_token || !data.instance_url) {
      throw new SalesforceFscError('Salesforce token response is incomplete', 502);
    }
    return {
      accessToken: data.access_token,
      instanceUrl: String(data.instance_url).replace(/\/$/, ''),
    };
  }

  async function salesforceJson({ auth, path, method = 'GET', body }) {
    const response = await fetchImpl(`${auth.instanceUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      throw new SalesforceFscError(`Salesforce ${method} failed (${response.status})`, 502);
    }
    return response.json();
  }

  async function createRecord(auth, objectName, record) {
    const created = await salesforceJson({
      auth,
      path: `/services/data/${API_VERSION}/sobjects/${objectName}`,
      method: 'POST',
      body: record,
    });
    if (!created.id) throw new SalesforceFscError(`Salesforce ${objectName} create returned no id`, 502);
    return {
      id: created.id,
      url: `${auth.instanceUrl}/lightning/r/${objectName}/${created.id}/view`,
    };
  }

  async function discover({ config }) {
    const auth = await authenticate(config);
    const globalDescribe = await salesforceJson({
      auth,
      path: `/services/data/${API_VERSION}/sobjects/`,
    });
    const globalObjects = Array.isArray(globalDescribe.sobjects) ? globalDescribe.sobjects : [];
    const availableNames = new Set(globalObjects.map((item) => cleanText(item.name, 200)).filter(Boolean));
    const descriptions = await Promise.all(
      OBJECT_DEFINITIONS
        .filter((definition) => availableNames.has(definition.name))
        .map(async (definition) => [
          definition.name,
          await salesforceJson({
            auth,
            path: `/services/data/${API_VERSION}/sobjects/${encodeURIComponent(definition.name)}/describe`,
          }),
        ]),
    );
    return {
      system: 'Salesforce FSC',
      instanceDomain: new URL(auth.instanceUrl).hostname,
      apiVersion: API_VERSION,
      ...buildFscSchemaSummary(globalObjects, Object.fromEntries(descriptions)),
    };
  }

  async function verifyAccount({ config, accountId }) {
    const id = cleanSalesforceId(accountId);
    if (!id) throw new SalesforceFscError('A valid 15- or 18-character Salesforce Account ID is required');
    const auth = await authenticate(config);
    const account = await salesforceJson({
      auth,
      path: `/services/data/${API_VERSION}/sobjects/Account/${id}?fields=Id,IsPersonAccount,PersonContactId,RecordTypeId`,
    });
    return {
      system: 'Salesforce FSC',
      account: {
        id: cleanSalesforceId(account.Id) || null,
        verified: cleanSalesforceId(account.Id) === id,
        personAccount: account.IsPersonAccount === true,
        hasPersonContact: Boolean(cleanSalesforceId(account.PersonContactId)),
        hasRecordType: Boolean(cleanSalesforceId(account.RecordTypeId)),
      },
    };
  }

  async function deliver({ config, body, tenantId, now = new Date() }) {
    const packageTenantId = cleanText(asRecord(body.decisionPackage).tenantId, 100);
    if (body.decisionPackage !== undefined && packageTenantId !== tenantId) {
      throw new SalesforceFscError('Decision Package tenant does not match the connector session', 403);
    }
    const { task, activation } = buildTaskRecord(body, now);
    if (!task.Subject) throw new SalesforceFscError('subject is required');
    const auth = await authenticate(config);
    const warnings = [];
    const referralRecord = buildReferralRecord(body, config, now);
    let referral = null;
    if (body.fsc?.createReferral !== false && referralRecord) {
      try {
        referral = await createRecord(auth, 'Lead', referralRecord);
      } catch (error) {
        warnings.push({ stage: 'fsc_referral', message: String(error.message || error).slice(0, 220) });
      }
    }
    const taskRecord = referral
      ? {
          ...task,
          WhoId: referral.id,
          Description: `FSC QUALIFIED REFERRAL\nReferral: ${referral.id}\n\n${task.Description}`.slice(0, 8000),
        }
      : task;
    const taskReceipt = await createRecord(auth, 'Task', taskRecord);
    let decision = null;
    const decisionRecord = buildDecisionRecord(body, config, {
      referralId: referral?.id,
      taskId: taskReceipt.id,
    }, now);
    if (decisionRecord) {
      try {
        decision = await createRecord(auth, 'Ventus_Decision__c', decisionRecord);
      } catch (error) {
        warnings.push({ stage: 'decision_receipt', message: String(error.message || error).slice(0, 220) });
      }
    } else {
      warnings.push({
        stage: 'decision_receipt',
        message: 'Decision Receipt skipped because no complete Decision Package was supplied.',
      });
    }
    const primary = decision
      ? { object: 'Ventus_Decision__c', ...decision }
      : referral
        ? { object: 'Lead', ...referral }
        : { object: 'Task', ...taskReceipt };
    return {
      system: 'Salesforce',
      object: primary.object,
      id: primary.id,
      url: primary.url,
      instanceUrl: auth.instanceUrl,
      activation,
      records: { decision, referral, task: taskReceipt },
      warnings,
    };
  }

  async function readOutcome({ config, decisionRecordId, tenantId }) {
    const id = cleanSalesforceId(decisionRecordId);
    if (!id) throw new SalesforceFscError('decisionRecordId is invalid');
    const auth = await authenticate(config);
    const fields = encodeURIComponent([
      'Id',
      'Decision_Reference__c',
      'Decision_Package__c',
      'Human_Response__c',
      'Outcome_Status__c',
      'Outcome_Event_Type__c',
      'Outcome_Metric__c',
      'Outcome_Amount__c',
      'Outcome_Occurred_At__c',
      'Outcome_Source_Record_Id__c',
      'Outcome_Reason_Code__c',
      'LastModifiedById',
      'LastModifiedDate',
    ].join(','));
    const record = await salesforceJson({
      auth,
      path: `/services/data/${API_VERSION}/sobjects/Ventus_Decision__c/${id}?fields=${fields}`,
    });
    return normalizeOutcome(record, tenantId);
  }

  return { discover, verifyAccount, deliver, readOutcome };
}

export function buildFscSchemaSummary(globalObjects, describes) {
  const availableObjects = new Map(
    globalObjects.map((object) => [cleanText(object.name, 200), object]).filter(([name]) => name),
  );
  const objects = OBJECT_DEFINITIONS.map((definition) => {
    const summary = availableObjects.get(definition.name);
    const describe = describes[definition.name];
    const availableFields = new Map(
      (Array.isArray(describe?.fields) ? describe.fields : [])
        .map((field) => [cleanText(field.name, 200), field])
        .filter(([name]) => name),
    );
    return {
      ...definition,
      available: Boolean(summary && describe),
      queryable: summary?.queryable === true,
      createable: summary?.createable === true,
      updateable: summary?.updateable === true,
      fields: definition.fields.map((name) => {
        const field = availableFields.get(name);
        return {
          name,
          label: cleanText(field?.label, 200) || name,
          type: cleanText(field?.type, 100) || 'unknown',
          available: Boolean(field),
          createable: field?.createable === true,
          updateable: field?.updateable === true,
          nillable: field?.nillable === true,
          referenceTo: Array.isArray(field?.referenceTo)
            ? field.referenceTo.filter((item) => typeof item === 'string')
            : [],
        };
      }),
    };
  });
  const fieldIndex = new Set(
    objects.flatMap((object) => object.fields
      .filter((field) => object.available && field.available)
      .map((field) => `${object.name}.${field.name}`)),
  );
  const mappings = CANONICAL_MAPPINGS.map((mapping) => ({
    ...mapping,
    status: fieldIndex.has(`${mapping.object}.${mapping.field}`) ? 'ready' : 'missing',
  }));
  return {
    objects,
    mappings,
    capabilities: {
      customerAnchor: fieldIndex.has('Account.Id'),
      employeeTask: fieldIndex.has('Task.WhatId'),
      referral: fieldIndex.has('Lead.Id'),
      financialAccountContext: fieldIndex.has('FinServ__FinancialAccount__c.Id'),
      decisionReceipt: fieldIndex.has('Ventus_Decision__c.Decision_Reference__c')
        && fieldIndex.has('Ventus_Decision__c.Client_Account__c'),
      outcomeReturn: fieldIndex.has('Ventus_Decision__c.Outcome_Status__c')
        && fieldIndex.has('Ventus_Decision__c.Outcome_Metric__c'),
    },
    requiredMappingsReady: mappings.filter((mapping) => mapping.required)
      .every((mapping) => mapping.status === 'ready'),
  };
}

function buildReferralRecord(body, config, now) {
  const fsc = asRecord(body.fsc);
  const clientId = cleanSalesforceId(fsc.clientId || config.salesforceDemoAccountId);
  const recordTypeId = cleanSalesforceId(
    fsc.referralRecordTypeId || config.salesforceReferralRecordTypeId,
  );
  if (!clientId || !recordTypeId) return null;
  const insight = asRecord(body.insight);
  const estimatedValue = Number.isFinite(fsc.estimatedReferralValue)
    ? Math.max(0, Math.round(fsc.estimatedReferralValue))
    : null;
  return {
    RecordTypeId: recordTypeId,
    LastName: cleanText(insight.customerRef, 80) || 'Existing Client',
    Company: 'Existing client relationship',
    Status: 'New',
    Description: [
      'VENTUS QUALIFIED MOMENT',
      cleanText(insight.whyNow || insight.moment, 1200),
      '',
      'RECOMMENDED ACTION',
      cleanText(insight.recommendedAction, 1200),
      '',
      `Existing client Account: ${clientId}`,
      estimatedValue === null ? '' : `Estimated opportunity value: $${estimatedValue}`,
      `Decision reference: ${cleanText(insight.decisionRef, 160)}`,
      `Created by Ventus at ${now.toISOString()}`,
    ].filter((line) => line !== '').join('\n').slice(0, 32000),
  };
}

function buildDecisionRecord(body, config, workflow, now) {
  const decisionPackage = asRecord(body.decisionPackage);
  const decisionPackageV12 = asRecord(body.decisionPackageV12);
  const decisionId = cleanText(decisionPackage.decisionId, 160);
  if (!decisionId) return null;
  const growthPlay = asRecord(decisionPackage.growthPlay);
  const moment = asRecord(decisionPackage.moment);
  const recommendation = asRecord(decisionPackage.recommendation);
  const selectedAction = asRecord(recommendation.selectedAction);
  const governance = asRecord(decisionPackage.governance);
  const response = asRecord(decisionPackage.response);
  const outcome = asRecord(decisionPackage.outcome);
  const subject = asRecord(decisionPackage.subject);
  const clientId = cleanSalesforceId(
    asRecord(body.fsc).clientId || config.salesforceDemoAccountId,
  );
  const confidence = finitePercentage(moment.confidence);
  const snapshot = {
    schemaVersion: cleanText(decisionPackage.schemaVersion, 20) || '1.0',
    immutablePackage: {
      schemaVersion: cleanText(decisionPackageV12.schemaVersion, 20) || null,
      digest: cleanText(decisionPackageV12.packageDigest, 80) || null,
    },
    decisionId,
    tenantId: cleanText(decisionPackage.tenantId, 100),
    createdAt: cleanText(decisionPackage.createdAt, 40),
    evidenceClass: cleanText(decisionPackage.evidenceClass, 40),
    growthPlay: {
      id: cleanText(growthPlay.id, 100),
      name: cleanText(growthPlay.name, 120),
      businessLine: cleanText(growthPlay.businessLine, 100),
      objective: cleanText(growthPlay.objective, 180),
      primaryMetric: cleanText(growthPlay.primaryMetric, 100),
    },
    subject: { token: cleanText(subject.token, 160) },
    moment: {
      type: cleanText(moment.type, 180),
      summary: cleanText(moment.summary, 700),
      confidence,
    },
    recommendation: {
      actionId: cleanText(selectedAction.id, 100),
      title: cleanText(selectedAction.title, 180),
      destination: cleanText(selectedAction.destination, 120),
    },
    governance: {
      policyStatus: cleanText(governance.policyStatus, 40),
      controls: cleanList(governance.controls, 8, 100),
      assignmentArm: cleanText(governance.assignmentArm, 40),
    },
    response: {
      status: cleanText(response.status, 40),
      actor: cleanText(response.actor, 160),
      recordedAt: cleanText(response.recordedAt, 40),
    },
    outcome: {
      metric: cleanText(outcome.metric, 100),
      status: cleanText(outcome.status, 40) || 'measuring',
    },
    workflow: {
      referralId: cleanSalesforceId(workflow.referralId),
      taskId: cleanSalesforceId(workflow.taskId),
    },
    mirroredAt: now.toISOString(),
  };
  return {
    Decision_Reference__c: decisionId,
    Schema_Version__c: snapshot.schemaVersion,
    Growth_Play__c: snapshot.growthPlay.name,
    Business_Objective__c: snapshot.growthPlay.objective,
    Customer_Moment__c: snapshot.moment.type,
    Recommended_Action__c: snapshot.recommendation.title,
    Confidence__c: confidence,
    Evidence_Class__c: snapshot.evidenceClass,
    Policy_Status__c: snapshot.governance.policyStatus,
    Human_Response__c: snapshot.response.status,
    Outcome_Status__c: snapshot.outcome.status,
    Outcome_Event_Type__c: snapshot.outcome.metric,
    Outcome_Metric__c: snapshot.outcome.metric,
    Workflow_Record_Id__c: cleanSalesforceId(workflow.referralId || workflow.taskId),
    Decision_Package__c: JSON.stringify(snapshot).slice(0, 32000),
    ...(clientId ? { Client_Account__c: clientId } : {}),
  };
}

function normalizeOutcome(record, tenantId) {
  const decisionRecordId = requireSalesforceId(record.Id, 'Salesforce decision record');
  let snapshot;
  try {
    snapshot = JSON.parse(record.Decision_Package__c);
  } catch {
    throw new SalesforceFscError('Decision Receipt contains malformed Decision Package JSON', 409);
  }
  if (cleanText(snapshot.tenantId, 128) !== tenantId) {
    throw new SalesforceFscError('Decision Receipt belongs to another tenant', 403);
  }
  const decisionId = cleanText(snapshot.decisionId, 160);
  if (!decisionId || cleanText(record.Decision_Reference__c, 160) !== decisionId) {
    throw new SalesforceFscError('Decision Receipt reference mismatch', 409);
  }
  const outcomeStatus = cleanText(record.Outcome_Status__c || snapshot.outcome?.status, 40);
  return {
    decisionRecordId,
    decisionId,
    schemaVersion: cleanText(snapshot.schemaVersion, 20),
    evidenceClass: cleanText(snapshot.evidenceClass, 40),
    response: {
      status: cleanText(record.Human_Response__c || snapshot.response?.status || 'pending', 40),
      actorToken: cleanText(record.LastModifiedById, 32) || null,
      recordedAt: nullableIsoDate(record.LastModifiedDate),
    },
    outcome: {
      status: outcomeStatus,
      observation: outcomeStatus === 'measured'
        ? {
            eventType: cleanText(record.Outcome_Event_Type__c, 128),
            occurredAt: nullableIsoDate(record.Outcome_Occurred_At__c),
            sourceSystem: 'salesforce-fsc',
            sourceRecordId: cleanText(record.Outcome_Source_Record_Id__c, 128) || decisionRecordId,
            reasonCode: cleanText(record.Outcome_Reason_Code__c, 128) || null,
            metric: cleanText(record.Outcome_Metric__c || snapshot.outcome?.metric, 100),
            amount: Number.isFinite(record.Outcome_Amount__c) ? record.Outcome_Amount__c : null,
            currency: 'USD',
          }
        : null,
    },
    measurementStatus: outcomeStatus === 'measured' ? 'observed_unmeasured' : 'awaiting_outcome',
    businessClaimAllowed: false,
    causalClaimAllowed: false,
  };
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
}

function cleanList(value, maxItems, maxLength) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];
}

function cleanSalesforceId(value) {
  const id = cleanText(value, 18);
  return SALESFORCE_ID.test(id) ? id : '';
}

function requireSalesforceId(value, label) {
  const id = cleanSalesforceId(value);
  if (!id) throw new SalesforceFscError(`${label} is invalid`);
  return id;
}

function finitePercentage(value) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
}

function nullableIsoDate(value) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
