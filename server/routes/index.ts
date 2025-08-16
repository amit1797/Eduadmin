import type { Express } from "express";
import { createServer, type Server } from "http";
import { authRouter } from "./modules/auth";
import { superAdminRouter } from "./modules/superAdmin";
import { studentRouter } from "./modules/students";
import { teacherRouter } from "./modules/teachers";
import { classRouter } from "./modules/classes";
import { attendanceRouter } from "./modules/attendance";
import { subjectRouter } from "./modules/subjects";
import { classSubjectRouter } from "./modules/classSubjects";
import { eventRouter } from "./modules/events";
import { auditRouter } from "./modules/audit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount modular routers with base paths
  app.use("/api/auth", authRouter);
  app.use("/api/super-admin", superAdminRouter);
  app.use("/api/schools/:schoolId", studentRouter);
  app.use("/api/schools/:schoolId", teacherRouter);
  app.use("/api/schools/:schoolId", classRouter);
  app.use("/api/classes/:classId", attendanceRouter);
  app.use("/api/schools/:schoolId", subjectRouter);
  app.use("/api/classes/:classId", classSubjectRouter);
  app.use("/api/schools/:schoolId", eventRouter);
  app.use("/api", auditRouter);

  const httpServer = createServer(app);
  return httpServer;
}
