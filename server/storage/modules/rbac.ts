import { db } from "../../db";
import { schoolModules, rolePermissions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function getEnabledModules(schoolId: string): Promise<string[]> {
  const rows = await db
    .select({ module: schoolModules.module })
    .from(schoolModules)
    .where(and(eq(schoolModules.schoolId, schoolId), eq(schoolModules.enabled, true)));
  return rows.map(r => r.module);
}

export async function isPermissionAllowed(roleName: string, moduleName: string, permissionName: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.role, roleName as any),
        and(eq(rolePermissions.module, moduleName as any), eq(rolePermissions.permission, permissionName as any))
      )
    );
  return rows.length > 0;
}

export async function setSchoolModules(schoolId: string, modules: string[], enabled: boolean = true): Promise<void> {
  // Clear existing then insert provided
  await db.delete(schoolModules).where(eq(schoolModules.schoolId, schoolId));
  if (modules.length === 0) return;
  const values = modules.map((m) => ({ schoolId, module: m as any, enabled }));
  await db.insert(schoolModules).values(values);
}
