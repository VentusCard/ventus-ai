const STORAGE_KEY = "demo_bank_config";

export type DemoBankConfig = {
  mode: "generic" | "custom";
  bankName?: string;
  bankShortName?: string;
};

export type BankPromptContext = {
  bankName: string;
  bankShortName?: string;
} | null;

export function getDemoBankConfig(): DemoBankConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "generic" };
    const parsed = JSON.parse(raw);
    if (parsed?.mode === "custom" && typeof parsed.bankName === "string" && parsed.bankName.trim()) {
      return {
        mode: "custom",
        bankName: parsed.bankName.trim().slice(0, 80),
        bankShortName: typeof parsed.bankShortName === "string" ? parsed.bankShortName.trim().slice(0, 40) : undefined,
      };
    }
    return { mode: "generic" };
  } catch {
    return { mode: "generic" };
  }
}

export function setDemoBankConfig(cfg: DemoBankConfig): void {
  try {
    if (cfg.mode === "generic") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: "generic" }));
    } else {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode: "custom",
          bankName: (cfg.bankName || "").trim().slice(0, 80),
          bankShortName: cfg.bankShortName ? cfg.bankShortName.trim().slice(0, 40) : undefined,
        })
      );
    }
  } catch {
    // ignore
  }
}

/** Returns context to spread into edge function bodies, or null for generic. */
export function getBankPromptContext(): BankPromptContext {
  const cfg = getDemoBankConfig();
  if (cfg.mode !== "custom" || !cfg.bankName) return null;
  return { bankName: cfg.bankName, bankShortName: cfg.bankShortName };
}
