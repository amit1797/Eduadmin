import { AuthService } from "./auth";
import { queryClient } from "./queryClient";
import { type LoginResponse, type AuthUser } from "./auth";

class ApiClient {
  private baseURL = "";

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = AuthService.getToken();
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      AuthService.clearAuth();
      queryClient.clear();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string; schoolCode?: string }) =>
    api.post<LoginResponse>("/api/auth/login", credentials),
  
  getMe: () => api.get<AuthUser>("/api/auth/me"),
};

// Super Admin API
export const superAdminApi = {
  getStats: () => api.get<{
    totalSchools: number;
    activeLicenses: number;
    monthlyRevenue: number;
    supportTickets: number;
  }>("/api/super-admin/stats"),
  
  getSchools: () => api.get<any[]>("/api/super-admin/schools"),
  
  createSchool: (school: any) => api.post("/api/super-admin/schools", school),
  
  deleteSchool: (schoolId: number) => api.delete(`/api/super-admin/schools/${schoolId}`),
  
  onboardSchool: (data: any) => api.post("/api/super-admin/onboard-school", data),
  
  getUserManagement: () => api.get<any[]>("/api/super-admin/users"),
  
  getAnalytics: () => api.get<any>("/api/super-admin/analytics"),
  
  getSubscriptions: () => api.get<any[]>("/api/super-admin/subscriptions"),
  
  getSettings: () => api.get<any>("/api/super-admin/settings"),
  
  updateSettings: (settings: any) => api.put("/api/super-admin/settings", settings),
};

// School API
export const schoolApi = {
  getStats: (schoolId: string) => api.get<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    todayAttendance: number;
  }>(`/api/schools/${schoolId}/stats`),
  
  getStudents: (schoolId: string) => api.get<any[]>(`/api/schools/${schoolId}/students`),
  getStudent: (schoolId: string, studentId: string) => api.get<any>(`/api/schools/${schoolId}/students/${studentId}`),
  getStudentAttendance: (schoolId: string, studentId: string) => api.get<any>(`/api/schools/${schoolId}/students/${studentId}/attendance`),
  getStudentFees: (schoolId: string, studentId: string) => api.get<any>(`/api/schools/${schoolId}/students/${studentId}/fees`),
  getStudentDocuments: (schoolId: string, studentId: string) => api.get<any[]>(`/api/schools/${schoolId}/students/${studentId}/documents`),
  
  createStudent: (schoolId: string, data: { userData: any; studentData: any }) =>
    api.post(`/api/schools/${schoolId}/students`, data),
  
  getTeachers: (schoolId: string) => api.get<any[]>(`/api/schools/${schoolId}/teachers`),
  
  createTeacher: (schoolId: string, data: { userData: any; teacherData: any }) =>
    api.post(`/api/schools/${schoolId}/teachers`, data),
  
  getClasses: (schoolId: string) => api.get<any[]>(`/api/schools/${schoolId}/classes`),
  
  createClass: (schoolId: string, classData: any) =>
    api.post(`/api/schools/${schoolId}/classes`, classData),
  
  getEvents: (schoolId: string) => api.get<any[]>(`/api/schools/${schoolId}/events`),
  
  createEvent: (schoolId: string, event: any) =>
    api.post(`/api/schools/${schoolId}/events`, event),
};

// Attendance API
export const attendanceApi = {
  getByClass: (classId: string, date?: string) => 
    api.get<any[]>(`/api/classes/${classId}/attendance${date ? `?date=${date}` : ""}`),
  
  mark: (classId: string, data: any) =>
    api.post(`/api/classes/${classId}/attendance`, data),
};

// Audit API
export const auditApi = {
  getLogs: () => api.get<any[]>("/api/audit-logs"),
};
