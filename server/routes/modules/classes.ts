import { Router } from "express";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requireSchoolAccess, 
  requireModule, 
  requirePermission,
  type AuthRequest
} from "../../middleware/auth";

export const classRouter = Router({ mergeParams: true });
  // Class stats for school admin
  classRouter.get("/stats", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const stats = await storage.getSchoolStats(schoolId);
      res.json(stats);
    } catch (error) {
      console.error("School stats error:", error);
      res.status(500).json({ message: "Failed to fetch school stats" });
    }
  });

  // Class management routes
  classRouter.get("/classes", authenticateToken, requireSchoolAccess, requireModule("class_management"), requirePermission("class_management", "read"), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const classes = await storage.getClassesBySchool(schoolId);
      res.json(classes);
    } catch (error) {
      console.error("Get classes error:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  classRouter.post("/classes", authenticateToken, requireSchoolAccess, requireModule("class_management"), requirePermission("class_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const classData = { ...req.body, schoolId };
      
      const newClass = await storage.createClass(classData);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "class",
        resourceId: newClass.id,
        schoolId,
        newValues: classData
      });

      res.status(201).json(newClass);
    } catch (error) {
      console.error("Create class error:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

