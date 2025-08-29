import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { schoolApi, auditApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Users, GraduationCap, BookOpen, Calendar, BarChart2, PieChart, Activity, CalendarX, TrendingUp, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/routes";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    attendance: "Attendance",
    performance: "Performance",
    enrollment: "Enrollment",
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "stats"],
    queryFn: () => user?.schoolId ? schoolApi.getStats(user.schoolId) : null,
    enabled: !!user?.schoolId
  });

  const { data: events } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "events"],
    queryFn: () => (user?.schoolId ? schoolApi.getEvents(user.schoolId) : Promise.resolve([] as any[])),
    enabled: !!user?.schoolId
  });

  const { data: audit } = useQuery({
    queryKey: ["/api/audit-logs", "limit=5"],
    queryFn: () => auditApi.getLogs({ limit: 5 }),
  });

  const recentActivities = ((audit as any[]) || []).map((log: any, idx: number) => ({
    id: log.id || idx,
    description: log.message || `${log.action || "Activity"} on ${log.resource || "system"}`,
    timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : "",
    type: log.resource || "log"
  }));

  const quickActions = [
    { label: "Add Student", icon: Users },
    { label: "Add Teacher", icon: GraduationCap },
    { label: "Create Class", icon: BookOpen },
    { label: "Schedule Event", icon: Calendar }
  ];

  if (statsLoading) {
    return (
      <PageLayout
        title="School Dashboard"
        subtitle="School Admin Dashboard"
        sidebar={{ userRole: "school_admin", schoolId: user?.schoolId }}
        breadcrumbs={{ extra: [{ label: tabLabels[activeTab] }] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="School Dashboard"
      subtitle="School Admin Dashboard"
      sidebar={{ userRole: "school_admin", schoolId: user?.schoolId }}
      breadcrumbs={{ extra: [{ label: tabLabels[activeTab] }] }}
    >
          {/* Quick Stats (outside tabs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents || 0} 
              icon={Users} 
              iconColor="text-blue-600"
              href={routes.schoolAdmin(user?.schoolId).students}
            />
            <StatsCard 
              title="Total Teachers" 
              value={stats?.totalTeachers || 0} 
              icon={GraduationCap} 
              iconColor="text-green-600"
              href={routes.schoolAdmin(user?.schoolId).teachers}
            />
            <StatsCard 
              title="Total Classes" 
              value={stats?.totalClasses || 0} 
              icon={BookOpen} 
              iconColor="text-purple-600"
              href={routes.schoolAdmin(user?.schoolId).classes}
            />
            <StatsCard 
              title="Today's Attendance" 
              value={`${stats?.todayAttendance || 0}%`} 
              icon={Calendar} 
              iconColor="text-yellow-600"
              href={routes.schoolAdmin(user?.schoolId).attendance}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-blue-50 text-blue-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="enrollment"
                className="data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200"
              >
                Enrollment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Attendance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                      <BarChart2 className="h-8 w-8 text-blue-600" />
                      <span>No attendance data available</span>
                    </div>
                  </CardContent>
                </Card>
                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                      <PieChart className="h-8 w-8 text-blue-600" />
                      <span>No gender distribution data available</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities and Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivities.length === 0 ? (
                      <div className="h-24 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-6 w-6 text-blue-600" />
                        <span>No recent activities</span>
                      </div>
                    ) : (
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
                              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!events || events.length === 0 ? (
                      <div className="h-24 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CalendarX className="h-6 w-6 text-blue-600" />
                        <span>No upcoming events</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events.map((ev: any) => (
                          <div key={ev.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ev.title || ev.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {ev.date ? new Date(ev.date).toLocaleString() : ""}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <BarChart2 className="h-8 w-8 text-blue-600" />
                    <span>Attendance analytics coming soon</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <span>Performance analytics coming soon</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enrollment">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                    <span>Enrollment analytics coming soon</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </PageLayout>
  );
}
