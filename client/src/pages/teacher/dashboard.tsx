import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, FileText, Award } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const todaysSchedule = [
    {
      id: 1,
      subject: "Mathematics - Algebra II",
      class: "Grade 10A • Room 201",
      time: "9:00 - 9:50 AM",
      students: 28,
      status: "current"
    },
    {
      id: 2,
      subject: "Mathematics - Geometry",
      class: "Grade 9B • Room 201",
      time: "10:00 - 10:50 AM",
      students: 25,
      status: "upcoming"
    },
    {
      id: 3,
      subject: "Break Time",
      class: "Teachers' Lounge",
      time: "10:50 - 11:10 AM",
      students: 0,
      status: "break"
    }
  ];

  const quickStats = {
    totalClasses: 6,
    totalStudents: 162,
    pendingAssignments: 12,
    avgAttendance: 92
  };

  const recentActivities = [
    {
      id: 1,
      description: 'Assignment graded: "Quadratic Equations" for Grade 10A',
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      description: "Attendance marked for Grade 9B - 23 out of 25 present",
      timestamp: "3 hours ago",
      status: "recorded"
    }
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: ClipboardCheck },
    { label: "Create Assignment", icon: FileText },
    { label: "Enter Grades", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        title="Teacher Dashboard" 
        subtitle="Mathematics Department"
      />
      
      <div className="flex">
        <Sidebar userRole="teacher" schoolId={user?.schoolId} />
        
        <div className="flex-1 p-6">
          {/* Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <p className="text-sm text-gray-500">Monday, March 18, 2024</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysSchedule.map((schedule) => (
                      <div 
                        key={schedule.id}
                        className={`flex items-center p-4 border rounded-lg ${
                          schedule.status === "break" ? "bg-gray-50" : ""
                        }`}
                        data-testid={`schedule-${schedule.id}`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            schedule.status === "current" ? "bg-blue-600" :
                            schedule.status === "upcoming" ? "bg-green-500" :
                            "bg-gray-400"
                          }`}></div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                schedule.status === "break" ? "text-gray-500" : "text-gray-900"
                              }`}>
                                {schedule.subject}
                              </p>
                              <p className={`text-sm ${
                                schedule.status === "break" ? "text-gray-400" : "text-gray-500"
                              }`}>
                                {schedule.class}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                schedule.status === "break" ? "text-gray-500" : "text-gray-900"
                              }`}>
                                {schedule.time}
                              </p>
                              {schedule.students > 0 && (
                                <p className="text-sm text-gray-500">
                                  {schedule.students} students
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats and Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Classes</span>
                      <span className="text-lg font-semibold text-gray-900" data-testid="stat-total-classes">
                        {quickStats.totalClasses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="text-lg font-semibold text-gray-900" data-testid="stat-total-students">
                        {quickStats.totalStudents}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Assignments</span>
                      <span className="text-lg font-semibold text-red-600" data-testid="stat-pending-assignments">
                        {quickStats.pendingAssignments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Attendance</span>
                      <span className="text-lg font-semibold text-green-600" data-testid="stat-avg-attendance">
                        {quickStats.avgAttendance}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        className="w-full flex items-center justify-start px-4 py-3 hover:border-blue-600 hover:bg-blue-50"
                        data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <action.icon className="w-5 h-5 text-blue-600 mr-3" />
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

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900" data-testid={`activity-${activity.id}`}>
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="secondary"
                        className={
                          activity.status === "completed" ? "bg-green-100 text-green-800" :
                          activity.status === "recorded" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
