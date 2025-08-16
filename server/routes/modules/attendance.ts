import { Router } from "express";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requirePermission,
  type AuthRequest
} from "../../middleware/auth";

export const attendanceRouter = Router({ mergeParams: true });
  // Attendance routes
  attendanceRouter.get("/attendance", authenticateToken, requirePermission("attendance_management", "read"), async (req, res) => {
    try {
      const { classId } = req.params;
      const { date = new Date() } = req.query;
      
      const attendance = await storage.getAttendanceByClass(classId, new Date(date as string));
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  attendanceRouter.post("/attendance", authenticateToken, requirePermission("attendance_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { classId } = req.params;
      const { studentId, status, date, remarks } = req.body;

      await storage.markAttendance({
        studentId,
        classId,
        status,
        date: new Date(date),
        markedBy: req.user!.id,
        remarks
      });

      await storage.logActivity({
        userId: req.user!.id,
        action: "mark_attendance",
        resource: "attendance",
        resourceId: studentId,
        schoolId: req.user!.schoolId || undefined,
        newValues: { classId, studentId, status, date, remarks }
      });

      res.json({ message: "Attendance marked successfully" });
    } catch (error) {
      console.error("Mark attendance error:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

