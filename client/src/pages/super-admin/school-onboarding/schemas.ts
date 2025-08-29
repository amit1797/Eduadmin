import { z } from "zod";

export const basicDetailsSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().min(3, "School code must be at least 3 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid principal email is required"),
  principalPhone: z.string().min(10, "Valid principal phone is required"),
  establishedYear: z.string().min(4, "Valid year is required"),
  schoolType: z.enum(["public", "private", "government"]),
  board: z.enum(["cbse", "icse", "state", "ib", "other"]),
  description: z.string().optional(),
});

export const documentsSchema = z.object({
  registrationCertificate: z.string().min(1, "Registration certificate is required"),
  taxCertificate: z.string().min(1, "Tax certificate is required"),
  affiliationCertificate: z.string().min(1, "Affiliation certificate is required"),
  noCertificate: z.string().optional(),
  auditReport: z.string().optional(),
  other: z.string().optional(),
});

export const modulesSchema = z.object({
  coreModules: z.array(z.string()).min(1, "At least one core module is required"),
  optionalModules: z.array(z.string()),
});

export const configurationSchema = z.object({
  currentSession: z.string().min(1, "Current session is required"),
  sessionStartMonth: z.string().min(1, "Session start month is required"),
  sessionEndMonth: z.string().min(1, "Session end month is required"),
  workingDays: z.array(z.string()).min(1, "At least one working day is required"),
  schoolTimings: z.object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  }),
  gradingSystem: z.enum(["percentage", "gpa", "letter"]),
  currency: z.string().min(1, "Currency is required"),
  language: z.string().min(1, "Primary language is required"),
});

export const dataUploadSchema = z.object({
  studentDataFile: z.string().optional(),
  teacherDataFile: z.string().optional(),
  academicDataFile: z.string().optional(),
  skipDataUpload: z.boolean().default(false),
});

export type BasicDetails = z.infer<typeof basicDetailsSchema>;
export type Documents = z.infer<typeof documentsSchema>;
export type Modules = z.infer<typeof modulesSchema>;
export type Configuration = z.infer<typeof configurationSchema>;
export type DataUpload = z.infer<typeof dataUploadSchema>;
