import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AuthRequest } from "./auth";

// Enhanced password validation schema
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Enhanced login schema with better validation
export const enhancedLoginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  schoolCode: z.string().optional().transform(val => val?.trim())
});

// User creation schema with password validation
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email format").toLowerCase(),
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/, "Invalid phone number").optional(),
  role: z.enum(["super_admin", "school_admin", "sub_school_admin", "teacher", "student", "parent"]),
  schoolId: z.string().uuid("Invalid school ID").optional()
});

// Student creation schema
export const createStudentSchema = z.object({
  userData: createUserSchema.omit({ role: true }).extend({
    role: z.literal("student")
  }),
  studentData: z.object({
    studentId: z.string().min(1, "Student ID is required").max(20),
    classId: z.string().uuid("Invalid class ID").optional(),
    admissionDate: z.string().datetime().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
    address: z.string().max(500).optional(),
    emergencyContact: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/).optional()
  })
});

// Teacher creation schema
export const createTeacherSchema = z.object({
  userData: createUserSchema.omit({ role: true }).extend({
    role: z.literal("teacher")
  }),
  teacherData: z.object({
    employeeId: z.string().min(1, "Employee ID is required").max(20),
    department: z.string().max(100).optional(),
    qualification: z.string().max(200).optional(),
    experience: z.number().int().min(0).max(50).optional(),
    specialization: z.string().max(200).optional(),
    joiningDate: z.string().datetime().optional(),
    salary: z.number().int().min(0).optional()
  })
});

// Attendance marking schema
export const markAttendanceSchema = z.object({
  date: z.string().datetime(),
  attendance: z.array(z.object({
    studentId: z.string().uuid("Invalid student ID"),
    status: z.enum(["present", "absent", "late"]),
    remarks: z.string().max(200).optional()
  })).min(1, "At least one attendance record is required")
});

// Class creation schema
export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100),
  grade: z.string().min(1, "Grade is required").max(10),
  section: z.string().max(5).optional(),
  capacity: z.number().int().min(1).max(100).default(30),
  classTeacherId: z.string().uuid("Invalid teacher ID").optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY")
});

// Event creation schema
export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(200).optional()
});

// School creation schema
export const createSchoolSchema = z.object({
  name: z.string().min(1, "School name is required").max(200),
  code: z.string().min(3, "School code must be at least 3 characters").max(20).regex(/^[A-Z0-9_]+$/, "School code must contain only uppercase letters, numbers, and underscores"),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional()
});

// Generic validation middleware factory
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ message: "Invalid request data" });
    }
  };
}

// Query parameter validation
export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ message: "Invalid query parameters" });
    }
  };
}

// Path parameter validation
export function validateParams<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid path parameters",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ message: "Invalid path parameters" });
    }
  };
}

// Common parameter schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format")
});

export const schoolIdParamSchema = z.object({
  schoolId: z.string().uuid("Invalid school ID format")
});

export const classIdParamSchema = z.object({
  classId: z.string().uuid("Invalid class ID format")
});

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Request sanitization middleware
export function sanitizeRequest(req: AuthRequest, res: Response, next: NextFunction) {
  // Sanitize string fields in body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  next();
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
