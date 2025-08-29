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

  // Get single event
  eventRouter.get("/events/:eventId", authenticateToken, requireSchoolAccess, requireModule("event_management"), requirePermission("event_management", "read"), async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await storage.getEvent(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({ message: "Failed to fetch event" });
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

  // Update event
  eventRouter.put("/events/:eventId", authenticateToken, requireSchoolAccess, requireModule("event_management"), requirePermission("event_management", "update"), async (req: AuthRequest, res) => {
    try {
      const { eventId } = req.params;
      const updated = await storage.updateEvent(eventId, req.body);

      await storage.logActivity({
        userId: req.user!.id,
        action: "update",
        resource: "event",
        resourceId: eventId,
        schoolId: req.user!.schoolId || undefined,
        newValues: req.body
      });

      res.json(updated);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event
  eventRouter.delete("/events/:eventId", authenticateToken, requireSchoolAccess, requireModule("event_management"), requirePermission("event_management", "delete"), async (req: AuthRequest, res) => {
    try {
      const { eventId } = req.params;
      await storage.deleteEvent(eventId);

      await storage.logActivity({
        userId: req.user!.id,
        action: "delete",
        resource: "event",
        resourceId: eventId,
        schoolId: req.user!.schoolId || undefined
      });

      res.status(204).send();
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

