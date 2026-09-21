import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../../lib/api-client/auth";
import type { AuthUser } from "../../lib/api-client/auth";
import { ApiError } from "../../lib/api-client/client";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Limpa resíduos de versões anteriores que guardavam o JWT em localStorage.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error(err);
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    setUser(res.user);
  }

  async function register(email: string, name: string, password: string) {
    const res = await authApi.register(email, name, password);
    setUser(res.user);
  }

  async function logout() {
    await authApi.logout().catch(() => undefined);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
