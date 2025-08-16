import { db } from "../../db";
import { teachers, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Teacher, InsertTeacher, User } from "@shared/schema";

export async function getTeacher(id: string): Promise<(Teacher & { user: User }) | undefined> {
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

export async function getTeachersBySchool(schoolId: string): Promise<(Teacher & { user: User })[]> {
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

export async function createTeacher(teacher: InsertTeacher): Promise<Teacher> {
  const [row] = await db.insert(teachers).values(teacher).returning();
  return row;
}

export async function updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher> {
  const [row] = await db.update(teachers)
    .set({ ...teacher, updatedAt: new Date() })
    .where(eq(teachers.id, id))
    .returning();
  return row;
}

export async function deleteTeacher(id: string): Promise<void> {
  await db.delete(teachers).where(eq(teachers.id, id));
}
