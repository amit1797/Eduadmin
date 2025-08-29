import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi } from "@/lib/api";
import { routes } from "@/lib/routes";
import { Search, Filter, Grid, Download, Upload } from "lucide-react";

export default function ClassManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: classes, isLoading } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "classes"],
    queryFn: () => (user?.schoolId ? schoolApi.getClasses(user.schoolId) : null),
    enabled: !!user?.schoolId,
  });

  const grades = useMemo(
    () => Array.from(new Set((classes || []).map((c: any) => c.grade).filter(Boolean))),
    [classes]
  );

  const filtered = useMemo(() => {
    return (
      classes?.filter((c: any) => {
        const matchesSearch =
          !searchTerm ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.section || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGrade = selectedGrade === "all" || c.grade === selectedGrade;
        const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
        return matchesSearch && matchesGrade && matchesStatus;
      }) || []
    );
  }, [classes, searchTerm, selectedGrade, selectedStatus]);

  if (isLoading) {
    return (
      <PageLayout
        title="Classes"
        subtitle="Sunrise Public School"
        showAddButton
        addButtonText="Add Class"
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
      title="Classes"
      subtitle="Sunrise Public School"
      showAddButton
      addButtonText="Add Class"
      onAddClick={() => {
          /* TODO: implement add class */
      }}
      sidebar={{ userRole: user?.role || "", schoolId: user?.schoolId }}
    >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {grades.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Classes ({filtered.length})</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.section || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.academicYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={user ? routes.schoolAdmin(user.schoolId).classDetails(c.id) : "#"}>
                              <span className="text-blue-600 hover:text-blue-900 cursor-pointer">View</span>
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No classes found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
    </PageLayout>
  );
}
