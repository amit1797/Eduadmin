import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { 
  generateTokens, 
  comparePassword, 
  authenticateToken, 
  refreshTokenHandler,
  verifyInviteToken,
  hashPassword,
  type AuthRequest
} from "../../middleware/auth";
import { loginSchema } from "@shared/schema";

export const authRouter = Router();

// Auth routes
authRouter.post("/login", async (req, res) => {
    try {
      const { email, password, schoolCode } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== "active") {
        return res.status(401).json({ message: "Account is not active" });
      }

      // Check school code for non-super admins
      if (user.role !== "super_admin") {
        if (!schoolCode) {
          return res.status(400).json({ message: "School code is required" });
        }

        const school = await storage.getSchoolByCode(schoolCode);
        if (!school || school.id !== user.schoolId) {
          return res.status(401).json({ message: "Invalid school code" });
        }
      }

      const tokens = generateTokens(user);

      // Log login activity
      await storage.logActivity({
        userId: user.id,
        action: "login",
        resource: "auth",
        schoolId: user.schoolId || undefined,
        ipAddress: req.ip,
        userAgent: Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : (req.headers["user-agent"] || undefined)
      });

      res.json({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Token refresh route for rotating access tokens
authRouter.post("/refresh", refreshTokenHandler);

// Logout route (stateless). Client will clear tokens; we log the action for audit.
authRouter.post("/logout", authenticateToken, async (req: AuthRequest, res) => {
  try {
    await storage.logActivity({
      userId: req.user!.id,
      action: "logout",
      resource: "auth",
      schoolId: req.user!.schoolId || undefined,
      ipAddress: req.ip,
      userAgent: Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : (req.headers["user-agent"] || undefined)
    });
  } catch (_) {
    // ignore logging failures
  }
  return res.status(204).send();
});

authRouter.get("/me", authenticateToken, async (req: AuthRequest, res) => {
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId
    });
  });

// Set password using invitation token
authRouter.post("/set-password", async (req, res) => {
  try {
    const bodySchema = z.object({ token: z.string().min(1), password: z.string().min(8) });
    const { token, password } = bodySchema.parse(req.body);

    const payload = verifyInviteToken(token);
    if (!payload) return res.status(400).json({ message: "Invalid or expired invite token" });

    const user = await storage.getUser(payload.id);
    if (!user || user.email !== payload.email) {
      return res.status(404).json({ message: "User not found for this invite" });
    }

    // Only allow if user is pending
    if (user.status !== "pending") {
      return res.status(400).json({ message: "Account is already active" });
    }

    const newHash = hashPassword(password);
    const updated = await storage.updateUser(user.id, {
      password: newHash,
      status: "active" as any,
    } as any);

    const tokens = generateTokens({ ...user, password: newHash, status: "active" } as any);

    return res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        schoolId: updated.schoolId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    return res.status(500).json({ message: "Failed to set password" });
  }
});
