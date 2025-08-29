import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { User } from "@shared/schema";
import { validatePasswordStrength } from "./security";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET and JWT_REFRESH_SECRET environment variables are required");
}

export interface AuthRequest extends Request {
  user?: User;
  session?: {
    csrfToken?: string;
    [key: string]: any;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  schoolId?: string;
  type: "access" | "refresh" | "invite";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateTokens(user: User): AuthTokens {
  const accessPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId || undefined,
    type: "access",
  };

  const refreshPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId || undefined,
    type: "refresh",
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET as jwt.Secret, { expiresIn: "15m" });
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET as jwt.Secret, { expiresIn: "7d" });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // seconds
  };
}

// Back-compat: some callsites may still expect a single access token
export function generateToken(user: User): string {
  return generateTokens(user).accessToken;
}

// Invitation tokens for first-time password setup
export function generateInviteToken(payload: { id: string; email: string; role: string; schoolId?: string }, expiresIn: string | number = "2d") {
  const invitePayload: TokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    schoolId: payload.schoolId,
    type: "invite",
  };
  const options: jwt.SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(invitePayload, JWT_SECRET as jwt.Secret, options);
}

export function verifyInviteToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as unknown as TokenPayload;
    if (decoded.type !== "invite") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(`Password validation failed: ${validation.errors.join(", ")}`);
  }
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as unknown as TokenPayload;

    if (decoded.type !== "access") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await storage.getUser(decoded.id);

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Invalid token or user inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}

export async function refreshTokenHandler(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as jwt.Secret) as unknown as TokenPayload;

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await storage.getUser(decoded.id);

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user);

    res.json({
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export function requireSchoolAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;

  if (!schoolId) {
    return res.status(400).json({ message: "School ID is required" });
  }

  if (req.user.role === "super_admin") {
    return next();
  }

  if (req.user.schoolId !== schoolId) {
    return res.status(403).json({ message: "Access denied to this school" });
  }

  next();
}

export function requireModule(moduleName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      // Super admin bypasses module checks
      if (req.user.role === "super_admin") return next();

      const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
      if (!schoolId) return res.status(400).json({ message: "schoolId is required" });

      const modules = await storage.getEnabledModules(String(schoolId));
      if (!modules.includes(moduleName)) {
        return res.status(403).json({ message: `Module ${moduleName} is not enabled for this school` });
      }
      next();
    } catch (e) {
      return res.status(500).json({ message: "Module check failed" });
    }
  };
}

export function requirePermission(moduleName: string, permission: "create" | "read" | "update" | "delete") {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      // Super admin bypasses permission checks
      if (req.user.role === "super_admin") return next();

      const allowed = await storage.isPermissionAllowed(req.user.role, moduleName, permission);
      if (!allowed) {
        return res.status(403).json({ message: `Missing permission ${permission} on module ${moduleName}` });
      }
      next();
    } catch (e) {
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
}
