import { db } from "../../db";
import { events, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function getEventsBySchool(schoolId: string): Promise<any[]> {
  const result = await db
    .select()
    .from(events)
    .innerJoin(users, eq(events.createdBy, users.id))
    .where(eq(events.schoolId, schoolId))
    .orderBy(desc(events.createdAt));

  return result.map(row => ({
    ...row.events,
    createdBy: row.users
  }));
}

export async function getEvent(id: string): Promise<any | undefined> {
  const result = await db
    .select()
    .from(events)
    .innerJoin(users, eq(events.createdBy, users.id))
    .where(eq(events.id, id));

  if (result.length === 0) return undefined;
  return {
    ...result[0].events,
    createdBy: result[0].users
  };
}

export async function createEvent(eventData: any): Promise<any> {
  const [row] = await db.insert(events).values(eventData).returning();
  return row;
}

export async function updateEvent(id: string, eventData: any): Promise<any> {
  const [row] = await db.update(events)
    .set({ ...eventData, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();
  return row;
}

export async function deleteEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}
