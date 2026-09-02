import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

interface RequestAccessContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const RequestAccessContext = createContext<RequestAccessContextValue | null>(null);

/**
 * Holds the single Request Access modal's open/closed state so the header
 * CTA, the hero CTA, and the Activation closing-band CTA can all open the
 * same modal without prop drilling. Wrap LandingPage's tree in this once;
 * every CTA and the modal itself call useRequestAccess().
 */
export function RequestAccessProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <RequestAccessContext.Provider value={value}>{children}</RequestAccessContext.Provider>;
}

export function useRequestAccess() {
  const ctx = useContext(RequestAccessContext);
  if (!ctx) {
    throw new Error("useRequestAccess must be called within a RequestAccessProvider");
  }
  return ctx;
}
