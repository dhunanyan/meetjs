"use client";

import * as React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { isMswEnabled } from "@/utils/msw";

type MswContextValue = {
  mockingEnabled: boolean;
  ready: boolean;
  interceptionEnabled: boolean;
  setInterceptionEnabled: (enabled: boolean) => Promise<void>;
};

const MswContext = React.createContext<MswContextValue | null>(null);

export function useMsw() {
  const context = React.useContext(MswContext);
  if (!context) {
    throw new Error("useMsw must be used within MswProvider");
  }
  return context;
}

export function MswProvider({ children }: { children: React.ReactNode }) {
  const mockingEnabled = isMswEnabled();
  const [ready, setReady] = React.useState(!mockingEnabled);
  const [interceptionEnabled, setInterceptionEnabledState] =
    React.useState(mockingEnabled);

  const setInterceptionEnabled = React.useCallback(
    async (enabled: boolean) => {
      if (!mockingEnabled) return;
      const { setMswInterception } = await import("@/mocks/browser");
      await setMswInterception(enabled);
      setInterceptionEnabledState(enabled);
    },
    [mockingEnabled],
  );

  React.useEffect(() => {
    const run = async () => {
      if (!mockingEnabled) {
        setInterceptionEnabledState(false);
        setReady(true);
        return;
      }

      const { enableMsw } = await import("@/mocks/browser");
      await enableMsw();
      setInterceptionEnabledState(true);
      setReady(true);
    };

    void run();
  }, [mockingEnabled]);

  const value = React.useMemo<MswContextValue>(
    () => ({
      mockingEnabled,
      ready,
      interceptionEnabled,
      setInterceptionEnabled,
    }),
    [mockingEnabled, ready, interceptionEnabled, setInterceptionEnabled],
  );

  if (!ready) {
    return (
      <div className="app-loading-shell">
        <LoadingState
          title="Preparing Mock Environment"
          subtitle="Bootstrapping Mock Service Worker for this session"
        />
      </div>
    );
  }

  return <MswContext.Provider value={value}>{children}</MswContext.Provider>;
}
