import { useSyncExternalStore } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import type { EnrichedTransaction } from "@/components/exec-demo/execDemoData";

export interface ExecDemoSessionSnapshot {
  hasRun: boolean;
  customer: DemoCustomer | null;
  generatedOffers: RollupOfferGroup[] | null;
  productCards: ProductCard[] | null;
  detectedLifeEvents: LifeEvent[] | null;
  enrichedTxs: EnrichedTransaction[] | null;
  riskFlags: { flags: any[]; summary: string } | null;
  activeRollupLabel: string | null;
  activeRollupPillar: string | null;
}

const EMPTY: ExecDemoSessionSnapshot = {
  hasRun: false,
  customer: null,
  generatedOffers: null,
  productCards: null,
  detectedLifeEvents: null,
  enrichedTxs: null,
  riskFlags: null,
  activeRollupLabel: null,
  activeRollupPillar: null,
};

let snapshot: ExecDemoSessionSnapshot = EMPTY;
const listeners = new Set<() => void>();

function shallowEqual(a: ExecDemoSessionSnapshot, b: ExecDemoSessionSnapshot) {
  return (Object.keys(a) as (keyof ExecDemoSessionSnapshot)[]).every((k) => a[k] === b[k]);
}

export function publishExecDemoSession(patch: Partial<ExecDemoSessionSnapshot>) {
  const next = { ...snapshot, ...patch };
  if (shallowEqual(snapshot, next)) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useExecDemoSession(): ExecDemoSessionSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
