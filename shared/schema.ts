import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", [
  "super_admin", "school_admin", "sub_school_admin", "teacher", "student", "parent",
  "accountant", "librarian", "transport_admin", "hod", "org_admin"
]);

export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "graduated"]);

export const moduleEnum = pgEnum("module", [
  "student_management", "teacher_management", "class_management", "academics_management",
  "attendance_management", "test_result_management", "event_management", "basic_accounts",
  "notification_system", "audit_system", "library_management", "transport_management",
  "accounts_payroll", "staff_management", "advance_notification", "branch_management"
]);

export const permissionEnum = pgEnum("permission", ["create", "read", "update", "delete"]);

// Core Tables
export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  logo: text("logo"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: roleEnum("role").notNull(),
  schoolId: varchar("school_id").references(() => schools.id),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const schoolModules = pgTable("school_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  module: moduleEnum("module").notNull(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: roleEnum("role").notNull(),
  module: moduleEnum("module").notNull(),
  permission: permissionEnum("permission").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  section: varchar("section", { length: 5 }),
  capacity: integer("capacity").default(30),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  classTeacherId: varchar("class_teacher_id").references(() => users.id),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  studentId: varchar("student_id", { length: 20 }).notNull().unique(),
  classId: varchar("class_id").references(() => classes.id),
  admissionDate: timestamp("admission_date"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  bloodGroup: varchar("blood_group", { length: 5 }),
  address: text("address"),
  parentId: varchar("parent_id").references(() => users.id),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id", { length: 20 }).notNull().unique(),
  department: text("department"),
  qualification: text("qualification"),
  experience: integer("experience"),
  specialization: text("specialization"),
  joiningDate: timestamp("joining_date"),
  salary: integer("salary"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  classId: varchar("class_id").notNull().references(() => classes.id),
  date: timestamp("date").notNull(),
  status: varchar("status", { length: 10 }).notNull(), // present, absent, late
  markedBy: varchar("marked_by").notNull().references(() => users.id),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  description: text("description"),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const classSubjects = pgTable("class_subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => classes.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  teacherId: varchar("teacher_id").references(() => teachers.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: varchar("resource_id"),
  oldValues: text("old_values"), // JSON
  newValues: text("new_values"), // JSON
  schoolId: varchar("school_id").references(() => schools.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  classes: many(classes),
  subjects: many(subjects),
  events: many(events),
  schoolModules: many(schoolModules),
  auditLogs: many(auditLogs)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id]
  }),
  student: one(students),
  teacher: one(teachers),
  classesAsTeacher: many(classes),
  attendanceRecords: many(attendance),
  events: many(events),
  auditLogs: many(auditLogs)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id]
  }),
  classTeacher: one(users, {
    fields: [classes.classTeacherId],
    references: [users.id]
  }),
  students: many(students),
  attendance: many(attendance),
  classSubjects: many(classSubjects)
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id]
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id]
  }),
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id]
  }),
  attendance: many(attendance)
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id]
  }),
  classSubjects: many(classSubjects)
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, {
    fields: [subjects.schoolId],
    references: [schools.id]
  }),
  classSubjects: many(classSubjects)
}));

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  class: one(classes, {
    fields: [classSubjects.classId],
    references: [classes.id]
  }),
  subject: one(subjects, {
    fields: [classSubjects.subjectId],
    references: [subjects.id]
  }),
  teacher: one(teachers, {
    fields: [classSubjects.teacherId],
    references: [teachers.id]
  })
}));

// Insert Schemas
export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Newly added insert schemas for Subjects and Class-Subjects
export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true
});

export const insertClassSubjectSchema = createInsertSchema(classSubjects).omit({
  id: true,
  createdAt: true
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  schoolCode: z.string().optional()
});

// Types
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schools.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type LoginRequest = z.infer<typeof loginSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;

// Newly added types for Subjects and Class-Subjects
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertClassSubject = z.infer<typeof insertClassSubjectSchema>;
export type ClassSubject = typeof classSubjects.$inferSelect;

// DTOs for class-subject assignment operations
export const assignClassSubjectSchema = z.object({
  subjectId: z.string().min(1),
  teacherId: z.string().optional()
});
