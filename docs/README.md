# EduManage Pro Documentation

Welcome to the comprehensive documentation for EduManage Pro - a modular school management system built with React and Express.js.

## Documentation Overview

This documentation provides detailed information about the system's architecture, APIs, database design, and workflows.

### Documentation Structure

- **[Architecture Overview](./architecture.md)** - System architecture, technology stack, and design patterns
- **[API Specification](./api-specification.md)** - Complete REST API documentation with endpoints and examples
- **[Database Schema](./database-schema.md)** - Database design, tables, relationships, and data models
- **[Workflow Design](./workflow-design.md)** - User workflows, business processes, and system interactions
- **[User Roles & Permissions](./roles-permissions.md)** - Role-based access control and permission matrix
- **[Module System](./module-system.md)** - Configurable modules and feature management
- **[Development Guide](./development-guide.md)** - Setup, development practices, and deployment

## Quick Start

### Test Accounts
For testing the system, use these pre-configured accounts:

- **Super Admin**: superadmin@edumanage.com / admin123 (no school code)
- **School Admin**: admin@sunriseschool.edu / admin123 / SPS001
- **Teacher**: john.smith@sunriseschool.edu / teacher123 / SPS001
- **Student**: alex.johnson@student.sunriseschool.edu / student123 / SPS001
- **Parent**: robert.johnson@email.com / parent123 / SPS001


### System Features

- ✅ Multi-school architecture with role-based access control
- ✅ Comprehensive school onboarding workflow (6 steps)
- ✅ Student and teacher management
- ✅ Attendance tracking and academic records
- ✅ Event management and audit logging
- ✅ Configurable module system
- ✅ Real-time dashboard analytics

## System Status

**Current Version**: 1.0.0  
**Last Updated**: August 12, 2025  
**Database**: PostgreSQL with comprehensive seed data  
**Authentication**: JWT-based with bcrypt password hashing  
**Frontend**: React 18 with TypeScript and shadcn/ui components  
**Backend**: Express.js with Drizzle ORM  

## Routing

- **Super Admin**
  - `/super-admin/dashboard`
  - other tools under `/super-admin/*`

- **School Admin (Dynamic)**
  - `/:schoolId/admin/dashboard`
  - `/:schoolId/admin/students`

Legacy redirects are in place:

- `/school-admin/dashboard` → `/:schoolId/admin/dashboard`
- `/students` → `/:schoolId/admin/students`

## Getting Help

For technical support or questions about the documentation, refer to the specific documentation sections or contact the development team.