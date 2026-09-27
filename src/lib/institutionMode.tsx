import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useState, type ReactNode } from "react";

export type InstitutionMode = "bank" | "credit-union";

const STORAGE_KEY = "deckmo_institution";
const CHANGE_EVENT = "deckmo-institution-change";

export function getInstitutionMode(): InstitutionMode {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "credit-union" ? "credit-union" : "bank";
  } catch {
    return "bank";
  }
}

export function setInstitutionMode(mode: InstitutionMode) {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private mode — fall back to in-memory event only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Case-preserving terminology swap for credit-union mode.
 * "banking" is intentionally left alone — credit unions do banking too.
 */
export function applyInstitutionTerms(text: string, mode: InstitutionMode): string {
  if (mode === "bank") return text;
  return text
    .replace(/Our Bank/g, "Our CU")
    .replace(/\bBanks\b/g, "Credit Unions")
    .replace(/\bbanks\b/g, "credit unions")
    .replace(/\bBANKS\b/g, "CREDIT UNIONS")
    .replace(/\bBank\b/g, "Credit Union")
    .replace(/\bbank\b/g, "credit union")
    .replace(/\bBANK\b/g, "CREDIT UNION")
    .replace(/\bCustomers\b/g, "Members")
    .replace(/\bcustomers\b/g, "members")
    .replace(/\bCUSTOMERS\b/g, "MEMBERS")
    .replace(/\bCustomer\b/g, "Member")
    .replace(/\bcustomer\b/g, "member")
    .replace(/\bCUSTOMER\b/g, "MEMBER");
}

const InstitutionContext = createContext<{ mode: InstitutionMode }>({ mode: "bank" });

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<InstitutionMode>(() => getInstitutionMode());
  useEffect(() => {
    const onChange = () => setMode(getInstitutionMode());
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);
  return <InstitutionContext.Provider value={{ mode }}>{children}</InstitutionContext.Provider>;
}

export function useInstitution() {
  return useContext(InstitutionContext);
}

function mapStrings(node: ReactNode, mode: InstitutionMode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === "string") return applyInstitutionTerms(child, mode);
    if (isValidElement(child)) {
      const kids = (child.props as { children?: ReactNode } | null)?.children;
      if (kids == null) return child;
      return cloneElement(child, undefined, mapStrings(kids, mode));
    }
    return child;
  });
}

/**
 * Recursively swaps institution terminology in every rendered string child.
 * No-op in bank mode.
 */
export function InstitutionTerms({ children }: { children: ReactNode }) {
  const { mode } = useInstitution();
  if (mode === "bank") return <>{children}</>;
  return <>{mapStrings(children, mode)}</>;
}
