"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getCurrentUserPermissions } from "@/lib/actions/authorization-actions";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import type { AuthUser } from "@/lib/types/auth";

interface AuthorizationContextType {
  user: AuthUser | null;
  permissions: Record<string, string[]>;
  hasPermission: (pagePath: string, permission: string) => boolean;
  isLoading: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType>({
  user: null,
  permissions: {},
  hasPermission: () => false,
  isLoading: true,
});

export function useAuthorization() {
  return useContext(AuthorizationContext);
}

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadPermissions = useCallback(async () => {
    try {
      const [currentUser, userPermissions] = await Promise.all([
        getCurrentUser(),
        getCurrentUserPermissions(),
      ]);
      setUser(currentUser);
      setPermissions(userPermissions);
    } catch {
      setUser(null);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback(
    (pagePath: string, permission: string): boolean => {
      if (!user) return false;
      if (user.userId === "fallback") return true;
      const pagePerms = permissions[pagePath];
      return pagePerms?.includes(permission) ?? false;
    },
    [user, permissions]
  );

  return (
    <AuthorizationContext.Provider
      value={{ user, permissions, hasPermission, isLoading }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}
