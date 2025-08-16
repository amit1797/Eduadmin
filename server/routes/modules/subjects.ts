import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requireSchoolAccess, 
  requireModule, 
  requirePermission,
  type AuthRequest
} from "../../middleware/auth";
import { insertSubjectSchema } from "@shared/schema";

export const subjectRouter = Router({ mergeParams: true });
  // Subjects routes
  subjectRouter.get("/subjects", authenticateToken, requireSchoolAccess, requireModule("academics_management"), requirePermission("academics_management", "read"), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const subjects = await storage.getSubjectsBySchool(schoolId);
      res.json(subjects);
    } catch (error) {
      console.error("Get subjects error:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  subjectRouter.post("/subjects", authenticateToken, requireSchoolAccess, requireModule("academics_management"), requirePermission("academics_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const data = insertSubjectSchema.parse({ ...req.body, schoolId });
      const subject = await storage.createSubject(data);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "subject",
        resourceId: subject.id,
        schoolId,
        newValues: data
      });

      res.status(201).json(subject);
    } catch (error) {
      console.error("Create subject error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  subjectRouter.put("/subjects/:id", authenticateToken, requireSchoolAccess, requireModule("academics_management"), requirePermission("academics_management", "update"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSubject(id, req.body);

      await storage.logActivity({
        userId: req.user!.id,
        action: "update",
        resource: "subject",
        resourceId: id,
        schoolId: req.user!.schoolId || undefined,
        newValues: req.body
      });

      res.json(updated);
    } catch (error) {
      console.error("Update subject error:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  subjectRouter.delete("/subjects/:id", authenticateToken, requireSchoolAccess, requireModule("academics_management"), requirePermission("academics_management", "delete"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubject(id);
      await storage.logActivity({
        userId: req.user!.id,
        action: "delete",
        resource: "subject",
        resourceId: id,
        schoolId: req.user!.schoolId || undefined
      });
      res.status(204).send();
    } catch (error) {
      console.error("Delete subject error:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

