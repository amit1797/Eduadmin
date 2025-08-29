import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { superAdminApi } from "@/lib/api";
import { Mail, Phone, Shield, Building2 } from "lucide-react";

export default function SuperAdminUserDetails() {
  const [, params] = useRoute("/super-admin/users/:userId");
  const userId = params?.userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/super-admin/users", userId],
    queryFn: () => (userId ? superAdminApi.getUser(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });

  const { data: school } = useQuery({
    queryKey: ["/api/super-admin/schools", user?.school_id],
    queryFn: () => (user?.school_id ? superAdminApi.getSchool(user.school_id) : Promise.resolve(null as any)),
    enabled: !!user?.school_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="User Profile" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="User Profile" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6">
            <Card>
              <CardContent className="p-10 text-center text-gray-500">User not found.</CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || user.email;
  const initials = `${(user.first_name || user.username || "U").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();

  const roleBadge = (() => {
    switch (user.role) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "school_admin": return "bg-blue-100 text-blue-800";
      case "sub_school_admin": return "bg-purple-100 text-purple-800";
      case "teacher": return "bg-green-100 text-green-800";
      case "student": return "bg-yellow-100 text-yellow-800";
      case "parent": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="User Profile" />
      <div className="flex">
        <Sidebar userRole="super_admin" />
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">
                      <Badge className={roleBadge}>{String(user.role).replace("_", " ")}</Badge>
                      <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2"><Shield className="w-4 h-4 text-gray-400" /><span>Username: {user.username || "-"}</span></div>
                    <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span>{user.email}</span></div>
                    <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>{user.phone || "-"}</span></div>
                    <div className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-gray-400" /><span>School: {school?.name || user.school_id || "N/A"}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <InfoRow label="First Name" value={user.first_name || "-"} />
                  <InfoRow label="Last Name" value={user.last_name || "-"} />
                  <InfoRow label="Role" value={String(user.role).replace("_", " ")} />
                  <InfoRow label="Status" value={user.is_active ? "Active" : "Inactive"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Email" value={user.email || "-"} />
                  <InfoRow label="Phone" value={user.phone || "-"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <InfoRow label="School" value={school?.name || "N/A"} />
                  <InfoRow label="School ID" value={user.school_id || "-"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
