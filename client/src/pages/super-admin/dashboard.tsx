import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Building2, CheckCircle, DollarSign, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/super-admin/stats"],
    queryFn: () => superAdminApi.getStats()
  });

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ["/api/super-admin/schools"],
    queryFn: () => superAdminApi.getSchools()
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="EduManage Pro" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
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
      <Navbar 
        title="EduManage Pro"
        showAddButton
        addButtonText="Add School"
        onAddClick={() => {/* TODO: Implement add school */}}
      />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Schools"
              value={stats?.totalSchools || 0}
              icon={Building2}
              iconColor="text-blue-600"
              trend={{ value: "+12% from last month", isPositive: true }}
            />
            <StatsCard
              title="Active Licenses"
              value={stats?.activeLicenses || 0}
              icon={CheckCircle}
              iconColor="text-green-600"
              trend={{ value: "+8% from last month", isPositive: true }}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`$${stats?.monthlyRevenue?.toLocaleString() || 0}`}
              icon={DollarSign}
              iconColor="text-yellow-600"
              trend={{ value: "+15% from last month", isPositive: true }}
            />
            <StatsCard
              title="Support Tickets"
              value={stats?.supportTickets || 0}
              icon={AlertCircle}
              iconColor="text-red-600"
              trend={{ value: "-3 from yesterday", isPositive: true }}
            />
          </div>

          {/* Schools Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Schools</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-school">
                  Add School
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          School
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools?.map((school: any) => (
                        <tr key={school.id} className="hover:bg-gray-50" data-testid={`school-row-${school.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {school.name?.substring(0, 2)?.toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {school.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {school.code}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {school.address || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={school.status === "active" ? "default" : "secondary"}
                              className={school.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            >
                              {school.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900" data-testid={`button-view-${school.id}`}>
                                View
                              </button>
                              <button className="text-gray-600 hover:text-gray-900" data-testid={`button-edit-${school.id}`}>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!schools || schools.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No schools found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
