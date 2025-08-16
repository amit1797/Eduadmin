import {
  type School, type User, type Student, type Teacher, type Class,
  type InsertSchool, type InsertUser, type InsertStudent, type InsertTeacher,
  type InsertClass, type InsertAttendance, type InsertEvent, type AuditLog,
  type Subject, type InsertSubject, type ClassSubject, type InsertClassSubject
} from "@shared/schema";
import * as storageModules from "./storage/modules";

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
  getAllUsers(): Promise<User[]>; // Added getAllUsers() to IStorage
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Students
  getStudent(id: string): Promise<(Student & { user: User; class?: Class }) | undefined>;
  getStudentsBySchool(schoolId: string): Promise<(Student & { user: User; class?: Class })[]>;
  getStudentsByClass(classId: string): Promise<(Student & { user: User })[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Teachers
  getTeacher(id: string): Promise<(Teacher & { user: User }) | undefined>;
  getTeachersBySchool(schoolId: string): Promise<(Teacher & { user: User })[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;

  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClassesBySchool(schoolId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Subjects
  getSubject(id: string): Promise<Subject | undefined>;
  getSubjectsBySchool(schoolId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;

  // Class-Subjects (assignments)
  getClassSubjects(classId: string): Promise<(ClassSubject & { subject: Subject; teacher?: { id: string; userId: string } })[]>;
  assignSubjectToClass(data: InsertClassSubject): Promise<ClassSubject>;
  unassignSubjectFromClass(id: string): Promise<void>;

  // Attendance
  markAttendance(attendance: InsertAttendance): Promise<void>;
  getAttendanceByClass(classId: string, date: Date): Promise<any[]>;
  getAttendanceByStudent(studentId: string): Promise<any[]>;
  getAttendanceStats(schoolId: string): Promise<{ totalPresent: number; totalAbsent: number; percentage: number }>;

  // Events
  getEventsBySchool(schoolId: string): Promise<any[]>;
  getEvent(id: string): Promise<any | undefined>;
  createEvent(event: InsertEvent): Promise<any>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<any>;
  deleteEvent(id: string): Promise<void>;

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

  // RBAC & Modules
  getEnabledModules(schoolId: string): Promise<string[]>;
  isPermissionAllowed(role: string, module: string, permission: string): Promise<boolean>;
  setSchoolModules(schoolId: string, modules: string[], enabled?: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSchool(id: string): Promise<School | undefined> {
    return storageModules.schools.getSchool(id);
  }

  async getSchoolByCode(code: string): Promise<School | undefined> {
    return storageModules.schools.getSchoolByCode(code);
  }

  async createSchool(school: InsertSchool): Promise<School> {
    return storageModules.schools.createSchool(school);
  }

  async updateSchool(id: string, school: Partial<InsertSchool>): Promise<School> {
    return storageModules.schools.updateSchool(id, school);
  }

  async getAllSchools(): Promise<School[]> {
    return storageModules.schools.getAllSchools();
  }

  async getUser(id: string): Promise<User | undefined> {
    return storageModules.users.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return storageModules.users.getUserByEmail(email);
  }

  async getUsersBySchool(schoolId: string): Promise<User[]> {
    return storageModules.users.getUsersBySchool(schoolId);
  }

  async getAllUsers(): Promise<User[]> {
    return storageModules.users.getAllUsers();
  }

  async createUser(user: InsertUser): Promise<User> {
    return storageModules.users.createUser(user);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    return storageModules.users.updateUser(id, user);
  }

  async getStudent(id: string): Promise<(Student & { user: User; class?: Class }) | undefined> {
    return storageModules.students.getStudent(id);
  }

  async getStudentsBySchool(schoolId: string): Promise<(Student & { user: User; class?: Class })[]> {
    return storageModules.students.getStudentsBySchool(schoolId);
  }

  async getStudentsByClass(classId: string): Promise<(Student & { user: User })[]> {
    return storageModules.students.getStudentsByClass(classId);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    return storageModules.students.createStudent(student);
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    return storageModules.students.updateStudent(id, student);
  }

  async deleteStudent(id: string): Promise<void> {
    return storageModules.students.deleteStudent(id);
  }

  async getTeacher(id: string): Promise<(Teacher & { user: User }) | undefined> {
    return storageModules.teachers.getTeacher(id);
  }

  async getTeachersBySchool(schoolId: string): Promise<(Teacher & { user: User })[]> {
    return storageModules.teachers.getTeachersBySchool(schoolId);
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    return storageModules.teachers.createTeacher(teacher);
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    return storageModules.teachers.updateTeacher(id, teacher);
  }

  async deleteTeacher(id: string): Promise<void> {
    return storageModules.teachers.deleteTeacher(id);
  }

  async getClass(id: string): Promise<Class | undefined> {
    return storageModules.classes.getClass(id);
  }

  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    return storageModules.classes.getClassesBySchool(schoolId);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    return storageModules.classes.createClass(classData);
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    return storageModules.classes.updateClass(id, classData);
  }

  async deleteClass(id: string): Promise<void> {
    return storageModules.classes.deleteClass(id);
  }

  // Subjects
  async getSubject(id: string): Promise<Subject | undefined> {
    return storageModules.subjects.getSubject(id);
  }

  async getSubjectsBySchool(schoolId: string): Promise<Subject[]> {
    return storageModules.subjects.getSubjectsBySchool(schoolId);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    return storageModules.subjects.createSubject(subject);
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject> {
    return storageModules.subjects.updateSubject(id, subject);
  }

  async deleteSubject(id: string): Promise<void> {
    return storageModules.subjects.deleteSubject(id);
  }

  // Class-Subjects
  async getClassSubjects(classId: string): Promise<(ClassSubject & { subject: Subject; teacher?: { id: string; userId: string } })[]> {
    return storageModules.classSubjects.getClassSubjects(classId);
  }

  async assignSubjectToClass(data: InsertClassSubject): Promise<ClassSubject> {
    return storageModules.classSubjects.assignSubjectToClass(data);
  }

  async unassignSubjectFromClass(id: string): Promise<void> {
    return storageModules.classSubjects.unassignSubjectFromClass(id);
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<void> {
    return storageModules.attendance.markAttendance(attendanceData);
  }

  async getAttendanceByClass(classId: string, date: Date): Promise<any[]> {
    return storageModules.attendance.getAttendanceByClass(classId, date);
  }

  async getAttendanceByStudent(studentId: string): Promise<any[]> {
    return storageModules.attendance.getAttendanceByStudent(studentId);
  }

  async getAttendanceStats(schoolId: string): Promise<{ totalPresent: number; totalAbsent: number; percentage: number }> {
    return storageModules.attendance.getAttendanceStats(schoolId);
  }

  async getEventsBySchool(schoolId: string): Promise<any[]> {
    return storageModules.events.getEventsBySchool(schoolId);
  }

  async getEvent(id: string): Promise<any | undefined> {
    return storageModules.events.getEvent(id);
  }

  async createEvent(event: InsertEvent): Promise<any> {
    return storageModules.events.createEvent(event);
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<any> {
    return storageModules.events.updateEvent(id, event);
  }

  async deleteEvent(id: string): Promise<void> {
    return storageModules.events.deleteEvent(id);
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
    return storageModules.audit.logActivity(log);
  }

  async getAuditLogs(schoolId?: string): Promise<AuditLog[]> {
    return storageModules.audit.getAuditLogs(schoolId);
  }

  async getSchoolStats(schoolId: string): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    todayAttendance: number;
  }> {
    return storageModules.stats.getSchoolStats(schoolId);
  }

  async getSuperAdminStats(): Promise<{
    totalSchools: number;
    activeLicenses: number;
    monthlyRevenue: number;
    supportTickets: number;
  }> {
    return storageModules.stats.getSuperAdminStats();
  }

  // RBAC & Modules
  async getEnabledModules(schoolId: string): Promise<string[]> {
    return storageModules.rbac.getEnabledModules(schoolId);
  }

  async isPermissionAllowed(roleName: string, moduleName: string, permissionName: string): Promise<boolean> {
    return storageModules.rbac.isPermissionAllowed(roleName, moduleName, permissionName);
  }

  async setSchoolModules(schoolId: string, modules: string[], enabled: boolean = true): Promise<void> {
    return storageModules.rbac.setSchoolModules(schoolId, modules, enabled);
  }
}

export const storage = new DatabaseStorage();
