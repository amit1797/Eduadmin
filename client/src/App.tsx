import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import SetPasswordPage from "@/pages/invite/set-password";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import SuperAdminSchools from "@/pages/super-admin/schools";
import SuperAdminUsers from "@/pages/super-admin/users";
import SuperAdminUserDetails from "@/pages/super-admin/user-details";
import SuperAdminAnalytics from "@/pages/super-admin/analytics";
import SuperAdminSubscriptions from "@/pages/super-admin/subscriptions";
import SuperAdminSettings from "@/pages/super-admin/settings";
import SuperAdminSchoolDetails from "@/pages/super-admin/school-details";
import Profile from "@/pages/school-admin/profile";
import SettingsPage from "@/pages/school-admin/settings";
import SuperAdminSchoolOnboarding from "@/pages/super-admin/school-onboarding";
import SchoolAdminDashboard from "@/pages/school-admin/dashboard";
import TeacherDashboard from "@/pages/teacher/dashboard";
import StudentManagement from "@/pages/school-admin/student-management";
import StudentDetails from "@/pages/school-admin/student-details";
import TeacherManagement from "@/pages/school-admin/teacher-management";
import TeacherDetails from "@/pages/school-admin/teacher-details";
import ClassManagement from "@/pages/school-admin/class-management";
import ClassDetails from "@/pages/school-admin/class-details";
import AdminAttendance from "@/pages/school-admin/attendance";
import AdminAcademics from "@/pages/school-admin/academics";
import AdminEvents from "@/pages/school-admin/events";
import AdminAccounts from "@/pages/school-admin/accounts";
import AdminTeacherAttendance from "@/pages/school-admin/attendance-teachers";
import AdminAttendanceIndex from "@/pages/school-admin/attendance-index";
import AdminAttendanceStudentsReports from "@/pages/school-admin/attendance-students-reports";
import AdminAttendanceTeachersReports from "@/pages/school-admin/attendance-teachers-reports";
import { routes } from "@/lib/routes";
import SuperAdminAudit from "@/pages/super-admin/audit";

function ProtectedRoute({ 
  children, 
  roles, 
  redirectTo = "/login" 
}: { 
  children: React.ReactNode; 
  roles?: string[]; 
  redirectTo?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public invite route */}
      <Route path="/invite/set-password">
        <SetPasswordPage />
      </Route>

      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>

      {/* Generic user pages */}
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/">
        <ProtectedRoute>
          {(() => {
            const target = routes.dashboardFor(user ?? undefined);
            if (target === "/") return <div>Welcome to EduManage Pro</div>;
            return <Redirect to={target} />;
          })()}
        </ProtectedRoute>
      </Route>

      {/* Super Admin Routes */}
      <Route path="/super-admin/dashboard">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/schools">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminSchools />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/schools/:schoolId">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminSchoolDetails />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/users">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminUsers />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/users/:userId">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminUserDetails />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/analytics">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminAnalytics />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/subscriptions">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminSubscriptions />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/settings">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminSettings />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/audit">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminAudit />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/onboarding">
        <ProtectedRoute roles={["super_admin"]}>
          <Redirect to="/super-admin/school-onboarding" />
        </ProtectedRoute>
      </Route>

      <Route path="/super-admin/school-onboarding">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminSchoolOnboarding />
        </ProtectedRoute>
      </Route>

      {/* School Admin Routes (new dynamic) */}
      <Route path="/:schoolId/admin/dashboard">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <SchoolAdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/:schoolId/admin/students">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <StudentManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/:schoolId/admin/students/:studentId">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <StudentDetails />
        </ProtectedRoute>
      </Route>

      <Route path="/:schoolId/admin/teachers">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <TeacherManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/:schoolId/admin/teachers/:teacherId">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <TeacherDetails />
        </ProtectedRoute>
      </Route>

      {/* Classes Management */}
      <Route path="/:schoolId/admin/classes">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <ClassManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/:schoolId/admin/classes/:classId">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          <ClassDetails />
        </ProtectedRoute>
      </Route>

      {/* Attendance - Students (default) */}
      <Route path="/:schoolId/admin/attendance/students">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAttendance />
        </ProtectedRoute>
      </Route>

      {/* Attendance - Students Reports */}
      <Route path="/:schoolId/admin/attendance/students/reports">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAttendanceStudentsReports />
        </ProtectedRoute>
      </Route>

      {/* Attendance - Teachers */}
      <Route path="/:schoolId/admin/attendance/teachers">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminTeacherAttendance />
        </ProtectedRoute>
      </Route>

      {/* Attendance - Teachers Reports */}
      <Route path="/:schoolId/admin/attendance/teachers/reports">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAttendanceTeachersReports />
        </ProtectedRoute>
      </Route>

      {/* Attendance index */}
      <Route path="/:schoolId/admin/attendance">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAttendanceIndex />
        </ProtectedRoute>
      </Route>

      {/* Academics */}
      <Route path="/:schoolId/admin/academics">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAcademics />
        </ProtectedRoute>
      </Route>

      {/* Events */}
      <Route path="/:schoolId/admin/events">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminEvents />
        </ProtectedRoute>
      </Route>

      {/* Accounts */}
      <Route path="/:schoolId/admin/accounts">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          <AdminAccounts />
        </ProtectedRoute>
      </Route>

      {/* Legacy paths -> redirect to new scheme */}
      <Route path="/school-admin/dashboard">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          {user ? <Redirect to={routes.dashboardFor(user)} /> : <Redirect to="/login" />}
        </ProtectedRoute>
      </Route>
      <Route path="/students">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          {user ? <Redirect to={routes.schoolAdmin(user.schoolId).students} /> : <Redirect to="/login" />}
        </ProtectedRoute>
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard">
        <ProtectedRoute roles={["teacher"]}>
          <TeacherDashboard />
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
