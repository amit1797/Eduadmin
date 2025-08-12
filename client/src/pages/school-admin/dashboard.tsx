import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { schoolApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "stats"],
    queryFn: () => user?.schoolId ? schoolApi.getStats(user.schoolId) : null,
    enabled: !!user?.schoolId
  });

  const recentActivities = [
    {
      id: 1,
      description: "New student enrollment - John Smith",
      timestamp: "2 hours ago",
      type: "student"
    },
    {
      id: 2,
      description: "Teacher assigned - Mrs. Johnson to Grade 5A",
      timestamp: "4 hours ago",
      type: "teacher"
    },
    {
      id: 3,
      description: "Event created - Science Fair 2024",
      timestamp: "1 day ago",
      type: "event"
    }
  ];

  const quickActions = [
    { label: "Add Student", icon: Users },
    { label: "Add Teacher", icon: GraduationCap },
    { label: "Create Class", icon: BookOpen },
    { label: "Schedule Event", icon: Calendar }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="School Dashboard" subtitle="School Admin Dashboard" />
        <div className="flex">
          <Sidebar userRole="school_admin" schoolId={user?.schoolId} />
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="School Dashboard" subtitle="School Admin Dashboard" />
      
      <div className="flex">
        <Sidebar userRole="school_admin" schoolId={user?.schoolId} />
        
        <div className="flex-1 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={Users}
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Total Teachers"
              value={stats?.totalTeachers || 0}
              icon={GraduationCap}
              iconColor="text-green-600"
            />
            <StatsCard
              title="Total Classes"
              value={stats?.totalClasses || 0}
              icon={BookOpen}
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Today's Attendance"
              value={`${stats?.todayAttendance || 0}%`}
              icon={Calendar}
              iconColor="text-yellow-600"
            />
          </div>

          {/* Recent Activities and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900" data-testid={`activity-${activity.id}`}>
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="flex flex-col items-center p-4 h-auto hover:border-blue-600 hover:bg-blue-50"
                      data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <action.icon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {action.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
