# Architecture Overview

## System Architecture

EduManage Pro follows a modern full-stack architecture with clear separation of concerns and modular design principles.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express.js API │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Framework**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized builds
- **Forms**: React Hook Form with Zod validation

### Project Structure
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (Navbar, Sidebar)
│   │   └── common/         # Shared components
│   ├── pages/              # Route components organized by role
│   │   ├── super-admin/    # Super admin pages
│   │   ├── school-admin/   # School admin pages
│   │   ├── teacher/        # Teacher pages
│   │   └── student/        # Student pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and configurations
│   └── App.tsx             # Main application component
└── index.html
```

### Key Frontend Patterns

1. **Component-Based Architecture**: Modular, reusable components
2. **Role-Based Routing**: Dynamic routing based on user roles
3. **Server State Management**: TanStack Query for data fetching and caching
4. **Form Validation**: Type-safe forms with Zod schemas
5. **Responsive Design**: Mobile-first approach with Tailwind CSS

### Routing Scheme

EduManage Pro uses Wouter for client-side routing with role-based namespaces.

- **Super Admin**
  - Dashboard: `/super-admin/dashboard`
  - Schools: `/super-admin/schools`
  - Users: `/super-admin/users`
  - Settings & tools under `/super-admin/*`

- **School Admin / Sub School Admin** (Dynamic, school-scoped)
  - Dashboard: `/:schoolId/admin/dashboard`
  - Students: `/:schoolId/admin/students`
  - Teachers: `/:schoolId/admin/teachers`
  - Classes: `/:schoolId/admin/classes`
  - Attendance: `/:schoolId/admin/attendance`
  - Events: `/:schoolId/admin/events`
  - Accounts: `/:schoolId/admin/accounts`

- **Teacher**
  - Dashboard: `/teacher/dashboard`
  - Other teacher pages under `/teacher/*`

#### Redirects (Backward Compatibility)
Legacy paths are redirected to the new scheme:

- `/school-admin/dashboard` → `/:schoolId/admin/dashboard`
- `/students` → `/:schoolId/admin/students`

The `Sidebar` component now accepts `schoolId` and builds school-admin links with the `/:schoolId/admin/*` prefix. When `schoolId` is not available, it falls back to legacy prefixes to avoid broken links in transitional states.

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe operations
- **Authentication**: JWT tokens with bcrypt password hashing
- **Session Management**: PostgreSQL-backed sessions
- **Database**: PostgreSQL with Neon serverless connection

### Project Structure
```
server/
├── middleware/             # Express middleware
│   ├── auth.ts            # Authentication middleware
│   └── validation.ts      # Request validation
├── db.ts                  # Database connection and configuration
├── routes.ts              # API route definitions
├── storage.ts             # Data access layer (Repository pattern)
├── index.ts               # Express server setup
└── seed.ts                # Database seeding script
```

### Key Backend Patterns

1. **Repository Pattern**: Storage interface abstracts database operations
2. **Middleware Architecture**: Composable request processing pipeline
3. **Type-Safe Database**: Drizzle ORM with TypeScript integration
4. **Error Handling**: Structured error responses with logging
5. **Authentication Flow**: JWT-based stateless authentication

## Database Architecture

### Database Design Principles
- **Normalized Schema**: Proper foreign key relationships
- **Role-Based Security**: School-scoped data access
- **Audit Trail**: Comprehensive logging of user actions
- **Flexible Configuration**: JSON fields for dynamic settings

### Core Entities
- **Users**: Multi-role user accounts with school association
- **Schools**: School entities with configuration and modules
- **Students/Teachers**: Role-specific profile data
- **Classes**: Academic class management
- **Attendance**: Daily attendance tracking
- **Events**: School calendar and event management
- **Audit Logs**: Complete activity tracking

## Security Architecture

### Authentication & Authorization
- **Multi-Factor Authentication**: Email + school code validation
- **Role-Based Access Control (RBAC)**: Granular permissions
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: PostgreSQL-backed session storage

### Data Security
- **School Data Isolation**: Strict school-based data scoping
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Audit Logging**: Complete activity trail for compliance

## Module System Architecture

### Configurable Modules
Schools can enable/disable modules based on their needs:

**Core Modules** (Always Available):
- Student Management
- Teacher Management  
- Class Management
- Basic Academics
- Attendance Tracking
- User Management

**Optional Modules** (Subscription-Based):
- Advanced Academics
- Library Management
- Transport Management
- Payroll System
- Branch Management
- Advanced Reporting

### Module Configuration
```typescript
interface SchoolConfiguration {
  enabledModules: string[];
  academicYear: string;
  sessionTimings: {
    startTime: string;
    endTime: string;
    lunchBreak: string;
  };
  gradingSystem: 'percentage' | 'gpa' | 'marks';
  workingDays: string[];
}
```

## Scalability Considerations

### Performance Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Query Optimization**: Efficient data fetching patterns
- **Caching Strategy**: React Query for client-side caching
- **Bundle Optimization**: Code splitting and lazy loading

### Scalability Features
- **Multi-School Architecture**: Horizontal scaling by school
- **Role-Based Permissions**: Granular access control
- **Modular Feature Set**: Pay-per-module pricing model
- **API Rate Limiting**: Request throttling and protection

## Development Workflow

### Code Organization
- **Shared Types**: Common TypeScript definitions in `/shared`
- **API Client**: Centralized HTTP client configuration
- **Component Library**: Consistent UI component system
- **Validation Schemas**: Shared Zod schemas for type safety

### Build Process
- **Development**: Hot module replacement with Vite
- **Type Checking**: Full TypeScript compilation
- **Database Migrations**: Drizzle Kit migration system
- **Production Build**: Optimized bundling for deployment

## Deployment Architecture

### Environment Configuration
- **Development**: Local PostgreSQL with seed data
- **Production**: Neon PostgreSQL with connection pooling
- **Environment Variables**: Secure configuration management
- **Build Pipeline**: Automated building and deployment

### Monitoring & Logging
- **Application Logs**: Structured logging with timestamps
- **Audit Trail**: Complete user activity tracking
- **Error Handling**: Graceful error recovery and reporting
- **Performance Monitoring**: Query performance and response times