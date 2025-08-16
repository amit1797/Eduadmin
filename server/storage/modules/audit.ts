import { db } from "../../db";
import { auditLogs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { AuditLog } from "@shared/schema";

export async function logActivity(log: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  schoolId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await db.insert(auditLogs).values({
    ...log,
    oldValues: log.oldValues ? JSON.stringify(log.oldValues) : null,
    newValues: log.newValues ? JSON.stringify(log.newValues) : null
  });
}

export async function getAuditLogs(schoolId?: string): Promise<AuditLog[]> {
  const base = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  if (schoolId) {
    // drizzle select builder is immutable; build filtered query
    return await db.select().from(auditLogs).where(eq(auditLogs.schoolId, schoolId)).orderBy(desc(auditLogs.createdAt));
  }
  return await base;
}
