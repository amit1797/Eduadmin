import { AuthService } from "./auth";
import { queryClient } from "./queryClient";
import { type LoginResponse, type AuthUser } from "./auth";

// Enhanced error types
export interface ApiError {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  statusCode: number;
}

class ApiClient {
  private baseURL = "";
  private retryAttempts = 3;
  private retryDelay = 1000;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = AuthService.getToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const defaultHeaders: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    } as Record<string, string>;

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    let lastError: Error;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, config);

        if (response.status === 401) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed && attempt < this.retryAttempts - 1) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${AuthService.getToken()}`
            };
            continue;
          }
          AuthService.clearAuth();
          queryClient.clear();
          window.location.href = "/login";
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Request failed",
            statusCode: response.status
          }));
          const apiError: ApiError = {
            message: errorData.message || "Request failed",
            code: errorData.code,
            errors: errorData.errors,
            statusCode: response.status
          };
          throw apiError;
        }

        if (response.status === 204) {
          // @ts-expect-error allow undefined for void endpoints
          return undefined;
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as ApiError).statusCode;
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 401) {
            throw error;
          }
        }
        if (attempt < this.retryAttempts - 1) {
          await new Promise(r => setTimeout(r, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError!;
  }

  // Helper for multipart/form-data without forcing JSON content-type
  postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      // Do not set Content-Type, browser will set boundary
    });
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = AuthService.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        AuthService.setAuthWithRefresh({ token: data.accessToken, user: data.user, refreshToken: data.refreshToken });
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
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

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();

// Onboarding Drafts API
export type OnboardingDraftDTO = {
  id: string;
  schoolCode: string | null;
  step: number | null;
  status: string;
  data: string | null; // JSON string
  files: string | null; // JSON string
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export const onboardingDraftsApi = {
  list: (params?: { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<OnboardingDraftDTO[]>(`/api/onboarding-drafts${query}`);
  },
  create: (payload: { schoolCode?: string; step?: number; data?: any; files?: any; expiresAt?: string }) =>
    api.post<OnboardingDraftDTO>("/api/onboarding-drafts", {
      ...payload,
      data: payload.data ? JSON.stringify(payload.data) : undefined,
      files: payload.files ? JSON.stringify(payload.files) : undefined,
    }),
  get: (id: string) => api.get<OnboardingDraftDTO>(`/api/onboarding-drafts/${id}`),
  patch: (id: string, patch: { schoolCode?: string; step?: number; status?: string; error?: string | null; data?: any; files?: any; expiresAt?: string }) =>
    api.patch<OnboardingDraftDTO>(`/api/onboarding-drafts/${id}`, {
      ...patch,
      ...(patch.data !== undefined ? { data: typeof patch.data === 'string' ? patch.data : JSON.stringify(patch.data) } : {}),
      ...(patch.files !== undefined ? { files: typeof patch.files === 'string' ? patch.files : JSON.stringify(patch.files) } : {}),
    }),
  finalize: (id: string) => api.post<{ draft: OnboardingDraftDTO; schoolId: string; invitedUserId?: string; inviteEmailSent?: boolean }>(`/api/onboarding-drafts/${id}/finalize`),
  archive: (id: string) => api.post<OnboardingDraftDTO>(`/api/onboarding-drafts/${id}/archive`),
};

// Auth API (enhanced)
export const authApi = {
  login: async (credentials: { email: string; password: string; schoolCode?: string }): Promise<LoginResponse & { refreshToken: string }> => {
    try {
      const response = await api.post<LoginResponse & { refreshToken: string }>("/api/auth/login", credentials);
      AuthService.setAuthWithRefresh(response);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as ApiError;
        if (apiError.statusCode === 429) throw new Error("Too many login attempts. Please try again later.");
        if (apiError.statusCode === 401) throw new Error("Invalid email or password.");
      }
      throw error;
    }
  },
  
  getMe: () => api.get<AuthUser>("/api/auth/me"),
  refreshToken: (refreshToken: string) => 
    api.post<LoginResponse & { refreshToken: string }>("/api/auth/refresh", { refreshToken }),
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      AuthService.clearAuth();
    }
  },

  setPassword: async (payload: { token: string; password: string }) => {
    const res = await api.post<LoginResponse & { refreshToken: string }>("/api/auth/set-password", payload);
    AuthService.setAuthWithRefresh(res);
    return res;
  },
};

// Super Admin API (enhanced)
export const superAdminApi = {
  getStats: () => api.get<{
    totalSchools: number;
    activeLicenses: number;
    monthlyRevenue: number;
    supportTickets: number;
  }>("/api/super-admin/stats"),
  
  // Keep simple array signature for existing UIs
  getSchools: () => api.get<any[]>("/api/super-admin/schools"),
  getSchool: (id: string) => api.get<any>(`/api/super-admin/schools/${id}`),
  // New paged variant if needed by new screens
  getSchoolsPaged: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<{ schools: any[]; total: number; page: number; totalPages: number }>(`/api/super-admin/schools${query}`);
  },
  
  createSchool: (school: any) => api.post("/api/super-admin/schools", school),
  
  updateSchool: (schoolId: string, data: any) => api.put(`/api/super-admin/schools/${schoolId}`, data),
  
  deleteSchool: (schoolId: string) => api.delete(`/api/super-admin/schools/${schoolId}`),
  
  onboardSchool: (data: any) => api.post("/api/super-admin/onboard-school", data),
  // legacy draft endpoint removed in favor of onboardingDraftsApi
  
  getUserManagement: () => api.get<any[]>("/api/super-admin/users"),
  getUser: (id: string) => api.get<any>(`/api/super-admin/users/${id}`),
  
  getAnalytics: () => api.get<any>("/api/super-admin/analytics"),
  
  getSubscriptions: () => api.get<any[]>("/api/super-admin/subscriptions"),
  
  getSettings: () => api.get<any>("/api/super-admin/settings"),
  
  updateSettings: (settings: any) => api.put("/api/super-admin/settings", settings),
};

// Uploads API
export const uploadApi = {
  presign: (data: { key: string; contentType: string; expiresInSeconds?: number }) =>
    api.post<{ uploadUrl: string; key: string; publicUrl: string }>("/api/uploads/presign", data),
  local: (fd: FormData) => api.postForm<{ publicUrl: string }>("/api/uploads/local", fd),
};

// School API (enhanced)
export const schoolApi = {
  getStats: (schoolId: string) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.get<{
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      todayAttendance: number;
    }>(`/api/schools/${schoolId}/stats`);
  },
  
  getStudents: (schoolId: string, params?: { page?: number; limit?: number; search?: string }) => {
    if (!schoolId) throw new Error("School ID is required");
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<any[]>(`/api/schools/${schoolId}/students${query}`);
  },
  
  getStudent: (schoolId: string, studentId: string) => {
    if (!schoolId || !studentId) throw new Error("School ID and Student ID are required");
    return api.get<any>(`/api/schools/${schoolId}/students/${studentId}`);
  },
  
  createStudent: (schoolId: string, data: { userData: any; studentData: any }) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.post(`/api/schools/${schoolId}/students`, data);
  },
  
  updateStudent: (schoolId: string, studentId: string, data: any) => {
    if (!schoolId || !studentId) throw new Error("School ID and Student ID are required");
    return api.put(`/api/schools/${schoolId}/students/${studentId}`, data);
  },
  
  deleteStudent: (schoolId: string, studentId: string) => {
    if (!schoolId || !studentId) throw new Error("School ID and Student ID are required");
    return api.delete(`/api/schools/${schoolId}/students/${studentId}`);
  },
  
  getTeachers: (schoolId: string, params?: { page?: number; limit?: number; search?: string }) => {
    if (!schoolId) throw new Error("School ID is required");
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<any[]>(`/api/schools/${schoolId}/teachers${query}`);
  },
  
  getTeacher: (schoolId: string, teacherId: string) => {
    if (!schoolId || !teacherId) throw new Error("School ID and Teacher ID are required");
    return api.get<any>(`/api/schools/${schoolId}/teachers/${teacherId}`);
  },
  
  createTeacher: (schoolId: string, data: { userData: any; teacherData: any }) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.post(`/api/schools/${schoolId}/teachers`, data);
  },
  
  updateTeacher: (schoolId: string, teacherId: string, data: any) => {
    if (!schoolId || !teacherId) throw new Error("School ID and Teacher ID are required");
    return api.put(`/api/schools/${schoolId}/teachers/${teacherId}`, data);
  },
  
  deleteTeacher: (schoolId: string, teacherId: string) => {
    if (!schoolId || !teacherId) throw new Error("School ID and Teacher ID are required");
    return api.delete(`/api/schools/${schoolId}/teachers/${teacherId}`);
  },
  
  getClasses: (schoolId: string) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.get<any[]>(`/api/schools/${schoolId}/classes`);
  },
  
  getClass: (schoolId: string, classId: string) => {
    if (!schoolId || !classId) throw new Error("School ID and Class ID are required");
    return api.get<any>(`/api/schools/${schoolId}/classes/${classId}`);
  },
  
  createClass: (schoolId: string, classData: any) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.post(`/api/schools/${schoolId}/classes`, classData);
  },
  
  updateClass: (schoolId: string, classId: string, data: any) => {
    if (!schoolId || !classId) throw new Error("School ID and Class ID are required");
    return api.put(`/api/schools/${schoolId}/classes/${classId}`, data);
  },
  
  deleteClass: (schoolId: string, classId: string) => {
    if (!schoolId || !classId) throw new Error("School ID and Class ID are required");
    return api.delete(`/api/schools/${schoolId}/classes/${classId}`);
  },
  
  getEvents: (schoolId: string) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.get<any[]>(`/api/schools/${schoolId}/events`);
  },
  
  createEvent: (schoolId: string, event: any) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.post(`/api/schools/${schoolId}/events`, event);
  },
  
  getEvent: (schoolId: string, eventId: string) => {
    if (!schoolId || !eventId) throw new Error("School ID and Event ID are required");
    return api.get<any>(`/api/schools/${schoolId}/events/${eventId}`);
  },
  
  updateEvent: (schoolId: string, eventId: string, data: any) => {
    if (!schoolId || !eventId) throw new Error("School ID and Event ID are required");
    return api.put(`/api/schools/${schoolId}/events/${eventId}`, data);
  },
  
  deleteEvent: (schoolId: string, eventId: string) => {
    if (!schoolId || !eventId) throw new Error("School ID and Event ID are required");
    return api.delete(`/api/schools/${schoolId}/events/${eventId}`);
  },
  
  // Subjects CRUD
  getSubjects: (schoolId: string) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.get<any[]>(`/api/schools/${schoolId}/subjects`);
  },
  createSubject: (schoolId: string, data: any) => {
    if (!schoolId) throw new Error("School ID is required");
    return api.post(`/api/schools/${schoolId}/subjects`, data);
  },
  updateSubject: (schoolId: string, id: string, data: any) => {
    if (!schoolId || !id) throw new Error("School ID and Subject ID are required");
    return api.put(`/api/schools/${schoolId}/subjects/${id}`, data);
  },
  deleteSubject: (schoolId: string, id: string) => {
    if (!schoolId || !id) throw new Error("School ID and Subject ID are required");
    return api.delete(`/api/schools/${schoolId}/subjects/${id}`);
  },
};

// Attendance API (enhanced)
export const attendanceApi = {
  getByClass: (classId: string, date?: string) => 
    api.get<any[]>(`/api/classes/${classId}/attendance${date ? `?date=${date}` : ""}`),
  
  mark: (classId: string, data: any) =>
    api.post(`/api/classes/${classId}/attendance`, data),
  
  getStudentAttendance: (schoolId: string, studentId: string, params?: { startDate?: string; endDate?: string }) => {
    if (!schoolId || !studentId) throw new Error("School ID and Student ID are required");
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<any>(`/api/schools/${schoolId}/students/${studentId}/attendance${query}`);
  },
};

// Audit API (enhanced)
export const auditApi = {
  getLogs: (params?: { 
    page?: number; 
    limit?: number; 
    userId?: string; 
    action?: string; 
    resource?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.userId) queryParams.set('userId', params.userId);
    if (params?.action) queryParams.set('action', params.action);
    if (params?.resource) queryParams.set('resource', params.resource);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<any[]>(`/api/audit-logs${query}`);
  },
};
