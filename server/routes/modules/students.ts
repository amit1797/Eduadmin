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

export const studentRouter = Router({ mergeParams: true });
  // Student detail routes
  studentRouter.get("/students/:id", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "read"), async (req, res) => {
    try {
      const { id } = req.params;
      const student = await storage.getStudent(id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.json(student);
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Student attendance summary
  studentRouter.get("/students/:id/attendance", authenticateToken, requireSchoolAccess, requireModule("attendance_management"), requirePermission("attendance_management", "read"), async (req, res) => {
    try {
      const { id } = req.params;
      const records = await storage.getAttendanceByStudent(id);

      const totals = records.reduce(
        (acc, r) => {
          const status = (r.status || "").toLowerCase();
          acc.total += 1;
          if (status === "present") acc.present += 1;
          else if (status === "absent") acc.absent += 1;
          else if (status === "late") acc.late += 1;
          return acc;
        },
        { present: 0, absent: 0, late: 0, total: 0 }
      );
      const percentage = totals.total ? Math.round((totals.present / totals.total) * 1000) / 10 : 0;

      // Basic monthly breakdown for last 5 months using JS date bucketing
      const now = new Date();
      const monthly: number[] = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const inMonth = records.filter(r => {
          const rd = new Date(r.date);
          return rd >= mStart && rd <= mEnd;
        });
        const presentCount = inMonth.filter(r => (r.status || "").toLowerCase() === "present").length;
        const pct = inMonth.length ? Math.round((presentCount / inMonth.length) * 1000) / 10 : 0;
        monthly.push(pct);
      }

      const recent = records.slice(0, 10).map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        status: (r.status || "").charAt(0).toUpperCase() + (r.status || "").slice(1),
        time: new Date(r.date).toLocaleTimeString()
      }));

      res.json({
        present: totals.present,
        absent: totals.absent,
        late: totals.late,
        total: totals.total,
        percentage,
        monthly,
        recent
      });
    } catch (error) {
      console.error("Get student attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Student fees - placeholder dataset until accounts module is built
  studentRouter.get("/students/:id/fees", authenticateToken, requireSchoolAccess, requireModule("basic_accounts"), requirePermission("basic_accounts", "read"), async (_req, res) => {
    try {
      const now = new Date();
      const year = now.getMonth() >= 3 ? `${now.getFullYear()}-${now.getFullYear() + 1}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
      const data = {
        academicYear: year,
        total: 12000,
        paid: 9000,
        due: 3000,
        nextDue: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0, 10),
        structure: [
          { type: "Tuition Fee", amount: 8000, frequency: "Annual" },
          { type: "Development Fee", amount: 2000, frequency: "Annual" },
          { type: "Library Fee", amount: 1000, frequency: "Annual" },
          { type: "Computer Lab Fee", amount: 1000, frequency: "Annual" }
        ],
        payments: [
          { receipt: "PMT001", date: `${now.getFullYear()}-01-10`, amount: 5000, mode: "Online", status: "Paid" },
          { receipt: "PMT002", date: `${now.getFullYear()}-03-15`, amount: 4000, mode: "Cash", status: "Paid" }
        ]
      };
      res.json(data);
    } catch (error) {
      console.error("Get student fees error:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  // Student documents - placeholder dataset
  studentRouter.get("/students/:id/documents", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "read"), async (_req, res) => {
    try {
      const docs = [
        { name: "Birth Certificate", uploaded: "2019-06-01", status: "Verified" },
        { name: "Transfer Certificate", uploaded: "2019-06-01", status: "Verified" },
        { name: "Medical Certificate", uploaded: "2019-06-01", status: "Verified" },
        { name: "Address Proof", uploaded: "2019-06-01", status: "Pending" }
      ];
      res.json(docs);
    } catch (error) {
      console.error("Get student documents error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  studentRouter.put("/students/:id", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "update"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateStudent(id, req.body);
      await storage.logActivity({
        userId: req.user!.id,
        action: "update",
        resource: "student",
        resourceId: id,
        schoolId: req.user!.schoolId || undefined,
        newValues: req.body
      });
      res.json(updated);
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  studentRouter.delete("/students/:id", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "delete"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStudent(id);
      await storage.logActivity({
        userId: req.user!.id,
        action: "delete",
        resource: "student",
        resourceId: id,
        schoolId: req.user!.schoolId || undefined
      });
      res.status(204).send();
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Student list & create
  studentRouter.get("/students", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "read"), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const students = await storage.getStudentsBySchool(schoolId);
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  studentRouter.post("/students", authenticateToken, requireSchoolAccess, requireModule("student_management"), requirePermission("student_management", "create"), async (req: AuthRequest, res) => {
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

