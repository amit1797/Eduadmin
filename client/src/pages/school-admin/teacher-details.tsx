import { useRoute } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi } from "@/lib/api";
import { Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap } from "lucide-react";

export default function TeacherDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/:schoolId/admin/teachers/:teacherId");
  const schoolId = params?.schoolId || user?.schoolId;
  const teacherId = params?.teacherId;

  const { data: teacher, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "teachers", teacherId],
    queryFn: () => (schoolId && teacherId ? schoolApi.getTeacher(schoolId, teacherId) : Promise.resolve(null)),
    enabled: !!schoolId && !!teacherId,
  });

  // Tabs state (must be declared before any early returns)
  const [activeTab, setActiveTab] = useState<string>("overview");
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    classes: "Classes",
    documents: "Documents",
  };

  if (isLoading) {
    return (
      <PageLayout title="Teacher Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
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
      </PageLayout>
    );
  }

  if (!teacher) {
    return (
      <PageLayout title="Teacher Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-10 text-center text-gray-500">Teacher not found.</CardContent>
        </Card>
      </PageLayout>
    );
  }

  const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
  const dept = teacher.department || "-";
  const experience = teacher.experience ?? 0;
  const qualification = teacher.qualification || "-";
  const specialization = teacher.specialization || "-";
  const joiningDate = (teacher.joiningDate && new Date(teacher.joiningDate).toISOString().slice(0,10)) || "-";

  return (
    <PageLayout
      title="Teacher Profile"
      subtitle="Sunrise Public School"
      sidebar={{ userRole: user?.role || "", schoolId }}
      breadcrumbs={{
        labelMap: teacherId ? { [teacherId]: fullName } : undefined,
        extra: [{ label: tabLabels[activeTab] }],
      }}
    >
      <div className="space-y-6">

          {/* Header Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={fullName} />
                  <AvatarFallback>
                    {teacher.user.firstName[0]}
                    {teacher.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{fullName}</div>
                      <div className="text-sm text-gray-500">
                        Employee ID: {teacher.employeeId} | Department: {dept}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">{teacher.status || "Active"}</Badge>
                      <Button variant="secondary" size="sm">Edit Profile</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span>{teacher.user.email}</span></div>
                    <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>{teacher.user.phone || "+1 234-567-8901"}</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>Joining: {joiningDate}</span></div>
                    <div className="flex items-center space-x-2"><Briefcase className="w-4 h-4 text-gray-400" /><span>Experience: {experience} yrs</span></div>
                    <div className="flex items-center space-x-2"><GraduationCap className="w-4 h-4 text-gray-400" /><span>Qualification: {qualification}</span></div>
                    <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-400" /><span>Specialization: {specialization}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoTile title="Department" value={dept} />
                    <InfoTile title="Experience" value={`${experience} years`} />
                    <InfoTile title="Qualification" value={qualification} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab (placeholder) */}
            <TabsContent value="classes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Classes & Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab (placeholder) */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Teacher Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </PageLayout>
  );
}

function InfoTile({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className="rounded-md border p-4 bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`text-base font-medium mt-1 ${accent || ""}`}>{value}</div>
    </div>
  );
}
