import { Router } from 'express';
import { db } from '../db';
import { users, students, classes } from '../../shared/schema';
import { authenticateToken, requireRole, requireSchoolAccess } from '../middleware/auth';
import { validateBody, sanitizeRequest as sanitizeInput, createStudentSchema } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { eq, and, like, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const router = Router();

// Get all students for a school
router.get('/:schoolId/students', 
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin', 'teacher']),
  async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const { search, classId, status, page = 1, limit = 50 } = req.query;

      const searchStr = typeof search === 'string' ? search : Array.isArray(search) ? String(search[0]) : '';
      const classIdStr = typeof classId === 'string' ? classId : Array.isArray(classId) ? String(classId[0]) : '';
      const statusStr = typeof status === 'string' ? status : Array.isArray(status) ? String(status[0]) : '';

      const conditions: any[] = [eq(users.schoolId, schoolId)];
      if (searchStr) {
        conditions.push(
          or(
            like(users.firstName, `%${searchStr}%`),
            like(users.lastName, `%${searchStr}%`),
            like(users.email, `%${searchStr}%`),
            like(students.studentId, `%${searchStr}%`)
          )
        );
      }
      if (classIdStr) {
        conditions.push(eq(students.classId, classIdStr));
      }
      if (statusStr) {
        conditions.push(eq(students.status, statusStr as any));
      }

      const finalWhere = conditions.length > 1 ? and(...conditions) : conditions[0];

      const query = db
        .select({
          id: students.id,
          studentId: students.studentId,
          classId: students.classId,
          admissionDate: students.admissionDate,
          dateOfBirth: students.dateOfBirth,
          gender: students.gender,
          bloodGroup: students.bloodGroup,
          address: students.address,
          emergencyContact: students.emergencyContact,
          status: students.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          },
          class: {
            id: classes.id,
            name: classes.name,
            section: classes.section,
            grade: classes.grade
          }
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(finalWhere);

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const results = await query.limit(Number(limit)).offset(offset);

      // Get total count
      const totalQuery = db
        .select({ count: students.id })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(eq(users.schoolId, schoolId));

      const [{ count: total }] = await totalQuery;

      res.json({
        students: results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          pages: Math.ceil(Number(total) / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single student
router.get('/:schoolId/students/:studentId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin', 'teacher']),
  async (req, res, next) => {
    try {
      const { schoolId, studentId } = req.params;

      const result = await db
        .select({
          id: students.id,
          studentId: students.studentId,
          classId: students.classId,
          admissionDate: students.admissionDate,
          dateOfBirth: students.dateOfBirth,
          gender: students.gender,
          bloodGroup: students.bloodGroup,
          address: students.address,
          emergencyContact: students.emergencyContact,
          status: students.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          },
          class: {
            id: classes.id,
            name: classes.name,
            section: classes.section,
            grade: classes.grade
          }
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(
          and(
            eq(students.id, studentId),
            eq(users.schoolId, schoolId)
          )
        );

      if (result.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ student: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Define update schema as a deep partial of the create schema
const updateStudentSchema = createStudentSchema.deepPartial();

// Create student
router.post('/:schoolId/students',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  sanitizeInput,
  validateBody(createStudentSchema),
  auditLog('student_create', 'student'),
  async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const { userData, studentData } = req.body;

      // Check if username or email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.username, userData.username),
            eq(users.email, userData.email)
          )
        );

      if (existingUser.length > 0) {
        return res.status(400).json({ 
          error: 'Username or email already exists' 
        });
      }

      // Check if student ID already exists in this school
      const existingStudent = await db
        .select()
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(
          and(
            eq(students.studentId, studentData.studentId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingStudent.length > 0) {
        return res.status(400).json({ 
          error: 'Student ID already exists in this school' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
          role: 'student',
          schoolId,
          status: 'active'
        })
        .returning();

      // Create student
      const [newStudent] = await db
        .insert(students)
        .values({
          ...studentData,
          userId: newUser.id,
          status: 'active'
        })
        .returning();

      // Fetch complete student data
      const result = await db
        .select({
          id: students.id,
          studentId: students.studentId,
          classId: students.classId,
          admissionDate: students.admissionDate,
          dateOfBirth: students.dateOfBirth,
          gender: students.gender,
          bloodGroup: students.bloodGroup,
          address: students.address,
          emergencyContact: students.emergencyContact,
          status: students.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(eq(students.id, newStudent.id));

      res.status(201).json({ student: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Update student
router.put('/:schoolId/students/:studentId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  sanitizeInput,
  validateBody(updateStudentSchema),
  auditLog('student_update', 'student'),
  async (req, res, next) => {
    try {
      const { schoolId, studentId } = req.params;
      const { userData, studentData } = req.body;

      // Check if student exists
      const existingStudent = await db
        .select()
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(
          and(
            eq(students.id, studentId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingStudent.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const userId = existingStudent[0].users?.id;

      // Update user data if provided
      if (userData && userId) {
        const updateData: any = { ...userData };
        
        // Hash password if provided
        if (userData.password) {
          updateData.password = await bcrypt.hash(userData.password, 12);
        }

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId));
      }

      // Update student data if provided
      if (studentData) {
        await db
          .update(students)
          .set(studentData)
          .where(eq(students.id, studentId));
      }

      // Fetch updated student data
      const result = await db
        .select({
          id: students.id,
          studentId: students.studentId,
          classId: students.classId,
          admissionDate: students.admissionDate,
          dateOfBirth: students.dateOfBirth,
          gender: students.gender,
          bloodGroup: students.bloodGroup,
          address: students.address,
          emergencyContact: students.emergencyContact,
          status: students.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(eq(students.id, studentId));

      res.json({ student: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Delete student
router.delete('/:schoolId/students/:studentId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  auditLog('student_delete', 'student'),
  async (req, res, next) => {
    try {
      const { schoolId, studentId } = req.params;

      // Check if student exists
      const existingStudent = await db
        .select()
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(
          and(
            eq(students.id, studentId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingStudent.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const userId = existingStudent[0].users?.id;

      // Delete student record
      await db.delete(students).where(eq(students.id, studentId));

      // Delete user record
      if (userId) {
        await db.delete(users).where(eq(users.id, userId));
      }

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
