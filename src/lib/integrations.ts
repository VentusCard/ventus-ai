// System-native delivery payloads — Ventus's integration contract with the bank's stack.
// Pure functions with zero imports so the same module serves the web app (payload
// preview on the Route scene) and api/deliver.ts (actual writes to sandbox webhooks).
//
// Demo customer references are opaque (`tok_hh_*`) and contain no readable names.
// Production resolution requires a bank-issued token inside the bank perimeter.

export type DeliveryOpp = {
  id: string;
  type: string;
  client: string;
  value: string;
  valueLabel: string;
  confidence: number;
  action: string;
  reason: string;
  owner: string;
  destination: string;
};

export type DeliveryPayload = {
  system: string; // where it lands, in the bank's words
  object: string; // target object / event
  endpoint: string; // illustrative REST path the adapter calls
  payload: Record<string, unknown>;
};

const token = (o: DeliveryOpp) => {
  const source = `${o.id}:${o.client}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `tok_hh_${(hash >>> 0).toString(36).padStart(7, "0")}`;
};

// Common envelope: idempotent, consent-checked, auditable.
const envelope = (o: DeliveryOpp) => ({
  source: "ventus",
  signalId: `sig_${o.id}`,
  idempotencyKey: `ventus:${o.id}:v1`,
  confidence: o.confidence / 100,
  guardrailsCleared: true,
  customerRef: token(o),
});

export function buildDeliveryPayload(o: DeliveryOpp): DeliveryPayload {
  switch (o.destination) {
    case "advisor":
    case "merrill":
      return {
        system: "Salesforce · Financial Services Cloud",
        object: "Task → CEW Book 360 insight",
        endpoint: "POST /services/data/v61.0/sobjects/Task",
        payload: {
          ...envelope(o),
          Subject: `${o.type} — ${o.value} ${o.valueLabel}`,
          Description: o.action,
          Priority: "High",
          OwnerId: "{advisor.UserId}",
          WhatId: "{household.AccountId}",
          Ventus_Confidence__c: o.confidence,
          Ventus_Referral_Source__c: o.destination === "merrill" ? "consumer-banking" : "book",
        },
      };
    case "queue":
      return {
        system: "Salesforce · Financial Services Cloud",
        object: "FinServ__Referral__c → Private Bank pool",
        endpoint: "POST /services/data/v61.0/sobjects/FinServ__Referral__c",
        payload: {
          ...envelope(o),
          FinServ__ReferredTo__c: "{privateBank.QueueId}",
          FinServ__Description__c: o.action,
          Ventus_Value_At_Stake__c: o.value,
        },
      };
    case "campaign":
      return {
        system: "Salesforce Marketing Cloud",
        object: "Journey entry event",
        endpoint: "POST /interaction/v1/events",
        payload: {
          ...envelope(o),
          ContactKey: token(o),
          EventDefinitionKey: "APIEvent-Ventus-Nurture",
          Data: { play: o.type, consentVerified: true },
        },
      };
    case "erica":
      return {
        system: "Erica · proactive insights",
        object: "ProactiveInsight",
        endpoint: "POST {bank}/erica/v2/insights",
        payload: {
          ...envelope(o),
          insightType: o.id,
          headline: o.action,
          ctas: ["set_up_auto_save", "add_life_plan_goal", "talk_to_banker"],
          suppressionChecked: true,
        },
      };
    case "lending":
      return {
        system: "Home Lending",
        object: "SpecialistQueueItem",
        endpoint: "POST {bank}/lending/v1/queue-items",
        payload: {
          ...envelope(o),
          product: "mortgage-preapproval",
          consentOnFile: true,
          uniformCriteriaVersion: "ecoa-2026.2",
        },
      };
    case "rewards":
      return {
        system: "Preferred Rewards",
        object: "TierMoment platform event",
        endpoint: "POST /services/data/v61.0/sobjects/Ventus_Tier_Moment__e",
        payload: {
          ...envelope(o),
          tierGap: o.value,
          bankerFollowUp: true,
        },
      };
    default:
      return {
        system: "Banker workbench",
        object: "WorkItem + appointment hold",
        endpoint: "POST {bank}/workbench/v1/work-items",
        payload: {
          ...envelope(o),
          bankerRef: o.owner,
          offer: "preferred-rewards-primacy-bundle",
          appointmentHold: true,
        },
      };
  }
}
