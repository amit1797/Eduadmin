import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Users, Search, UserPlus, Edit, Trash2, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/Pagination";

export default function UsersManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/super-admin/users"],
    queryFn: () => superAdminApi.getUserManagement()
  });

  const { data: schools } = useQuery({
    queryKey: ["/api/super-admin/schools"],
    queryFn: () => superAdminApi.getSchools()
  });

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    // school_id is a string UUID; compare as string
    const matchesSchool = schoolFilter === "all" || user.school_id === schoolFilter;
    return matchesSearch && matchesRole && matchesSchool;
  }) || [];

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, schoolFilter]);

  const startIdx = (page - 1) * pageSize;
  const pagedUsers = filteredUsers.slice(startIdx, startIdx + pageSize);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="User Management" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleStats = {
    total: users?.length || 0,
    admins: users?.filter((u: any) => u.role === "school_admin").length || 0,
    teachers: users?.filter((u: any) => u.role === "teacher").length || 0,
    students: users?.filter((u: any) => u.role === "student").length || 0,
    parents: users?.filter((u: any) => u.role === "parent").length || 0,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "school_admin": return "bg-blue-100 text-blue-800";
      case "sub_school_admin": return "bg-purple-100 text-purple-800";
      case "teacher": return "bg-green-100 text-green-800";
      case "student": return "bg-yellow-100 text-yellow-800";
      case "parent": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        title="User Management"
        showAddButton
        addButtonText="Add User"
        onAddClick={() => {/* TODO: Add user modal */}}
      />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{roleStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-blue-600">{roleStats.admins}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teachers</p>
                    <p className="text-2xl font-bold text-green-600">{roleStats.teachers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-yellow-600">{roleStats.students}</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Parents</p>
                    <p className="text-2xl font-bold text-orange-600">{roleStats.parents}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-role-filter">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="school_admin">School Admin</SelectItem>
                    <SelectItem value="sub_school_admin">Sub Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-school-filter">
                    <SelectValue placeholder="Filter by school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools?.map((school: any) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-user">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagedUsers.map((user: any) => {
                      const school = schools?.find((s: any) => s.id === user.school_id);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50" data-testid={`user-row-${user.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </span>
                              </div>
                              <Link href={`/super-admin/users/${user.id}`} className="ml-4 block">
                                <div className="text-sm font-medium text-blue-700 hover:underline">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {school?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={filteredUsers.length}
                    onPageChange={setPage}
                    onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}