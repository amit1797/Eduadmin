import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
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
