import { db } from "../../db";
import { classes } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Class, InsertClass } from "@shared/schema";

export async function getClass(id: string): Promise<Class | undefined> {
  const [row] = await db.select().from(classes).where(eq(classes.id, id));
  return row;
}

export async function getClassesBySchool(schoolId: string): Promise<Class[]> {
  return await db.select().from(classes).where(eq(classes.schoolId, schoolId));
}

export async function createClass(data: InsertClass): Promise<Class> {
  const [row] = await db.insert(classes).values(data).returning();
  return row;
}

export async function updateClass(id: string, data: Partial<InsertClass>): Promise<Class> {
  const [row] = await db.update(classes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classes.id, id))
    .returning();
  return row;
}

export async function deleteClass(id: string): Promise<void> {
  await db.delete(classes).where(eq(classes.id, id));
}
