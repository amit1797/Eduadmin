import { db } from "../../db";
import { schools, students, teachers, classes, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function getSchoolStats(schoolId: string): Promise<{
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

export async function getSuperAdminStats(): Promise<{
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
