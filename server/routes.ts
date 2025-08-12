import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authenticateToken, 
  requireRole, 
  requireSchoolAccess,
  generateToken, 
  hashPassword, 
  comparePassword,
  type AuthRequest 
} from "./middleware/auth";
import { loginSchema, insertUserSchema, insertStudentSchema, insertTeacherSchema, insertClassSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
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
        userAgent: req.headers["user-agent"]
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

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
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

  // Super Admin routes
  app.get("/api/super-admin/stats", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const stats = await storage.getSuperAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Super admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/super-admin/schools", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const schools = await storage.getAllSchools();
      res.json(schools);
    } catch (error) {
      console.error("Get schools error:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  app.post("/api/super-admin/schools", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
    try {
      const schoolData = req.body;
      const school = await storage.createSchool(schoolData);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "school",
        resourceId: school.id,
        newValues: schoolData
      });

      res.status(201).json(school);
    } catch (error) {
      console.error("Create school error:", error);
      res.status(500).json({ message: "Failed to create school" });
    }
  });

  // School Admin routes
  app.get("/api/schools/:schoolId/stats", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const stats = await storage.getSchoolStats(schoolId);
      res.json(stats);
    } catch (error) {
      console.error("School stats error:", error);
      res.status(500).json({ message: "Failed to fetch school stats" });
    }
  });

  // Student management routes
  app.get("/api/schools/:schoolId/students", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const students = await storage.getStudentsBySchool(schoolId);
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/schools/:schoolId/students", authenticateToken, requireSchoolAccess, async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const { userData, studentData } = req.body;

      // Create user first
      const hashedPassword = hashPassword(userData.password || "defaultpass123");
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: "student",
        schoolId
      });

      // Create student profile
      const student = await storage.createStudent({
        ...studentData,
        userId: user.id
      });

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "student",
        resourceId: student.id,
        schoolId,
        newValues: { userData, studentData }
      });

      res.status(201).json({ user, student });
    } catch (error) {
      console.error("Create student error:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Teacher management routes
  app.get("/api/schools/:schoolId/teachers", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const teachers = await storage.getTeachersBySchool(schoolId);
      res.json(teachers);
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.post("/api/schools/:schoolId/teachers", authenticateToken, requireSchoolAccess, async (req: AuthRequest, res) => {
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

  // Class management routes
  app.get("/api/schools/:schoolId/classes", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const classes = await storage.getClassesBySchool(schoolId);
      res.json(classes);
    } catch (error) {
      console.error("Get classes error:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/schools/:schoolId/classes", authenticateToken, requireSchoolAccess, async (req: AuthRequest, res) => {
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

  // Attendance routes
  app.get("/api/classes/:classId/attendance", authenticateToken, async (req, res) => {
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

  app.post("/api/classes/:classId/attendance", authenticateToken, async (req: AuthRequest, res) => {
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

  // Events routes
  app.get("/api/schools/:schoolId/events", authenticateToken, requireSchoolAccess, async (req, res) => {
    try {
      const { schoolId } = req.params;
      const events = await storage.getEventsBySchool(schoolId);
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/schools/:schoolId/events", authenticateToken, requireSchoolAccess, async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const eventData = {
        ...req.body,
        schoolId,
        createdBy: req.user!.id
      };

      const event = await storage.createEvent(eventData);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "event",
        resourceId: event.id,
        schoolId,
        newValues: eventData
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Audit logs routes
  app.get("/api/audit-logs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const schoolId = req.user!.role === "super_admin" ? undefined : req.user!.schoolId;
      const logs = await storage.getAuditLogs(schoolId || undefined);
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
