import { useEffect, useState, useCallback } from "react";

export interface PricingModule {
  id: string;
  name: string;
  description: string;
  fixedFee: number;
  perUserFee: number;
  enabled: boolean;
}

export const DEFAULT_PRICING_CATALOG: PricingModule[] = [
  {
    id: "enrichment",
    name: "Transaction Enrichment Engine",
    description: "Semantic enrichment, merchant identity, MCC normalization",
    fixedFee: 250000,
    perUserFee: 0.4,
    enabled: true,
  },
  {
    id: "smart-rewards",
    name: "Smart Rewards & Deal Personalization",
    description: "Lifestyle-driven offer matching and merchant pipeline",
    fixedFee: 150000,
    perUserFee: 0.3,
    enabled: true,
  },
  {
    id: "wealth-copilot",
    name: "Wealth Copilot (Advisor Console)",
    description: "Behavioral signals, talking points, and follow-up drafts for advisors",
    fixedFee: 200000,
    perUserFee: 1.2,
    enabled: true,
  },
  {
    id: "travel",
    name: "Travel Experience",
    description: "Trip detection, fare matching, and travel rewards",
    fixedFee: 100000,
    perUserFee: 0.2,
    enabled: true,
  },
  {
    id: "analytics",
    name: "Bank-Wide Analytics",
    description: "Persona, wallet share, lifestyle, and journey dashboards",
    fixedFee: 180000,
    perUserFee: 0.25,
    enabled: true,
  },
  {
    id: "life-events",
    name: "Life Event Detection",
    description: "Early signals across home, family, retirement, education",
    fixedFee: 120000,
    perUserFee: 0.35,
    enabled: true,
  },
  {
    id: "risk-fvi",
    name: "Risk & Financial Vulnerability Intelligence",
    description: "Behavioral risk cohorts, fraud, AML, and vice signals",
    fixedFee: 160000,
    perUserFee: 0.3,
    enabled: true,
  },
  {
    id: "conversational-ai",
    name: "Conversational AI (Consumer + Banker)",
    description: "Customer chat and banker copilot grounded in enriched data",
    fixedFee: 140000,
    perUserFee: 0.5,
    enabled: true,
  },
];

export interface PilotConfig {
  customers: number;
  flatFee: number;
}

export const DEFAULT_PILOT_CONFIG: PilotConfig = {
  customers: 100_000,
  flatFee: 200_000,
};

const STORAGE_KEY = "ventus_pricing_catalog_v1";
const PILOT_STORAGE_KEY = "ventus_pricing_pilot_v1";

export function usePricingCatalog() {
  const [catalog, setCatalog] = useState<PricingModule[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PRICING_CATALOG;
      const parsed = JSON.parse(raw) as PricingModule[];
      // Merge: keep stored values but ensure new default modules also appear.
      const map = new Map(parsed.map((m) => [m.id, m]));
      return DEFAULT_PRICING_CATALOG.map((d) => map.get(d.id) ?? d);
    } catch {
      return DEFAULT_PRICING_CATALOG;
    }
  });

  const [pilot, setPilot] = useState<PilotConfig>(() => {
    try {
      const raw = localStorage.getItem(PILOT_STORAGE_KEY);
      if (!raw) return DEFAULT_PILOT_CONFIG;
      const parsed = JSON.parse(raw) as Partial<PilotConfig>;
      return {
        customers: parsed.customers ?? DEFAULT_PILOT_CONFIG.customers,
        flatFee: parsed.flatFee ?? DEFAULT_PILOT_CONFIG.flatFee,
      };
    } catch {
      return DEFAULT_PILOT_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    } catch {
      // ignore quota errors
    }
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem(PILOT_STORAGE_KEY, JSON.stringify(pilot));
    } catch {
      // ignore
    }
  }, [pilot]);

  const updateModule = useCallback((id: string, patch: Partial<PricingModule>) => {
    setCatalog((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const updatePilot = useCallback((patch: Partial<PilotConfig>) => {
    setPilot((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setCatalog(DEFAULT_PRICING_CATALOG);
    setPilot(DEFAULT_PILOT_CONFIG);
  }, []);

  return { catalog, setCatalog, updateModule, resetToDefaults, pilot, updatePilot };
}
