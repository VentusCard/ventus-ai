// White-label tenancy: one console, many institutions. A tenant carries the
// brand chrome and business vocabulary; the decision infrastructure underneath
// is identical. BofA ships preconfigured so the moment integration is
// sanctioned, their operators sign in and the console is already theirs.

export type Tenant = {
  id: string;
  name: string;
  shortName: string;
  product: string; // white-label product name shown in the console chrome
  accent: string; // institutional accent for the workspace
  accentWash: string;
  mark: { letter: string; bg: string; flag?: boolean }; // flag = BofA red stripe motif
  domains: string[]; // sign-up email domains that resolve to this tenant
  businessLines: string[];
  defaultBusinessLine: string;
};

export const TENANTS: Record<string, Tenant> = {
  ventus: {
    id: "ventus",
    name: "Ventus AI",
    shortName: "Ventus",
    product: "Growth Console",
    accent: "#2060e8",
    accentWash: "#e8eefc",
    mark: { letter: "V", bg: "#10131a" },
    domains: ["ventusai.com"],
    businessLines: ["Consumer Banking", "Wealth Management"],
    defaultBusinessLine: "Consumer Banking",
  },
  bofa: {
    id: "bofa",
    name: "Bank of America",
    shortName: "BofA",
    product: "Growth Console",
    accent: "#012169",
    accentWash: "#e7ebf4",
    mark: { letter: "B", bg: "#012169", flag: true },
    domains: ["bofa.com", "bankofamerica.com", "ml.com", "baml.com"],
    businessLines: ["Consumer Banking", "Merrill Wealth Management"],
    defaultBusinessLine: "Consumer Banking",
  },
};

const DEMO_TENANT_KEY = "ventus_console_tenant";

// Email domain decides the institution. A persisted override lets Ventus run a
// white-glove walkthrough as any tenant before that tenant's SSO exists.
export function resolveTenant(email: string | null | undefined): Tenant {
  if (typeof window !== "undefined") {
    const override = window.sessionStorage.getItem(DEMO_TENANT_KEY);
    if (override && TENANTS[override]) return TENANTS[override];
  }
  const domain = email?.split("@")[1]?.toLowerCase();
  if (domain) {
    for (const tenant of Object.values(TENANTS)) {
      if (tenant.domains.includes(domain)) return tenant;
    }
  }
  return TENANTS.ventus;
}

export function setTenantOverride(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id && TENANTS[id]) window.sessionStorage.setItem(DEMO_TENANT_KEY, id);
  else window.sessionStorage.removeItem(DEMO_TENANT_KEY);
}

export function tenantOverride(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(DEMO_TENANT_KEY);
}
