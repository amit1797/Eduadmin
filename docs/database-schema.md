# Database Schema

## Overview

EduManage Pro uses PostgreSQL with a comprehensive schema designed for multi-school management. The database follows normalized design principles with proper foreign key relationships and constraints.

## Database Connection

```typescript
// Connection configuration
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## Core Tables

### 1. Users Table

Central user authentication and profile table supporting multiple roles.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  status user_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enums:**
```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'school_admin', 
  'sub_school_admin',
  'teacher',
  'student',
  'parent',
  'librarian',
  'accountant',
  'transport_manager'
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
```

**Drizzle Schema:**
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: roleEnum("role").notNull(),
  schoolId: integer("school_id").references(() => schools.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 20 }),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

### 2. Schools Table

School information and configuration.

```sql
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  principal_name VARCHAR(255),
  principal_email VARCHAR(255),
  principal_phone VARCHAR(20),
  established_year INTEGER,
  school_type school_type,
  board VARCHAR(100),
  description TEXT,
  enabled_modules TEXT[] DEFAULT '{}',
  status school_status DEFAULT 'active',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enums:**
```sql
CREATE TYPE school_type AS ENUM ('public', 'private', 'charter', 'international');
CREATE TYPE school_status AS ENUM ('active', 'inactive', 'pending');
```

### 3. Students Table

Student-specific profile information.

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number VARCHAR(50),
  grade VARCHAR(20),
  section VARCHAR(10),
  admission_date DATE,
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  address TEXT,
  status student_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enum:**
```sql
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred');
```

### 4. Teachers Table

Teacher-specific profile and employment information.

```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50),
  department VARCHAR(100),
  specialization VARCHAR(255),
  qualification VARCHAR(255),
  experience INTEGER DEFAULT 0,
  joining_date DATE,
  address TEXT,
  status teacher_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enum:**
```sql
CREATE TYPE teacher_status AS ENUM ('active', 'inactive', 'on_leave', 'resigned');
```

### 5. Classes Table

Academic class management.

```sql
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  section VARCHAR(10),
  class_teacher_id INTEGER REFERENCES teachers(id),
  subjects TEXT[] DEFAULT '{}',
  status class_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enum:**
```sql
CREATE TYPE class_status AS ENUM ('active', 'inactive', 'archived');
```

### 6. Attendance Table

Daily attendance tracking.

```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  marked_by INTEGER REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Enum:**
```sql
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
```

### 7. Events Table

School events and calendar management.

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type VARCHAR(50),
  status event_status DEFAULT 'scheduled',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enum:**
```sql
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled', 'postponed');
```

### 8. Audit Logs Table

Comprehensive activity tracking and audit trail.

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  school_id INTEGER REFERENCES schools(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Relationships

### Entity Relationship Diagram

```
users ──┐
        │
        ├── students (1:1)
        ├── teachers (1:1)
        └── audit_logs (1:many)
        
schools ──┐
          ├── users (1:many)
          ├── classes (1:many)
          ├── events (1:many)
          └── audit_logs (1:many)
          
classes ──┐
          ├── attendance (1:many)
          └── teacher (many:1)
          
students ──┐
           └── attendance (1:many)
```

### Key Relationships

1. **Users ↔ Schools**: Many-to-one (users belong to one school)
2. **Users ↔ Students/Teachers**: One-to-one (profile extension)
3. **Schools ↔ Classes**: One-to-many (school has multiple classes)
4. **Classes ↔ Teachers**: Many-to-one (class teacher assignment)
5. **Students ↔ Attendance**: One-to-many (student attendance records)
6. **All Tables ↔ Audit Logs**: Activity tracking for all entities

## Indexes

### Performance Indexes

```sql
-- User authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_role ON users(school_id, role);

-- School lookups
CREATE INDEX idx_schools_code ON schools(code);
CREATE INDEX idx_schools_status ON schools(status);

-- Student management
CREATE INDEX idx_students_roll_grade ON students(roll_number, grade);
CREATE INDEX idx_students_user_id ON students(user_id);

-- Teacher management
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);
CREATE INDEX idx_teachers_department ON teachers(department);

-- Class management
CREATE INDEX idx_classes_school_grade ON classes(school_id, grade);
CREATE INDEX idx_classes_teacher ON classes(class_teacher_id);

-- Attendance tracking
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);

-- Event management
CREATE INDEX idx_events_school_date ON events(school_id, date);

-- Audit logging
CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_school_timestamp ON audit_logs(school_id, timestamp);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
```

## Data Types and Constraints

### Custom Types

```typescript
// Drizzle schema types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Event = typeof events.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
```

### Validation Schemas

```typescript
// Zod validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
```

## Sample Data

### Test Schools
```sql
INSERT INTO schools (name, code, address, city, state, principal_name, principal_email, established_year, school_type, board, status) VALUES
('Sunrise Public School', 'SPS001', '123 Education Lane', 'Mumbai', 'Maharashtra', 'Dr. Priya Sharma', 'admin@sunriseschool.edu', 1985, 'public', 'CBSE', 'active'),
('Greenwood International', 'GWI002', '456 Learning Avenue', 'Delhi', 'Delhi', 'Mr. Rajesh Kumar', 'admin@greenwood.edu', 1992, 'private', 'IB', 'active'),
('Oakwood Academy', 'OWA003', '789 Knowledge Street', 'Bangalore', 'Karnataka', 'Ms. Anita Desai', 'admin@oakwood.edu', 1998, 'private', 'ICSE', 'active');
```

### Test Users
```sql
INSERT INTO users (email, password, first_name, last_name, role, school_id, phone, status) VALUES
('superadmin@edumanage.com', '$2b$10$hashed_password', 'Super', 'Admin', 'super_admin', NULL, '9999999999', 'active'),
('admin@sunriseschool.edu', '$2b$10$hashed_password', 'Priya', 'Sharma', 'school_admin', 1, '9876543210', 'active'),
('john.smith@sunriseschool.edu', '$2b$10$hashed_password', 'John', 'Smith', 'teacher', 1, '9876543211', 'active');
```

## Migrations

### Migration Strategy

1. **Schema Migrations**: Managed through Drizzle Kit
2. **Data Migrations**: SQL scripts for data transformations
3. **Rollback Support**: All migrations include rollback procedures
4. **Environment Separation**: Different migration paths for dev/prod

### Migration Commands

```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# View migrations
npm run db:studio
```

## Security Considerations

### Data Protection
- **Row Level Security**: School-based data isolation
- **Encrypted Passwords**: bcrypt with salt rounds
- **Audit Trail**: Complete activity logging
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries

### Access Control
- **Role-Based Permissions**: Granular access control
- **School Scoping**: Users only access their school data
- **Session Management**: PostgreSQL-backed sessions
- **Token Expiration**: 24-hour JWT token lifecycle

## Backup and Recovery

### Backup Strategy
- **Daily Automated Backups**: Full database backup
- **Point-in-Time Recovery**: Transaction log backups
- **Cross-Region Replication**: Geographic redundancy
- **Retention Policy**: 30-day backup retention

### Recovery Procedures
- **Disaster Recovery**: Documented recovery procedures
- **Data Corruption**: Corruption detection and repair
- **Partial Recovery**: Table-level recovery options
- **Testing**: Regular backup restoration testing