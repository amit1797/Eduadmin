import { db } from "../../db";
import { subjects } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Subject, InsertSubject } from "@shared/schema";

export async function getSubject(id: string): Promise<Subject | undefined> {
  const [row] = await db.select().from(subjects).where(eq(subjects.id, id));
  return row;
}

export async function getSubjectsBySchool(schoolId: string): Promise<Subject[]> {
  return await db.select().from(subjects).where(eq(subjects.schoolId, schoolId)).orderBy(desc(subjects.createdAt));
}

export async function createSubject(subject: InsertSubject): Promise<Subject> {
  const [row] = await db.insert(subjects).values(subject).returning();
  return row;
}

export async function updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject> {
  const [row] = await db.update(subjects)
    .set(subject)
    .where(eq(subjects.id, id))
    .returning();
  return row;
}

export async function deleteSubject(id: string): Promise<void> {
  await db.delete(subjects).where(eq(subjects.id, id));
}
