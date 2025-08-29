import { Router } from 'express';
import { db } from '../db';
import { users, teachers, classes } from '../../shared/schema';
import { authenticateToken, requireRole, requireSchoolAccess } from '../middleware/auth';
import { validateBody, sanitizeRequest as sanitizeInput, createTeacherSchema } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { eq, and, like, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const router = Router();

// Get all teachers for a school
router.get('/:schoolId/teachers', 
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const { search, department, status, page = 1, limit = 50 } = req.query;

      const searchStr = typeof search === 'string' ? search : Array.isArray(search) ? String(search[0]) : '';
      const deptStr = typeof department === 'string' ? department : Array.isArray(department) ? String(department[0]) : '';
      const statusStr = typeof status === 'string' ? status : Array.isArray(status) ? String(status[0]) : '';

      // Build conditions once and apply a single where(and(...))
      const conditions: any[] = [eq(users.schoolId, schoolId)];
      if (searchStr) {
        conditions.push(
          or(
            like(users.firstName, `%${searchStr}%`),
            like(users.lastName, `%${searchStr}%`),
            like(users.email, `%${searchStr}%`),
            like(teachers.employeeId, `%${searchStr}%`)
          )
        );
      }
      if (deptStr) {
        conditions.push(like(teachers.department, `%${deptStr}%`));
      }
      if (statusStr) {
        conditions.push(eq(teachers.status, statusStr as any));
      }

      const finalWhere = conditions.length > 1 ? and(...conditions) : conditions[0];

      const query = db
        .select({
          id: teachers.id,
          employeeId: teachers.employeeId,
          department: teachers.department,
          qualification: teachers.qualification,
          experience: teachers.experience,
          specialization: teachers.specialization,
          joiningDate: teachers.joiningDate,
          salary: teachers.salary,
          status: teachers.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(finalWhere);

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const results = await query.limit(Number(limit)).offset(offset);

      // Get total count
      const totalQuery = db
        .select({ count: teachers.id })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(eq(users.schoolId, schoolId));

      const [{ count: total }] = await totalQuery;

      res.json({
        teachers: results,
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

// Define update schema as a deep partial of the create schema
const updateTeacherSchema = createTeacherSchema.deepPartial();

// Get single teacher
router.get('/:schoolId/teachers/:teacherId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  async (req, res, next) => {
    try {
      const { schoolId, teacherId } = req.params;

      const result = await db
        .select({
          id: teachers.id,
          employeeId: teachers.employeeId,
          department: teachers.department,
          qualification: teachers.qualification,
          experience: teachers.experience,
          specialization: teachers.specialization,
          joiningDate: teachers.joiningDate,
          salary: teachers.salary,
          status: teachers.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(
          and(
            eq(teachers.id, teacherId),
            eq(users.schoolId, schoolId)
          )
        );

      if (result.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({ teacher: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Create teacher
router.post('/:schoolId/teachers',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  sanitizeInput,
  validateBody(createTeacherSchema),
  auditLog('teacher_create', 'teacher'),
  async (req, res, next) => {
    try {
      const { schoolId } = req.params;
      const { userData, teacherData } = req.body;

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

      // Check if employee ID already exists in this school
      const existingTeacher = await db
        .select()
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(
          and(
            eq(teachers.employeeId, teacherData.employeeId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingTeacher.length > 0) {
        return res.status(400).json({ 
          error: 'Employee ID already exists in this school' 
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
          role: 'teacher',
          schoolId,
          status: 'active'
        })
        .returning();

      // Create teacher
      const [newTeacher] = await db
        .insert(teachers)
        .values({
          ...teacherData,
          userId: newUser.id,
          status: 'active'
        })
        .returning();

      // Fetch complete teacher data
      const result = await db
        .select({
          id: teachers.id,
          employeeId: teachers.employeeId,
          department: teachers.department,
          qualification: teachers.qualification,
          experience: teachers.experience,
          specialization: teachers.specialization,
          joiningDate: teachers.joiningDate,
          salary: teachers.salary,
          status: teachers.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(eq(teachers.id, newTeacher.id));

      res.status(201).json({ teacher: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Update teacher
router.put('/:schoolId/teachers/:teacherId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  sanitizeInput,
  validateBody(updateTeacherSchema),
  auditLog('teacher_update', 'teacher'),
  async (req, res, next) => {
    try {
      const { schoolId, teacherId } = req.params;
      const { userData, teacherData } = req.body;

      // Check if teacher exists
      const existingTeacher = await db
        .select()
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(
          and(
            eq(teachers.id, teacherId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingTeacher.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const userId = existingTeacher[0].users?.id;

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

      // Update teacher data if provided
      if (teacherData) {
        await db
          .update(teachers)
          .set(teacherData)
          .where(eq(teachers.id, teacherId));
      }

      // Fetch updated teacher data
      const result = await db
        .select({
          id: teachers.id,
          employeeId: teachers.employeeId,
          department: teachers.department,
          qualification: teachers.qualification,
          experience: teachers.experience,
          specialization: teachers.specialization,
          joiningDate: teachers.joiningDate,
          salary: teachers.salary,
          status: teachers.status,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(eq(teachers.id, teacherId));

      res.json({ teacher: result[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Delete teacher
router.delete('/:schoolId/teachers/:teacherId',
  authenticateToken,
  requireSchoolAccess,
  requireRole(['school_admin', 'sub_school_admin']),
  auditLog('teacher_delete', 'teacher'),
  async (req, res, next) => {
    try {
      const { schoolId, teacherId } = req.params;

      // Check if teacher exists
      const existingTeacher = await db
        .select()
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(
          and(
            eq(teachers.id, teacherId),
            eq(users.schoolId, schoolId)
          )
        );

      if (existingTeacher.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const userId = existingTeacher[0].users?.id;

      // Delete teacher record
      await db.delete(teachers).where(eq(teachers.id, teacherId));

      // Delete user record
      if (userId) {
        await db.delete(users).where(eq(users.id, userId));
      }

      res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
