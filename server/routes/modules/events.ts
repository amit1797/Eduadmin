import { Router } from "express";
import { storage } from "../../storage";
import { 
  authenticateToken, 
  requireSchoolAccess, 
  requireModule, 
  requirePermission,
  type AuthRequest
} from "../../middleware/auth";

export const eventRouter = Router({ mergeParams: true });
  // Events routes
  eventRouter.get("/events", authenticateToken, requireSchoolAccess, requireModule("event_management"), requirePermission("event_management", "read"), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const events = await storage.getEventsBySchool(schoolId);
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  eventRouter.post("/events", authenticateToken, requireSchoolAccess, requireModule("event_management"), requirePermission("event_management", "create"), async (req: AuthRequest, res) => {
    try {
      const { schoolId } = req.params;
      const eventData = {
        ...req.body,
        schoolId,
        createdBy: req.user!.id
      };

      const event = await storage.createEvent(eventData);

      await storage.logActivity({
        userId: req.user!.id,
        action: "create",
        resource: "event",
        resourceId: event.id,
        schoolId,
        newValues: eventData
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

