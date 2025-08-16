import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requirePermission,
  type AuthRequest
} from "../../middleware/auth";
import { assignClassSubjectSchema } from "@shared/schema";

export const classSubjectRouter = Router({ mergeParams: true });
  // Class-Subject assignments
  classSubjectRouter.get("/subjects", authenticateToken, requirePermission("academics_management", "read"), async (req, res) => {
    try {
      const { classId } = req.params;
      const items = await storage.getClassSubjects(classId);
      res.json(items);
    } catch (error) {
      console.error("Get class subjects error:", error);
      res.status(500).json({ message: "Failed to fetch class subjects" });
    }
  });

  classSubjectRouter.post("/subjects", authenticateToken, requirePermission("academics_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { classId } = req.params;
      const body = assignClassSubjectSchema.parse(req.body);
      const assignment = await storage.assignSubjectToClass({
        classId,
        subjectId: body.subjectId,
        teacherId: body.teacherId
      });

      await storage.logActivity({
        userId: req.user!.id,
        action: "assign",
        resource: "class_subject",
        resourceId: assignment.id,
        schoolId: req.user!.schoolId || undefined,
        newValues: { classId, ...body }
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign class subject error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign subject to class" });
    }
  });

  classSubjectRouter.delete("/subjects/:classSubjectId", authenticateToken, requirePermission("academics_management", "delete"), async (req: AuthRequest, res) => {
    try {
      const { classSubjectId } = req.params;
      await storage.unassignSubjectFromClass(classSubjectId);
      await storage.logActivity({
        userId: req.user!.id,
        action: "unassign",
        resource: "class_subject",
        resourceId: classSubjectId,
        schoolId: req.user!.schoolId || undefined
      });
      res.status(204).send();
    } catch (error) {
      console.error("Unassign class subject error:", error);
      res.status(500).json({ message: "Failed to unassign subject from class" });
    }
  });

