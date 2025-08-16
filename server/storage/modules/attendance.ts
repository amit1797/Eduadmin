import { db } from "../../db";
import { attendance, students, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import type { InsertAttendance } from "@shared/schema";

export async function markAttendance(attendanceData: InsertAttendance): Promise<void> {
  await db.insert(attendance).values(attendanceData);
}

export async function getAttendanceByStudent(studentId: string): Promise<any[]> {
  const result = await db
    .select()
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(attendance.studentId, studentId))
    .orderBy(sql`${attendance.date} DESC`);

  return result.map(row => ({
    ...row.attendance,
    student: {
      ...row.students,
      user: row.users
    }
  }));
}

export async function getAttendanceByClass(classId: string, date: Date): Promise<any[]> {
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

export async function getAttendanceStats(_schoolId: string): Promise<{ totalPresent: number; totalAbsent: number; percentage: number }> {
  // Placeholder implementation; real one would aggregate from attendance table.
  return {
    totalPresent: 0,
    totalAbsent: 0,
    percentage: 0
  };
}
