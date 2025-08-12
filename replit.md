# Overview

EduManage Pro is a comprehensive school management system built with React (frontend) and Express.js (backend). The application provides role-based access control for different user types including super admins, school admins, sub school admins, teachers, students, and parents. It features modular functionality covering student management, class management, attendance tracking, academic records, and administrative operations.

## Recent Updates

**Database & Seed Data (August 12, 2025)**
- Comprehensive seed data added with 3 schools, multiple user roles, and realistic test data
- Complete PostgreSQL schema with 12 tables including users, schools, students, teachers, classes, attendance, events, and audit logs
- Role-based permissions system implemented with granular CRUD controls
- Multi-school architecture supporting school-specific module configuration

## Test Data Available

The system includes comprehensive seed data for testing all functionality:

### Test Accounts
- **Super Admin**: superadmin@edumanage.com / admin123 (no school code needed)
- **School Admin**: admin@sunriseschool.edu / admin123 / SPS001
- **Teacher**: john.smith@sunriseschool.edu / teacher123 / SPS001  
- **Student**: alex.johnson@student.sunriseschool.edu / student123 / SPS001
- **Parent**: robert.johnson@email.com / parent123 / SPS001

### Sample Data Includes
- 3 schools with enabled core modules
- 4 teachers with different specializations
- 6 students across multiple grades (9A, 9B, 10A, 10B)
- 3 parent accounts linked to students
- Attendance records for testing
- Scheduled events and audit logs
- Subject assignments and class relationships

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite for fast development and optimized production builds
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Authorization**: Role-based access control with middleware protection
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured error handling and logging
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Model**: Comprehensive schema covering schools, users, students, teachers, classes, attendance, and audit logs
- **Relationships**: Well-defined foreign key relationships with proper cascading
- **Enums**: PostgreSQL enums for roles, statuses, permissions, and modules

## Authentication & Authorization
- **Multi-role System**: Support for super_admin, school_admin, sub_school_admin, teacher, student, parent, and specialized roles
- **School-based Access**: School code validation for non-super admin users
- **Token Management**: JWT tokens with 24-hour expiration
- **Middleware Protection**: Route-level authorization based on user roles and school access
- **Activity Logging**: Comprehensive audit trail for all user actions

## Module System
- **Configurable Modules**: School-specific feature enablement (student_management, attendance_management, etc.)
- **Permission System**: Granular CRUD permissions per role and module
- **Branch Management**: Support for multi-branch school operations
- **Scalable Architecture**: Module-based feature activation for different subscription tiers

# External Dependencies

## Core Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection with WebSocket support
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and comparison
- **connect-pg-simple**: PostgreSQL session store for Express
- **ws**: WebSocket implementation for Neon database connections

## Frontend UI Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (dialog, dropdown, accordion, etc.)
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation
- **class-variance-authority**: Type-safe variant management for components
- **cmdk**: Command palette functionality
- **date-fns**: Date manipulation and formatting

## Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Backend bundling for production
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management tool

## Validation & Type Safety
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle ORM and Zod for form validation
- **TypeScript**: Comprehensive type checking across frontend and backend
- **Shared Schema**: Common type definitions between client and server