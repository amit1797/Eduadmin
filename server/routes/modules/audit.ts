import { Router } from "express";
import { storage } from "../../storage";
import { authenticateToken, type AuthRequest } from "../../middleware/auth";

export const auditRouter = Router();
  // Audit logs routes
  auditRouter.get("/audit-logs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const schoolId = req.user!.role === "super_admin" ? undefined : req.user!.schoolId;
      const logs = await storage.getAuditLogs(schoolId || undefined);
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
 
