// Centralized route builders to keep navigation consistent across the app
import type { AuthUser } from "@/lib/auth";

export const routes = {
  // Generic
  profile: () => "/profile",
  settings: () => "/settings",

  // Dashboards by role
  dashboardFor: (user?: Pick<AuthUser, "role" | "schoolId">) => {
    switch (user?.role) {
      case "super_admin":
        return "/super-admin/dashboard";
      case "school_admin":
      case "sub_school_admin":
        return user?.schoolId ? `/${user.schoolId}/admin/dashboard` : "/school-admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  },

  // School Admin namespace
  schoolAdmin: (schoolId: string | undefined) => ({
    root: schoolId ? `/${schoolId}/admin` : "/school-admin",
    students: schoolId ? `/${schoolId}/admin/students` : "/school-admin/students",
    studentDetails: (studentId: string) => (schoolId ? `/${schoolId}/admin/students/${studentId}` : `/school-admin/students/${studentId}`),
    teachers: schoolId ? `/${schoolId}/admin/teachers` : "/school-admin/teachers",
    teacherDetails: (teacherId: string) => (schoolId ? `/${schoolId}/admin/teachers/${teacherId}` : `/school-admin/teachers/${teacherId}`),
    classes: schoolId ? `/${schoolId}/admin/classes` : "/school-admin/classes",
    classDetails: (classId: string) => (schoolId ? `/${schoolId}/admin/classes/${classId}` : `/school-admin/classes/${classId}`),
    attendance: schoolId ? `/${schoolId}/admin/attendance` : "/school-admin/attendance",
    attendanceStudents: schoolId ? `/${schoolId}/admin/attendance/students` : "/school-admin/attendance/students",
    attendanceTeachers: schoolId ? `/${schoolId}/admin/attendance/teachers` : "/school-admin/attendance/teachers",
    academics: schoolId ? `/${schoolId}/admin/academics` : "/school-admin/academics",
    events: schoolId ? `/${schoolId}/admin/events` : "/school-admin/events",
    accounts: schoolId ? `/${schoolId}/admin/accounts` : "/school-admin/accounts",
  }),
};
