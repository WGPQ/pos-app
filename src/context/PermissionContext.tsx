"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type PermissionContextValue = {
  can: (permission: string) => boolean;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshPermissions = useCallback(async () => {
    try {
      const response = await fetch("/api/context", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      setPermissions(response.ok && Array.isArray(data?.permissions) ? data.permissions : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshPermissions(); }, [refreshPermissions]);
  const value = useMemo(() => ({ can: (permission: string) => permissions.includes(permission), loading, refreshPermissions }), [permissions, loading, refreshPermissions]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error("usePermissions must be used within PermissionProvider");
  return context;
}

export function Can({ permission, children, fallback = null }: { permission: string; children: ReactNode; fallback?: ReactNode }) {
  const { can, loading } = usePermissions();
  return !loading && can(permission) ? <>{children}</> : <>{fallback}</>;
}
