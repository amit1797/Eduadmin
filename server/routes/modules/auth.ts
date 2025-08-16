import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { 
  generateToken,
  comparePassword,
  authenticateToken,
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

      const token = generateToken(user);

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
        token,
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

