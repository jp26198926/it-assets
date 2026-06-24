"use client";

import { createContext, useContext, useState, useCallback } from "react";

type BreadcrumbOverrides = Record<string, string>;

interface BreadcrumbOverrideContextValue {
  overrides: BreadcrumbOverrides;
  setOverrides: (overrides: BreadcrumbOverrides) => void;
  clearOverrides: () => void;
}

const BreadcrumbOverrideContext = createContext<BreadcrumbOverrideContextValue>({
  overrides: {},
  setOverrides: () => {},
  clearOverrides: () => {},
});

export function BreadcrumbOverrideProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverridesState] = useState<BreadcrumbOverrides>({});

  const setOverrides = useCallback((o: BreadcrumbOverrides) => {
    setOverridesState(o);
  }, []);

  const clearOverrides = useCallback(() => {
    setOverridesState({});
  }, []);

  return (
    <BreadcrumbOverrideContext.Provider value={{ overrides, setOverrides, clearOverrides }}>
      {children}
    </BreadcrumbOverrideContext.Provider>
  );
}

export function useBreadcrumbOverrides() {
  return useContext(BreadcrumbOverrideContext);
}
