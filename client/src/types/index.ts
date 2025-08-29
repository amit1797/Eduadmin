// Enhanced TypeScript types for the entire application

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  schoolId?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | "super_admin" 
  | "school_admin" 
  | "sub_school_admin" 
  | "teacher" 
  | "student" 
  | "parent"
  | "accountant" 
  | "librarian" 
  | "transport_admin" 
  | "hod" 
  | "org_admin";

export type Status = "active" | "inactive" | "pending" | "graduated";

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  classId?: string;
  admissionDate?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  address?: string;
  parentId?: string;
  emergencyContact?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  user?: User;
  class?: Class;
  parent?: User;
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  joiningDate?: string;
  salary?: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section?: string;
  capacity: number;
  schoolId: string;
  classTeacherId?: string;
  academicYear: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  school?: School;
  classTeacher?: User;
  students?: Student[];
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late";
  markedBy: string;
  remarks?: string;
  createdAt: string;
  student?: Student;
  class?: Class;
  markedByUser?: User;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  schoolId: string;
  createdAt: string;
  school?: School;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  createdAt: string;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  schoolId: string;
  createdBy: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  school?: School;
  creator?: User;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: string;
  newValues?: string;
  schoolId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
  school?: School;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  schoolCode?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// Form types
export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  schoolId?: string;
}

export interface CreateStudentForm {
  userData: Omit<CreateUserForm, 'role'> & { role: 'student' };
  studentData: {
    studentId: string;
    classId?: string;
    admissionDate?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    address?: string;
    emergencyContact?: string;
  };
}

export interface CreateTeacherForm {
  userData: Omit<CreateUserForm, 'role'> & { role: 'teacher' };
  teacherData: {
    employeeId: string;
    department?: string;
    qualification?: string;
    experience?: number;
    specialization?: string;
    joiningDate?: string;
    salary?: number;
  };
}

export interface CreateClassForm {
  name: string;
  grade: string;
  section?: string;
  capacity: number;
  classTeacherId?: string;
  academicYear: string;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface CreateSchoolForm {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface MarkAttendanceForm {
  date: string;
  attendance: Array<{
    studentId: string;
    status: "present" | "absent" | "late";
    remarks?: string;
  }>;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface AttendanceReportParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  classId?: string;
  type?: 'students' | 'teachers';
}

export interface AuditLogParams extends PaginationParams {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

// Component props types
export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T) => void;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// State management types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  ui: {
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    theme: 'light' | 'dark';
    loading: boolean;
  };
}

// Hook return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UsePaginationResult {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Module and permission types
export type Module = 
  | "student_management" 
  | "teacher_management" 
  | "class_management" 
  | "academics_management"
  | "attendance_management" 
  | "test_result_management" 
  | "event_management" 
  | "basic_accounts"
  | "notification_system" 
  | "audit_system" 
  | "library_management" 
  | "transport_management"
  | "accounts_payroll" 
  | "staff_management" 
  | "advance_notification" 
  | "branch_management";

export type Permission = "create" | "read" | "update" | "delete";

export interface SchoolModule {
  id: string;
  schoolId: string;
  module: Module;
  enabled: boolean;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  module: Module;
  permission: Permission;
  createdAt: string;
}
