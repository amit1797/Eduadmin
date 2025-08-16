import { db } from "../../db";
import { schools } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { School, InsertSchool } from "@shared/schema";

export async function getSchool(id: string): Promise<School | undefined> {
  const [row] = await db.select().from(schools).where(eq(schools.id, id));
  return row;
}

export async function getSchoolByCode(code: string): Promise<School | undefined> {
  const [row] = await db.select().from(schools).where(eq(schools.code, code));
  return row;
}

export async function createSchool(data: InsertSchool): Promise<School> {
  const [row] = await db.insert(schools).values(data).returning();
  return row;
}

export async function updateSchool(id: string, data: Partial<InsertSchool>): Promise<School> {
  const [row] = await db.update(schools)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schools.id, id))
    .returning();
  return row;
}

export async function getAllSchools(): Promise<School[]> {
  return await db.select().from(schools).orderBy(desc(schools.createdAt));
}
