import { Router } from "express";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requireSchoolAccess, 
  requireModule, 
  requirePermission,
  type AuthRequest,
  hashPassword
} from "../../middleware/auth";

export const teacherRouter = Router({ mergeParams: true });
  // Teacher list & create
  teacherRouter.get("/teachers", authenticateToken, requireSchoolAccess, requireModule("teacher_management"), requirePermission("teacher_management", "read"), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const teachers = await storage.getTeachersBySchool(schoolId);
      res.json(teachers);
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  teacherRouter.post("/teachers", authenticateToken, requireSchoolAccess, requireModule("teacher_management"), requirePermission("teacher_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const { userData, teacherData } = req.body;

      // Create user first
      const hashedPassword = hashPassword(userData.password || "defaultpass123");
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: "teacher",
        schoolId
      });

      // Create teacher profile
      const teacher = await storage.createTeacher({
        ...teacherData,
        userId: user.id
      });

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "teacher",
        resourceId: teacher.id,
        schoolId,
        newValues: { userData, teacherData }
      });

      res.status(201).json({ user, teacher });
    } catch (error) {
      console.error("Create teacher error:", error);
      res.status(500).json({ message: "Failed to create teacher" });
    }
  });

  // Get single teacher by ID
  teacherRouter.get("/teachers/:teacherId", authenticateToken, requireSchoolAccess, requireModule("teacher_management"), requirePermission("teacher_management", "read"), async (req, res) => {
    try {
      const { teacherId } = req.params;
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      return res.json(teacher);
    } catch (error) {
      console.error("Get teacher error:", error);
      return res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

