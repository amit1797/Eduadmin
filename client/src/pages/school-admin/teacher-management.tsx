import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schoolApi } from "@/lib/api";
import { routes } from "@/lib/routes";
import { useAuth } from "@/hooks/use-auth";
import { Search, Filter, Grid, Download, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "teachers"],
    queryFn: () => (user?.schoolId ? schoolApi.getTeachers(user.schoolId) : null),
    enabled: !!user?.schoolId,
  });
  
  // Normalize query result to an array to support both array and paginated object responses
  const teacherList: any[] = Array.isArray(teachers)
    ? teachers
    : (teachers as any)?.teachers ?? [];

  const departments: string[] = Array.from(
    new Set(
      teacherList
        .map((t: any) => t?.department)
        .filter((d: unknown): d is string => typeof d === "string" && d.length > 0)
    )
  );

  const filteredTeachers =
    teacherList.filter((t: any) => {
      const matchesSearch =
        !searchTerm ||
        t.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === "all" || t.department === selectedDept;
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    }) || [];

  if (teachersLoading) {
    return (
      <PageLayout
        title="Teacher Management"
        subtitle="Sunrise Public School"
        showAddButton
        addButtonText="Add Teacher"
        sidebar={{ userRole: user?.role || "", schoolId: user?.schoolId }}
      >
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Teacher Management"
      subtitle="Sunrise Public School"
      showAddButton
      addButtonText="Add Teacher"
      onAddClick={() => {
          /* TODO: Implement add teacher */
      }}
      sidebar={{ userRole: user?.role || "", schoolId: user?.schoolId }}
    >
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search teachers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-teachers"
                    />
                  </div>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-department">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" data-testid="button-import">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-grid-view">
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
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
                    {filteredTeachers.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50" data-testid={`teacher-row-${t.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" alt={`${t.user.firstName} ${t.user.lastName}`} />
                              <AvatarFallback>
                                {t.user.firstName[0]}
                                {t.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {t.user.firstName} {t.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{t.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t.department || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t.user.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={t.status === "active" ? "default" : "secondary"}
                            className={
                              t.status === "active"
                                ? "bg-green-100 text-green-800"
                                : t.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={user ? routes.schoolAdmin(user.schoolId).teacherDetails(t.id) : "#"}>
                              <span className="text-blue-600 hover:text-blue-900 cursor-pointer" data-testid={`button-view-${t.id}`}>
                                View
                              </span>
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900" data-testid={`button-edit-${t.id}`}>
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900" data-testid={`button-delete-${t.id}`}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No teachers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTeachers.length > 0 && (
                <div className="bg-white px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredTeachers.length)}</span> of <span className="font-medium">{filteredTeachers.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled data-testid="button-previous">
                        Previous
                      </Button>
                      <Button size="sm" className="bg-blue-600 text-white" data-testid="button-page-1">
                        1
                      </Button>
                      <Button variant="outline" size="sm" disabled data-testid="button-next">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PageLayout>
    );
  }
