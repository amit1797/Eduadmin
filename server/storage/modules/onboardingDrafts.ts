import { db } from "../../db";
import { onboardingDrafts, schools, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { OnboardingDraft, InsertOnboardingDraft, InsertSchool } from "@shared/schema";
import { schools as schoolsTable } from "@shared/schema";
import bcrypt from "bcryptjs";
import { sendMail } from "../../services/mailer";
import { generateInviteToken } from "../../middleware/auth";

export async function createDraft(data: InsertOnboardingDraft): Promise<OnboardingDraft> {
  const [row] = await db.insert(onboardingDrafts).values(data).returning();
  return row;
}

export async function getDraft(id: string): Promise<OnboardingDraft | undefined> {
  const [row] = await db.select().from(onboardingDrafts).where(eq(onboardingDrafts.id, id));
  return row;
}

export async function listDrafts(params?: { status?: string }): Promise<OnboardingDraft[]> {
  const base = db.select().from(onboardingDrafts);
  const rows = params?.status
    ? await base.where(eq(onboardingDrafts.status as any, params.status as any)).orderBy(desc(onboardingDrafts.updatedAt as any))
    : await base.orderBy(desc(onboardingDrafts.updatedAt as any));
  return rows as any;
}

export async function updateDraft(id: string, patch: Partial<InsertOnboardingDraft>): Promise<OnboardingDraft> {
  const [row] = await db.update(onboardingDrafts)
    .set({ ...patch, updatedAt: new Date() as any })
    .where(eq(onboardingDrafts.id, id))
    .returning();
  return row;
}

// Minimal finalize: upsert school by code and mark draft finalized
export async function finalizeDraft(id: string): Promise<{ draft: OnboardingDraft; schoolId: string; invitedUserId?: string; inviteEmailSent?: boolean }> {
  const draft = await getDraft(id);
  if (!draft) throw new Error("Draft not found");
  if (!draft.data) throw new Error("Draft has no data");
  let parsed: any = {};
  try { parsed = JSON.parse(draft.data); } catch {}
  const basic = parsed?.basicDetails || {};
  const code = draft.schoolCode || basic.code;
  if (!code) throw new Error("School code is required to finalize");

  // Upsert into schools by code
  const existing = await db.select().from(schoolsTable).where(eq(schoolsTable.code, code));
  let schoolId: string;
  if (existing[0]) {
    const [row] = await db.update(schoolsTable)
      .set({
        name: basic.name ?? existing[0].name,
        code,
        address: basic.address ?? existing[0].address,
        phone: basic.phone ?? existing[0].phone,
        email: basic.email ?? existing[0].email,
        website: basic.website ?? existing[0].website,
        status: "active" as any,
        updatedAt: new Date() as any,
      })
      .where(eq(schoolsTable.id, existing[0].id))
      .returning();
    schoolId = row.id;
  } else {
    const [row] = await db.insert(schoolsTable)
      .values({
        name: basic.name,
        code,
        address: basic.address,
        phone: basic.phone,
        email: basic.email,
        website: basic.website,
        status: "active" as any,
      } as InsertSchool)
      .returning();
    schoolId = row.id;
  }

  // Prepare principal details
  const principalEmail: string | undefined = basic.principalEmail || basic.email || undefined;
  const principalName: string | undefined = basic.principalName || undefined;

  let invitedUserId: string | undefined;
  let inviteEmailSent = false;

  if (principalEmail) {
    // Check if a user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, principalEmail));
    if (existingUser[0]) {
      // Ensure schoolId is set; do not change password here
      const current = existingUser[0];
      if (!current.schoolId || current.schoolId !== schoolId || current.role !== ("school_admin" as any)) {
        const [u] = await db.update(users)
          .set({
            schoolId,
            role: "school_admin" as any,
            updatedAt: new Date() as any,
          })
          .where(eq(users.id, current.id))
          .returning();
        invitedUserId = u.id;
      } else {
        invitedUserId = current.id;
      }
    } else {
      // Create a pending school_admin user with a placeholder strong password hash
      const username = principalEmail; // keep unique
      const [firstName, ...rest] = (principalName || principalEmail.split("@")[0] || "Principal").split(" ");
      const lastName = rest.join(" ") || "";
      const tempPassword = `Temp#${Math.random().toString(36).slice(2, 8)}A1!`;
      const passwordHash = bcrypt.hashSync(tempPassword, 12);
      const [createdUser] = await db.insert(users).values({
        username,
        email: principalEmail,
        password: passwordHash,
        firstName: firstName || "Principal",
        lastName: lastName || "",
        role: "school_admin" as any,
        schoolId,
        status: "pending" as any,
      } as any).returning();
      invitedUserId = createdUser.id;
    }

    // Generate invite token and send email
    if (invitedUserId) {
      const token = generateInviteToken({ id: invitedUserId, email: principalEmail, role: "school_admin", schoolId });
      const baseUrl = process.env.APP_BASE_URL || "http://localhost:5000";
      const link = `${baseUrl}/invite/set-password?token=${encodeURIComponent(token)}`;
      try {
        await sendMail({
          to: principalEmail,
          subject: "You're invited: Set up your School Admin account",
          text: `Welcome! Please set your password to activate your account: ${link}`,
          html: `<p>Welcome!</p><p>Please <a href="${link}">set your password</a> to activate your School Admin account.</p>`
        });
        inviteEmailSent = true;
      } catch (e) {
        // Log but do not fail finalize
        console.error("Failed to send invite email:", e);
      }
    }
  }

  const [updated] = await db.update(onboardingDrafts)
    .set({ status: "finalized" as any, finalizedAt: new Date() as any, updatedAt: new Date() as any })
    .where(eq(onboardingDrafts.id, id))
    .returning();

  return { draft: updated, schoolId, invitedUserId, inviteEmailSent };
}

export async function archiveDraft(id: string): Promise<OnboardingDraft> {
  const [row] = await db.update(onboardingDrafts)
    .set({ status: "archived" as any, updatedAt: new Date() as any })
    .where(eq(onboardingDrafts.id, id))
    .returning();
  return row;
}
