import { createContext, useContext, useEffect, useState } from "react";
import { AuthService, type AuthUser } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; schoolCode?: string }) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(AuthService.getUser());

  const { isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!AuthService.getToken() && !user,
    retry: false,
    staleTime: Infinity,
    meta: {
      onSuccess: (userData: AuthUser) => {
        setUser(userData);
        AuthService.setAuth({ token: AuthService.getToken()!, user: userData });
      },
      onError: () => {
        AuthService.clearAuth();
        setUser(null);
      }
    }
  });

  const login = async (credentials: { email: string; password: string; schoolCode?: string }) => {
    const response = await authApi.login(credentials);
    AuthService.setAuth(response);
    setUser(response.user);
  };

  const logout = () => {
    AuthService.clearAuth();
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (role: string) => AuthService.hasRole(role);
  const hasAnyRole = (roles: string[]) => AuthService.hasAnyRole(roles);
  const canAccessSchool = (schoolId: string) => AuthService.canAccessSchool(schoolId);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      hasRole,
      hasAnyRole,
      canAccessSchool
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
