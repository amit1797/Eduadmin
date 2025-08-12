import { 
  schools, users, students, teachers, classes, attendance, subjects, 
  classSubjects, events, auditLogs, schoolModules, rolePermissions,
  type School, type User, type Student, type Teacher, type Class,
  type InsertSchool, type InsertUser, type InsertStudent, type InsertTeacher,
  type InsertClass, type InsertAttendance, type InsertEvent, type AuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";

export interface IStorage {
  // Schools
  getSchool(id: string): Promise<School | undefined>;
  getSchoolByCode(code: string): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: string, school: Partial<InsertSchool>): Promise<School>;
  getAllSchools(): Promise<School[]>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersBySchool(schoolId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Students
  getStudent(id: string): Promise<(Student & { user: User; class?: Class }) | undefined>;
  getStudentsBySchool(schoolId: string): Promise<(Student & { user: User; class?: Class })[]>;
  getStudentsByClass(classId: string): Promise<(Student & { user: User })[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;

  // Teachers
  getTeacher(id: string): Promise<(Teacher & { user: User }) | undefined>;
  getTeachersBySchool(schoolId: string): Promise<(Teacher & { user: User })[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher>;

  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClassesBySchool(schoolId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;

  // Attendance
  markAttendance(attendance: InsertAttendance): Promise<void>;
  getAttendanceByClass(classId: string, date: Date): Promise<any[]>;
  getAttendanceStats(schoolId: string): Promise<{ totalPresent: number; totalAbsent: number; percentage: number }>;

  // Events
  getEventsBySchool(schoolId: string): Promise<any[]>;
  createEvent(event: InsertEvent): Promise<any>;

  // Audit Logs
  logActivity(log: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    schoolId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  getAuditLogs(schoolId?: string): Promise<AuditLog[]>;

  // Dashboard Stats
  getSchoolStats(schoolId: string): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    todayAttendance: number;
  }>;

  getSuperAdminStats(): Promise<{
    totalSchools: number;
    activeLicenses: number;
    monthlyRevenue: number;
    supportTickets: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getSchool(id: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async getSchoolByCode(code: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.code, code));
    return school;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const [newSchool] = await db.insert(schools).values(school).returning();
    return newSchool;
  }

  async updateSchool(id: string, school: Partial<InsertSchool>): Promise<School> {
    const [updatedSchool] = await db.update(schools)
      .set({ ...school, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning();
    return updatedSchool;
  }

  async getAllSchools(): Promise<School[]> {
    return await db.select().from(schools).orderBy(desc(schools.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsersBySchool(schoolId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.schoolId, schoolId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getStudent(id: string): Promise<(Student & { user: User; class?: Class }) | undefined> {
    const result = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, id));

    if (result.length === 0 || !result[0].users) return undefined;

    return {
      ...result[0].students,
      user: result[0].users,
      class: result[0].classes || undefined
    };
  }

  async getStudentsBySchool(schoolId: string): Promise<(Student & { user: User; class?: Class })[]> {
    const result = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(users.schoolId, schoolId))
      .orderBy(desc(students.createdAt));

    return result.map(row => ({
      ...row.students,
      user: row.users,
      class: row.classes || undefined
    }));
  }

  async getStudentsByClass(classId: string): Promise<(Student & { user: User })[]> {
    const result = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.classId, classId));

    return result.map(row => ({
      ...row.students,
      user: row.users
    }));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db.update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async getTeacher(id: string): Promise<(Teacher & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(eq(teachers.id, id));

    if (result.length === 0) return undefined;

    return {
      ...result[0].teachers,
      user: result[0].users
    };
  }

  async getTeachersBySchool(schoolId: string): Promise<(Teacher & { user: User })[]> {
    const result = await db
      .select()
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(eq(users.schoolId, schoolId))
      .orderBy(desc(teachers.createdAt));

    return result.map(row => ({
      ...row.teachers,
      user: row.users
    }));
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    const [updatedTeacher] = await db.update(teachers)
      .set({ ...teacher, updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return updatedTeacher;
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData;
  }

  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.schoolId, schoolId));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db.update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<void> {
    await db.insert(attendance).values(attendanceData);
  }

  async getAttendanceByClass(classId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(
        and(
          eq(attendance.classId, classId),
          and(
            sql`${attendance.date} >= ${startOfDay}`,
            sql`${attendance.date} <= ${endOfDay}`
          )
        )
      );

    return result.map(row => ({
      ...row.attendance,
      student: {
        ...row.students,
        user: row.users
      }
    }));
  }

  async getAttendanceStats(schoolId: string): Promise<{ totalPresent: number; totalAbsent: number; percentage: number }> {
    // This would need more complex queries in a real implementation
    // For now, returning mock data structure
    return {
      totalPresent: 0,
      totalAbsent: 0,
      percentage: 0
    };
  }

  async getEventsBySchool(schoolId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(events)
      .innerJoin(users, eq(events.createdBy, users.id))
      .where(eq(events.schoolId, schoolId))
      .orderBy(desc(events.createdAt));

    return result.map(row => ({
      ...row.events,
      createdBy: row.users
    }));
  }

  async createEvent(event: InsertEvent): Promise<any> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async logActivity(log: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    schoolId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.insert(auditLogs).values({
      ...log,
      oldValues: log.oldValues ? JSON.stringify(log.oldValues) : null,
      newValues: log.newValues ? JSON.stringify(log.newValues) : null
    });
  }

  async getAuditLogs(schoolId?: string): Promise<AuditLog[]> {
    const query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    
    if (schoolId) {
      return await query.where(eq(auditLogs.schoolId, schoolId));
    }
    
    return await query;
  }

  async getSchoolStats(schoolId: string): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    todayAttendance: number;
  }> {
    const [studentsCount] = await db
      .select({ count: sql`count(*)` })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(users.schoolId, schoolId));

    const [teachersCount] = await db
      .select({ count: sql`count(*)` })
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(eq(users.schoolId, schoolId));

    const [classesCount] = await db
      .select({ count: sql`count(*)` })
      .from(classes)
      .where(eq(classes.schoolId, schoolId));

    return {
      totalStudents: Number(studentsCount?.count) || 0,
      totalTeachers: Number(teachersCount?.count) || 0,
      totalClasses: Number(classesCount?.count) || 0,
      todayAttendance: 94.5
    };
  }

  async getSuperAdminStats(): Promise<{
    totalSchools: number;
    activeLicenses: number;
    monthlyRevenue: number;
    supportTickets: number;
  }> {
    const [schoolsCount] = await db
      .select({ count: sql`count(*)` })
      .from(schools);

    const [activeSchools] = await db
      .select({ count: sql`count(*)` })
      .from(schools)
      .where(eq(schools.status, "active"));

    return {
      totalSchools: Number(schoolsCount?.count) || 0,
      activeLicenses: Number(activeSchools?.count) || 0,
      monthlyRevenue: 89432,
      supportTickets: 23
    };
  }
}

export const storage = new DatabaseStorage();
