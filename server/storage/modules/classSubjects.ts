import { db } from "../../db";
import { classSubjects, subjects, teachers } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { ClassSubject, Subject, InsertClassSubject } from "@shared/schema";

export async function getClassSubjects(classId: string): Promise<(ClassSubject & { subject: Subject; teacher?: { id: string; userId: string } })[]> {
  const result = await db
    .select()
    .from(classSubjects)
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .leftJoin(teachers, eq(classSubjects.teacherId, teachers.id))
    .where(eq(classSubjects.classId, classId))
    .orderBy(desc(classSubjects.createdAt));

  return result.map(r => ({
    ...r.class_subjects,
    subject: r.subjects,
    teacher: r.teachers ? { id: r.teachers.id, userId: r.teachers.userId } : undefined
  }));
}

export async function assignSubjectToClass(data: InsertClassSubject): Promise<ClassSubject> {
  const [row] = await db.insert(classSubjects).values(data).returning();
  return row;
}

export async function unassignSubjectFromClass(id: string): Promise<void> {
  await db.delete(classSubjects).where(eq(classSubjects.id, id));
}
