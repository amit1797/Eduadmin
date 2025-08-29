import { type User } from "@shared/schema";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export class AuthService {
  private static TOKEN_KEY = "auth_token";
  private static USER_KEY = "auth_user";
  private static REFRESH_KEY = "refresh_token";
  private static refreshTimer: number | null = null;
  private static REFRESH_BUFFER_MS = 60_000; // refresh 60s before expiry

  static setAuth(data: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
  }

  // New: set access + refresh together when available
  static setAuthWithRefresh(data: LoginResponse & { refreshToken?: string }) {
    this.setAuth(data);
    if (data.refreshToken) localStorage.setItem(this.REFRESH_KEY, data.refreshToken);
    // Schedule a proactive refresh based on access token expiry
    const token = data.token;
    if (token) this.startProactiveRefresh(token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  static getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Ensure refresh token is also cleared if present
    localStorage.removeItem(this.REFRESH_KEY);
    this.stopProactiveRefresh();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static hasRole(role: string): boolean {
    const user = this.getUser();
    return user ? user.role === role : false;
  }

  static hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  static canAccessSchool(schoolId: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (user.role === "super_admin") return true;
    return user.schoolId === schoolId;
  }

  // Proactive refresh scheduler
  static startProactiveRefresh(accessToken?: string) {
    try {
      const token = accessToken ?? this.getToken();
      if (!token) return;
      const exp = this.decodeJwtExp(token);
      if (!exp) return;
      const now = Date.now();
      const target = exp * 1000 - this.REFRESH_BUFFER_MS; // ms
      const delay = Math.max(0, target - now);
      this.stopProactiveRefresh();
      // Use window.setTimeout typing
      this.refreshTimer = window.setTimeout(() => {
        this.performRefresh();
      }, delay) as unknown as number;
    } catch {
      // noop
    }
  }

  static stopProactiveRefresh() {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer as unknown as number);
      this.refreshTimer = null;
    }
  }

  private static decodeJwtExp(token: string): number | null {
    try {
      const [, payload] = token.split(".");
      if (!payload) return null;
      const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return typeof json.exp === "number" ? json.exp : null;
    } catch {
      return null;
    }
  }

  private static async performRefresh() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return;
      const res = await fetch(`/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return;
      const data = await res.json();
      this.setAuthWithRefresh({ token: data.accessToken, user: data.user, refreshToken: data.refreshToken });
      // setAuthWithRefresh will reschedule
    } catch {
      // ignore; next API call will handle via 401 flow
    }
  }
}
