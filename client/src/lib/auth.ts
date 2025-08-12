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

  static setAuth(data: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
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
}
