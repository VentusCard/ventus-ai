const SALESFORCE_ID = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;

export function buildSalesforceTaskRecord(body = {}, now = new Date()) {
  const insight = body.insight && typeof body.insight === 'object' ? body.insight : {};
  const confidence = Number.isFinite(insight.confidence)
    ? Math.max(0, Math.min(100, Math.round(insight.confidence)))
    : null;
  const evidence = Array.isArray(insight.evidence)
    ? insight.evidence.slice(0, 4).map((item) => ({
      label: cleanText(item?.label, 140),
      confidence: Number.isFinite(item?.confidence) ? Math.round(item.confidence) : null,
    })).filter((item) => item.label)
    : [];
  const controls = Array.isArray(insight.controls)
    ? insight.controls.map((item) => cleanText(item, 100)).filter(Boolean).slice(0, 6)
    : [];
  const section = (heading, lines) => lines.length ? `${heading}\n${lines.join('\n')}` : '';
  const subject = cleanText(body.subject, 255);
  const description = [
    section('WHY THIS NEEDS ATTENTION', [cleanText(insight.whyNow || insight.moment, 700)].filter(Boolean)),
    section('RECOMMENDED NEXT STEP', [cleanText(insight.recommendedAction, 700)].filter(Boolean)),
    section('BUSINESS OUTCOME', [cleanText(insight.expectedOutcome, 220)].filter(Boolean)),
    section('SUPPORTING SIGNALS', evidence.map((item) => `- ${item.label}${item.confidence === null ? '' : ` (${item.confidence}% confidence)`}`)),
    section('POLICY CONTROLS', controls.length ? [`Attached for review: ${controls.join(', ')}`] : []),
    section('ROUTING', [cleanText(insight.destination, 160)].filter(Boolean)),
    section('AUDIT', [
      cleanText(insight.growthPlay, 120) ? `Growth Play: ${cleanText(insight.growthPlay, 120)}` : '',
      cleanText(insight.customerRef, 120) ? `Customer reference: ${cleanText(insight.customerRef, 120)}` : '',
      cleanText(insight.decisionRef, 160) ? `Decision reference: ${cleanText(insight.decisionRef, 160)}` : '',
      cleanText(insight.sourceName, 160) ? `Evidence source: ${cleanText(insight.sourceName, 160)}` : '',
      confidence === null ? '' : `Decision confidence: ${confidence}%`,
    ].filter(Boolean)),
  ].filter(Boolean).join('\n\n');
  const dueInDays = Number.isFinite(body.dueInDays)
    ? Math.max(1, Math.min(30, Math.round(body.dueInDays)))
    : 3;
  const dueDate = new Date(now.getTime() + dueInDays * 864e5).toISOString().slice(0, 10);
  const connectorSource = cleanText(body.source, 100) || 'ventus-connector';
  const whoId = cleanSalesforceId(body.whoId);
  const whatId = cleanSalesforceId(body.whatId);
  return {
    task: {
      Subject: subject,
      Description: `${description}${description ? '\n\n' : ''}Connector: Ventus | ${connectorSource} | ${now.toISOString()}`.slice(0, 8000),
      Priority: body.priority === 'Normal' || body.priority === 'High'
        ? body.priority
        : confidence !== null && confidence >= 85 ? 'High' : 'Normal',
      Status: 'Not Started',
      ActivityDate: dueDate,
      ...(whoId ? { WhoId: whoId } : {}),
      ...(whatId ? { WhatId: whatId } : {}),
    },
    activation: {
      subject,
      businessLine: cleanText(insight.businessLine, 100),
      growthPlay: cleanText(insight.growthPlay, 120),
      moment: cleanText(insight.moment, 180),
      recommendedAction: cleanText(insight.recommendedAction, 700),
      expectedOutcome: cleanText(insight.expectedOutcome, 220),
      destination: cleanText(insight.destination, 160),
      confidence,
    },
  };
}

function cleanSalesforceId(value) {
  const id = cleanText(value, 18);
  return SALESFORCE_ID.test(id) ? id : '';
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
}
