import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

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

/**
 * Rewrites visible text nodes under the given root whenever the mode changes
 * or new content renders. Works on the real DOM, so it catches text produced
 * inside any child component. Originals are remembered so switching back to
 * bank mode restores the exact original wording.
 */
export function useInstitutionDomSwap(ref: { current: HTMLElement | null }) {
  const { mode } = useInstitution();
  const originalsRef = useRef(new Map<Text, { original: string; applied: string }>());
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const originals = originalsRef.current;

    const apply = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        const current = node.nodeValue ?? "";
        let entry = originals.get(node);
        if (!entry || current !== entry.applied) {
          // New node, or React re-rendered the text — treat current as the original.
          entry = { original: current, applied: current };
          originals.set(node, entry);
        }
        const next =
          mode === "bank" ? entry.original : applyInstitutionTerms(entry.original, mode);
        if (current !== next) {
          node.nodeValue = next;
          entry.applied = next;
        }
        node = walker.nextNode() as Text | null;
      }
    };

    apply();
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        apply();
      });
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mode, ref]);
}
