import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import type { AuthUser } from "@/lib/api/types";

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery<AuthUser | null>({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const onUnauthorized = () => {
      queryClient.setQueryData(queryKeys.me, null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [queryClient]);

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    login: async (email, password) => {
      const response = await authApi.login({ email, password });
      queryClient.setQueryData(queryKeys.me, response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
    register: async (input) => {
      const response = await authApi.register(input);
      queryClient.setQueryData(queryKeys.me, response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
    logout: async () => {
      await authApi.logout().catch(() => undefined);
      queryClient.setQueryData(queryKeys.me, null);
      queryClient.clear();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
