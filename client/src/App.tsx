import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import SuperAdminSchools from "@/pages/super-admin/schools";
import SuperAdminUsers from "@/pages/super-admin/users";
import SuperAdminAnalytics from "@/pages/super-admin/analytics";
import SuperAdminSubscriptions from "@/pages/super-admin/subscriptions";
import SuperAdminSettings from "@/pages/super-admin/settings";
import SuperAdminOnboarding from "@/pages/super-admin/onboarding";
import SuperAdminSchoolOnboarding from "@/pages/super-admin/school-onboarding";
import SchoolAdminDashboard from "@/pages/school-admin/dashboard";
import TeacherDashboard from "@/pages/teacher/dashboard";
import StudentManagement from "@/pages/student-management";
import StudentDetails from "@/pages/student-details";

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
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>

      <Route path="/">
        <ProtectedRoute>
          {(() => {
            switch (user?.role) {
              case "super_admin":
                return <Redirect to="/super-admin/dashboard" />;
              case "school_admin":
              case "sub_school_admin":
                return <Redirect to={`/${user?.schoolId}/admin/dashboard`} />;
              case "teacher":
                return <Redirect to="/teacher/dashboard" />;
              case "student":
                return <Redirect to="/student/dashboard" />;
              default:
                return <div>Welcome to EduManage Pro</div>;
            }
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

      <Route path="/super-admin/users">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminUsers />
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

      <Route path="/super-admin/onboarding">
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminOnboarding />
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

      {/* Legacy paths -> redirect to new scheme */}
      <Route path="/school-admin/dashboard">
        <ProtectedRoute roles={["school_admin", "sub_school_admin"]}>
          {user ? <Redirect to={`/${user.schoolId}/admin/dashboard`} /> : <Redirect to="/login" />}
        </ProtectedRoute>
      </Route>
      <Route path="/students">
        <ProtectedRoute roles={["school_admin", "sub_school_admin", "teacher"]}>
          {user ? <Redirect to={`/${user.schoolId}/admin/students`} /> : <Redirect to="/login" />}
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
