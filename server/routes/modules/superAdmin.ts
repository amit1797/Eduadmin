import { Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requireRole, 
  type AuthRequest,
  hashPassword
} from "../../middleware/auth";
import { insertUserSchema } from "@shared/schema";

export const superAdminRouter = Router();
  // Super Admin - User management
  superAdminRouter.get("/users", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { schoolId } = req.query as { schoolId?: string };
      const users = schoolId
        ? await storage.getUsersBySchool(schoolId)
        : await storage.getAllUsers();

      // Map to snake_case fields expected by the client page
      const result = users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        phone: u.phone,
        role: u.role,
        school_id: u.schoolId,
        is_active: u.status === "active",
        last_login: null as any, // Not tracked; placeholder for UI
      }));

      res.json(result);
    } catch (error) {
      console.error("List users (super-admin) error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get a single user by ID for profile/details view
  superAdminRouter.get("/users/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const u = await storage.getUser(id);
      if (!u) return res.status(404).json({ message: "User not found" });

      // Map to snake_case fields expected by client
      const result = {
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        phone: u.phone,
        role: u.role,
        school_id: u.schoolId,
        is_active: u.status === "active",
        last_login: null as any,
      };

      res.json(result);
    } catch (error) {
      console.error("Get user (super-admin) error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  superAdminRouter.post("/users", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
    try {
      const body = req.body;
      // Validate required fields using insertUserSchema; auto-generate username if missing
      const parsed = insertUserSchema.parse({
        ...body,
        username: body.username || (body.email ? String(body.email).split("@")[0] : undefined)
      });
      const hashedPassword = hashPassword(parsed.password);
      const user = await storage.createUser({ ...parsed, password: hashedPassword });

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "user",
        resourceId: user.id,
        schoolId: user.schoolId || undefined,
        newValues: { ...parsed, password: undefined }
      });

      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      console.error("Create user (super-admin) error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  superAdminRouter.put("/users/:id", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body as Partial<z.infer<typeof insertUserSchema>> & { password?: string };
      if (updates.password) {
        updates.password = hashPassword(updates.password);
      }
      const updated = await storage.updateUser(id, updates);

      await storage.logActivity({
        userId: req.user!.id,
        action: "update",
        resource: "user",
        resourceId: id,
        schoolId: updated.schoolId || undefined,
        newValues: { ...req.body, password: req.body?.password ? "<changed>" : undefined }
      });

      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error("Update user (super-admin) error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  superAdminRouter.post("/users/:id/status", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: "active" | "inactive" | "pending" };
      if (!status) return res.status(400).json({ message: "status is required" });
      const updated = await storage.updateUser(id, { status });

      await storage.logActivity({
        userId: req.user!.id,
        action: status === "active" ? "activate" : "deactivate",
        resource: "user",
        resourceId: id,
        schoolId: updated.schoolId || undefined,
        newValues: { status }
      });

      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error("Change user status (super-admin) error:", error);
      res.status(500).json({ message: "Failed to change user status" });
    }
  });

  // Super Admin stats and schools
  superAdminRouter.get("/stats", authenticateToken, requireRole(["super_admin"]), async (_req, res) => {
    try {
      const stats = await storage.getSuperAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Super admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  superAdminRouter.get("/schools", authenticateToken, requireRole(["super_admin"]), async (_req, res) => {
    try {
      const schools = await storage.getAllSchools();
      res.json(schools);
    } catch (error) {
      console.error("Get schools error:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  // Get single school (for resuming onboarding drafts)
  superAdminRouter.get("/schools/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const school = await storage.getSchool(id);
      if (!school) return res.status(404).json({ message: "School not found" });
      res.json(school);
    } catch (error) {
      console.error("Get school error:", error);
      res.status(500).json({ message: "Failed to fetch school" });
    }
  });

  superAdminRouter.post("/onboard-school", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
    try {
      const { schoolId, basicDetails, documents, modules, configuration, dataUpload } = req.body as any;
      
      // Either update existing draft school or create a new one
      const toPersist = {
        name: basicDetails.name,
        code: basicDetails.code,
        address: basicDetails.address,
        phone: basicDetails.phone,
        email: basicDetails.email,
        website: basicDetails.website,
        status: "active" as const,
      };

      const school = schoolId
        ? await storage.updateSchool(schoolId, toPersist)
        : await storage.createSchool(toPersist as any);

      // Create principal user account
      const hashedPassword = hashPassword("principal123"); // Default password
      const principalEmail = basicDetails.principalEmail;
      const principalName = basicDetails.principalName || "Principal";
      const [firstName, ...rest] = principalName.trim().split(' ');
      const principalUser = await storage.createUser({
        username: (principalEmail || "principal").split('@')[0],
        email: principalEmail,
        password: hashedPassword,
        firstName: firstName || "Principal",
        lastName: rest.join(' ') || "",
        role: "school_admin",
        schoolId: school.id,
        phone: basicDetails.principalPhone,
        status: "active"
      });

      // Enable selected modules for the school
      const defaultModules = [
        "student_management",
        "teacher_management",
        "class_management",
        "academics_management",
        "attendance_management",
        "event_management",
        "audit_system"
      ];
      const selectedModules = Array.isArray(modules) && modules.length > 0 ? modules : defaultModules;
      await storage.setSchoolModules(school.id, selectedModules, true);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "school",
        resourceId: school.id,
        newValues: { basicDetails, modules: selectedModules, configuration }
      });

      res.status(201).json({ 
        school, 
        principalUser,
        message: "School onboarded successfully" 
      });
    } catch (error) {
      console.error("School onboarding error:", error);
      res.status(500).json({ message: "Failed to onboard school" });
    }
  });


  superAdminRouter.post("/schools", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
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

