# API Specification

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "schoolCode": "string" // Optional for super_admin, required for others
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "super_admin | school_admin | teacher | student | parent",
    "schoolId": "number"
  }
}
```

#### GET /auth/me
Get current authenticated user information.

**Response:**
```json
{
  "id": "number",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "schoolId": "number"
}
```

## Super Admin Endpoints

### Statistics

#### GET /super-admin/stats
Get system-wide statistics for super admin dashboard.

**Response:**
```json
{
  "totalSchools": "number",
  "activeLicenses": "number",
  "totalStudents": "number",
  "totalTeachers": "number",
  "monthlyRevenue": "number",
  "recentActivities": [
    {
      "id": "number",
      "action": "string",
      "resource": "string",
      "timestamp": "string",
      "userName": "string"
    }
  ]
}
```

### School Management

#### GET /super-admin/schools
Get all schools in the system.

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "code": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "principalName": "string",
    "principalEmail": "string",
    "principalPhone": "string",
    "establishedYear": "number",
    "schoolType": "string",
    "board": "string",
    "description": "string",
    "enabledModules": ["string"],
    "status": "active | inactive | pending",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### POST /super-admin/onboard-school
Complete school onboarding process.

**Request Body:**
```json
{
  "basicDetails": {
    "name": "string",
    "code": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "principalName": "string",
    "principalEmail": "string",
    "principalPhone": "string",
    "establishedYear": "string",
    "schoolType": "string",
    "board": "string",
    "description": "string"
  },
  "documents": {
    "registrationCertificate": "string",
    "affiliationCertificate": "string",
    "taxExemptionCertificate": "string",
    "buildingApprovalCertificate": "string",
    "fireSafetyCertificate": "string",
    "environmentClearance": "string"
  },
  "modules": {
    "coreModules": ["string"],
    "optionalModules": ["string"]
  },
  "configuration": {
    "academicYear": "string",
    "sessionTimings": {
      "startTime": "string",
      "endTime": "string",
      "lunchBreak": "string"
    },
    "gradingSystem": "string",
    "workingDays": ["string"]
  },
  "dataUpload": {
    "studentsFile": "string",
    "teachersFile": "string",
    "academicDataFile": "string"
  }
}
```

**Response:**
```json
{
  "school": {
    "id": "number",
    "name": "string",
    "code": "string",
    // ... other school fields
  },
  "principalUser": {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "school_admin",
    "schoolId": "number"
  },
  "message": "School onboarded successfully"
}
```

#### POST /super-admin/schools
Create a new school (legacy endpoint).

**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "address": "string",
  // ... other school fields
}
```

#### DELETE /super-admin/schools/:schoolId
Delete a school.

**Response:**
```json
{
  "message": "School deleted successfully"
}
```

### User Management

#### GET /super-admin/users
Get all users in the system.

**Query Parameters:**
- `role` (optional): Filter by user role
- `schoolId` (optional): Filter by school

**Response:**
```json
[
  {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "schoolId": "number",
    "phone": "string",
    "status": "active | inactive",
    "createdAt": "string",
    "school": {
      "name": "string",
      "code": "string"
    }
  }
]
```

## School Admin Endpoints

### School Statistics

#### GET /schools/:schoolId/stats
Get statistics for a specific school.

**Response:**
```json
{
  "totalStudents": "number",
  "totalTeachers": "number",
  "totalClasses": "number",
  "attendanceRate": "number",
  "recentActivities": [
    {
      "id": "number",
      "action": "string",
      "resource": "string",
      "timestamp": "string",
      "userName": "string"
    }
  ]
}
```

### Student Management

#### GET /schools/:schoolId/students
Get all students for a school.

**Response:**
```json
[
  {
    "id": "number",
    "userId": "number",
    "rollNumber": "string",
    "grade": "string",
    "section": "string",
    "admissionDate": "string",
    "status": "active | inactive",
    "user": {
      "id": "number",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "string"
    }
  }
]
```

#### POST /schools/:schoolId/students
Create a new student.

**Request Body:**
```json
{
  "userData": {
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "password": "string" // Optional, defaults to "defaultpass123"
  },
  "studentData": {
    "rollNumber": "string",
    "grade": "string",
    "section": "string",
    "admissionDate": "string",
    "guardianName": "string",
    "guardianPhone": "string",
    "guardianEmail": "string",
    "address": "string"
  }
}
```

#### PUT /schools/:schoolId/students/:studentId
Update student information.

#### DELETE /schools/:schoolId/students/:studentId
Delete a student.

### Teacher Management

#### GET /schools/:schoolId/teachers
Get all teachers for a school.

**Response:**
```json
[
  {
    "id": "number",
    "userId": "number",
    "employeeId": "string",
    "department": "string",
    "specialization": "string",
    "qualification": "string",
    "experience": "number",
    "joiningDate": "string",
    "status": "active | inactive",
    "user": {
      "id": "number",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "string"
    }
  }
]
```

#### POST /schools/:schoolId/teachers
Create a new teacher.

**Request Body:**
```json
{
  "userData": {
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "password": "string" // Optional
  },
  "teacherData": {
    "employeeId": "string",
    "department": "string",
    "specialization": "string",
    "qualification": "string",
    "experience": "number",
    "joiningDate": "string",
    "address": "string"
  }
}
```

### Class Management

#### GET /schools/:schoolId/classes
Get all classes for a school.

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "grade": "string",
    "section": "string",
    "classTeacherId": "number",
    "subjects": ["string"],
    "status": "active | inactive",
    "classTeacher": {
      "id": "number",
      "employeeId": "string",
      "user": {
        "firstName": "string",
        "lastName": "string"
      }
    }
  }
]
```

#### POST /schools/:schoolId/classes
Create a new class.

#### PUT /schools/:schoolId/classes/:classId
Update class information.

#### DELETE /schools/:schoolId/classes/:classId
Delete a class.

### Attendance Management

#### GET /schools/:schoolId/attendance
Get attendance records.

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `classId` (optional): Filter by class
- `studentId` (optional): Filter by student

#### POST /schools/:schoolId/attendance
Mark attendance for students.

**Request Body:**
```json
{
  "date": "string (YYYY-MM-DD)",
  "classId": "number",
  "attendance": [
    {
      "studentId": "number",
      "status": "present | absent | late"
    }
  ]
}
```

### Event Management

#### GET /schools/:schoolId/events
Get school events.

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "eventType": "string",
    "status": "scheduled | completed | cancelled"
  }
]
```

#### POST /schools/:schoolId/events
Create a new event.

#### PUT /schools/:schoolId/events/:eventId
Update an event.

#### DELETE /schools/:schoolId/events/:eventId
Delete an event.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Per User**: 1000 requests per hour
- **Per IP**: 5000 requests per hour
- **Authentication**: 10 login attempts per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

Large result sets are paginated using query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example:**
```
GET /api/schools/1/students?page=2&limit=50
```

**Response includes pagination metadata:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```