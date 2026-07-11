import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiClientError } from '../../api/client';
import { fetchMe, login as apiLogin, logout as apiLogout } from '../../api/auth';
import type { AuthUser, DemoRole } from './authTypes';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (identifiant: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (role: DemoRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      // 200 + null = non connecté (évite le chemin d'exception Symfony, très lent en debug).
      setUser(await fetchMe());
      setError(null);
    } catch (e) {
      setUser(null);
      if (!(e instanceof ApiClientError && (e.status === 401 || e.status === 403))) {
        setError(e instanceof ApiClientError ? e.message : 'Session indisponible.');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (identifiant: string, code: string) => {
    setError(null);
    try {
      const connected = await apiLogin(identifiant, code);
      setUser(connected);
      return connected;
    } catch (e) {
      const message = e instanceof ApiClientError ? e.message : 'Connexion impossible.';
      setError(message);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const hasRole = useCallback((role: DemoRole) => user?.role === role, [user]);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, refresh, hasRole }),
    [user, loading, error, login, logout, refresh, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }
  return ctx;
}
