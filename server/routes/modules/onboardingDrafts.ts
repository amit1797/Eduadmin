import { Router } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { authenticateToken, requireRole } from "../../middleware/auth";
import { storage } from "../../storage";

export const onboardingDraftsRouter = Router();

// List drafts
onboardingDraftsRouter.get("/onboarding-drafts", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    // Use storage module which handles ordering
    const drafts = await storage.listOnboardingDrafts({ status } as any);
    res.json(drafts);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to list drafts", error: err?.message });
  }
});

// Create draft
onboardingDraftsRouter.post("/onboarding-drafts", authenticateToken, requireRole(["super_admin"]), async (req: AuthRequest, res) => {
  try {
    const { schoolCode, step, data, files, expiresAt } = req.body || {};
    const draft = await storage.createOnboardingDraft({
      schoolCode,
      step: step ?? 1,
      data: typeof data === "string" ? data : (data ? JSON.stringify(data) : undefined),
      files: typeof files === "string" ? files : (files ? JSON.stringify(files) : undefined),
      createdBy: req.user?.id,
      expiresAt,
    } as any);
    res.json(draft);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to create draft", error: err?.message });
  }
});

// Get draft
onboardingDraftsRouter.get("/onboarding-drafts/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
  try {
    const draft = await storage.getOnboardingDraft(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });
    res.json(draft);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to load draft", error: err?.message });
  }
});

// Patch draft (partial update)
onboardingDraftsRouter.patch("/onboarding-drafts/:id", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
  try {
    const { schoolCode, step, data, files, status, error, expiresAt } = req.body || {};
    const patch: any = {
      ...(schoolCode !== undefined ? { schoolCode } : {}),
      ...(step !== undefined ? { step } : {}),
      ...(data !== undefined ? { data: typeof data === "string" ? data : JSON.stringify(data) } : {}),
      ...(files !== undefined ? { files: typeof files === "string" ? files : JSON.stringify(files) } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(error !== undefined ? { error } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
    };
    const updated = await storage.updateOnboardingDraft(req.params.id, patch);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to update draft", error: err?.message });
  }
});

// Finalize
onboardingDraftsRouter.post("/onboarding-drafts/:id/finalize", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
  try {
    const result = await storage.finalizeOnboardingDraft(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to finalize draft", error: err?.message });
  }
});

// Archive
onboardingDraftsRouter.post("/onboarding-drafts/:id/archive", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
  try {
    const result = await storage.archiveOnboardingDraft(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to archive draft", error: err?.message });
  }
});
