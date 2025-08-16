import { db } from "../../db";
import { students, users, classes } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Student, InsertStudent, User, Class } from "@shared/schema";

export async function getStudent(id: string): Promise<(Student & { user: User; class?: Class }) | undefined> {
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

export async function getStudentsBySchool(schoolId: string): Promise<(Student & { user: User; class?: Class })[]> {
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

export async function getStudentsByClass(classId: string): Promise<(Student & { user: User })[]> {
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

export async function createStudent(student: InsertStudent): Promise<Student> {
  const [row] = await db.insert(students).values(student).returning();
  return row;
}

export async function updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
  const [row] = await db.update(students)
    .set({ ...student, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
  return row;
}

export async function deleteStudent(id: string): Promise<void> {
  await db.delete(students).where(eq(students.id, id));
}
