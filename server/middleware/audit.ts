import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { AuthRequest } from "./auth";

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  schoolId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await storage.logActivity({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
      newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      schoolId: data.schoolId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

export function auditLog(action: string, resource: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const originalSend = res.send;
    const originalJson = res.json;

    let responseData: any;
    let oldData: any;

    // Capture request data for audit
    if (req.method === 'PUT' || req.method === 'PATCH') {
      oldData = req.body.oldData || req.originalData;
    }

    // Override response methods to capture response data
    res.send = function(body) {
      responseData = body;
      return originalSend.call(this, body);
    };

    res.json = function(body) {
      responseData = body;
      return originalJson.call(this, body);
    };

    // Create audit log after response is sent
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await createAuditLog({
          userId: req.user!.id,
          action,
          resource,
          resourceId: req.params.id || req.params.schoolId || req.params.classId,
          oldValues: oldData,
          newValues: req.method !== 'GET' ? req.body : undefined,
          schoolId: req.user!.schoolId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
    });

    next();
  };
}

// Specific audit middleware for sensitive operations
export const auditSensitiveOperation = (action: string, resource: string) => 
  auditLog(`SENSITIVE_${action}`, resource);

export const auditUserManagement = auditLog('USER_MANAGEMENT', 'users');
export const auditAttendance = auditLog('ATTENDANCE', 'attendance');
export const auditGrades = auditLog('GRADES', 'grades');
export const auditFinancial = auditSensitiveOperation('FINANCIAL', 'financial');
