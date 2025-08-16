import { db } from "../../db";
import { users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { User, InsertUser } from "@shared/schema";

export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUsersBySchool(schoolId: string): Promise<User[]> {
  return await db.select().from(users).where(eq(users.schoolId, schoolId));
}

export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createUser(userData: InsertUser): Promise<User> {
  const [row] = await db.insert(users).values(userData).returning();
  return row;
}

export async function updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
  const [row] = await db.update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return row;
}
