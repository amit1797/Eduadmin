import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { superAdminApi, schoolApi } from "@/lib/api";
import { modulesSchema } from "./school-onboarding/schemas";
import { Building2, Mail, Phone, MapPin, Users, GraduationCap, Calendar, Edit3, Settings, Layers3, ArrowLeft } from "lucide-react";

export default function SuperAdminSchoolDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/super-admin/schools/:schoolId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const schoolId = params?.schoolId as string | undefined;

  const { data: school, isLoading: isSchoolLoading, refetch: refetchSchool } = useQuery({
    queryKey: ["/api/super-admin/schools", schoolId],
    queryFn: () => (schoolId ? superAdminApi.getSchool(schoolId) : Promise.resolve(null)),
    enabled: !!schoolId,
  });

  

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "stats"],
    queryFn: () => (schoolId ? schoolApi.getStats(schoolId) : Promise.resolve(null)),
    enabled: !!schoolId,
  });

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modules form setup
  const coreModules = [
    { id: "student_management", name: "Student Management", description: "Manage student records, enrollment, and profiles" },
    { id: "teacher_management", name: "Teacher Management", description: "Manage teacher profiles, assignments, and schedules" },
    { id: "attendance_management", name: "Attendance Management", description: "Track student and staff attendance" },
    { id: "class_management", name: "Class Management", description: "Organize classes, sections, and subjects" },
    { id: "academic_management", name: "Academic Management", description: "Manage curriculum, grades, and academic records" },
    { id: "test_result_management", name: "Test & Result Management", description: "Create tests, exams, and manage results" },
  ];

  const optionalModules = [
    { id: "library_management", name: "Library Management", description: "Manage library books, issues, and returns" },
    { id: "transport_management", name: "Transport Management", description: "Manage school buses, routes, and drivers" },
    { id: "payroll_management", name: "Payroll Management", description: "Manage staff salaries and payroll" },
    { id: "event_management", name: "Event Management", description: "Organize school events and activities" },
    { id: "accounts_management", name: "Accounts Management", description: "Manage school finances and accounting" },
    { id: "notification_system", name: "Notification System", description: "Send notifications to students and parents" },
    { id: "audit_management", name: "Audit Management", description: "Track system activities and audit logs" },
    { id: "branch_management", name: "Branch Management", description: "Manage multiple school branches" },
  ];

  const modulesForm = useForm<z.infer<typeof modulesSchema>>({
    resolver: zodResolver(modulesSchema),
    defaultValues: {
      coreModules: ["student_management", "attendance_management"],
      optionalModules: [],
    },
  });

  // Watch arrays after form is created
  const watchedCore = (useWatch({ control: modulesForm.control, name: "coreModules" }) || []) as string[];
  const watchedOptional = (useWatch({ control: modulesForm.control, name: "optionalModules" }) || []) as string[];

  // When school data loads, reset form values from school.modules
  useEffect(() => {
    const coreRaw = (school as any)?.modules?.coreModules ?? ["student_management", "attendance_management"];
    const optionalRaw = (school as any)?.modules?.optionalModules ?? [];
    const core = Array.isArray(coreRaw) ? coreRaw : ["student_management", "attendance_management"];
    const optional = Array.isArray(optionalRaw) ? optionalRaw : [];
    modulesForm.reset({ coreModules: core, optionalModules: optional });
  }, [school]);

  const updateModulesMutation = useMutation({
    mutationFn: async (payload: z.infer<typeof modulesSchema>) => {
      if (!schoolId) throw new Error("School ID missing");
      return superAdminApi.updateSchool(schoolId, { modules: payload });
    },
    onSuccess: async () => {
      toast({ title: "Modules updated" });
      try { await refetchSchool(); } catch {}
    },
    onError: (err: any) => {
      toast({ title: "Failed to update modules", description: err?.message || "", variant: "destructive" });
    }
  });
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    people: "People",
    classes: "Classes",
    settings: "Settings",
  };

  if (isSchoolLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="School Details" />
        <div className="flex">
          <Sidebar userRole={user?.role || "super_admin"} />
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="School Details" />
        <div className="flex">
          <Sidebar userRole={user?.role || "super_admin"} />
          <div className="flex-1 p-6">
            <Card>
              <CardContent className="p-10 text-center text-gray-500">School not found.</CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const headerStats = {
    students: stats?.totalStudents ?? 0,
    teachers: stats?.totalTeachers ?? 0,
    classes: stats?.totalClasses ?? 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="School Details" />
      <div className="flex">
        <Sidebar userRole={user?.role || "super_admin"} />
        <div className="flex-1 p-6 space-y-6">
          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation("/super-admin/schools")}> 
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Schools
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={
                school.status === "active" ? "bg-green-100 text-green-800" :
                school.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }>
                {school.status}
              </Badge>
              <Button variant="secondary" size="sm"><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
            </div>
          </div>

          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {(school.name || "").substring(0,2).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-500">Code: {school.code}</div>
                    </div>
                    <div className="ml-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <InfoPill icon={<Mail className="h-4 w-4 text-gray-400" />} text={school.email || "-"} />
                      <InfoPill icon={<Phone className="h-4 w-4 text-gray-400" />} text={school.phone || "-"} />
                      <InfoPill icon={<MapPin className="h-4 w-4 text-gray-400" />} text={school.address || "-"} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{headerStats.students}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teachers</p>
                    <p className="text-2xl font-bold text-gray-900">{headerStats.teachers}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{headerStats.classes}</p>
                  </div>
                  <Layers3 className="h-8 w-8 text-violet-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoTile title="School Name" value={school.name || "-"} />
                    <InfoTile title="School Code" value={school.code || "-"} />
                    <InfoTile title="Status" value={school.status || "-"} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <InfoTile title="Email" value={school.email || "-"} />
                    <InfoTile title="Phone" value={school.phone || "-"} />
                    <InfoTile title="Address" value={school.address || "-"} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modules */}
            <TabsContent value="modules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Module Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...modulesForm}>
                    <form
                      onSubmit={modulesForm.handleSubmit((data) => updateModulesMutation.mutate(data))}
                      className="space-y-6"
                    >
                      <div>
                        <div className="text-sm font-medium mb-2">Core Modules</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {coreModules.map((module) => (
                            <FormField
                              key={module.id}
                              control={modulesForm.control}
                              name="coreModules"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={watchedCore.includes(module.id)}
                                      onCheckedChange={(checked) => {
                                        const isChecked = checked === true;
                                        const cur = modulesForm.getValues("coreModules") || [];
                                        const next = isChecked
                                          ? Array.from(new Set([...cur, module.id]))
                                          : cur.filter((v: string) => v !== module.id);
                                        modulesForm.setValue("coreModules", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-normal">{module.name}</FormLabel>
                                    <p className="text-xs text-gray-500">{module.description}</p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        {modulesForm.formState.errors.coreModules && (
                          <p className="text-xs text-red-600 mt-2">{modulesForm.formState.errors.coreModules.message as string}</p>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Optional Modules</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {optionalModules.map((module) => (
                            <FormField
                              key={module.id}
                              control={modulesForm.control}
                              name="optionalModules"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={watchedOptional.includes(module.id)}
                                      onCheckedChange={(checked) => {
                                        const isChecked = checked === true;
                                        const cur = modulesForm.getValues("optionalModules") || [];
                                        const next = isChecked
                                          ? Array.from(new Set([...cur, module.id]))
                                          : cur.filter((v: string) => v !== module.id);
                                        modulesForm.setValue("optionalModules", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-normal">{module.name}</FormLabel>
                                    <p className="text-xs text-gray-500">{module.description}</p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={updateModulesMutation.isPending}>
                          {updateModulesMutation.isPending ? "Saving..." : "Save Modules"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* People */}
            <TabsContent value="people" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage People</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md border p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Students</div>
                          <div className="text-xs text-gray-500">Enroll and manage students</div>
                        </div>
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-2xl font-semibold">{headerStats.students}</div>
                        <Button size="sm" onClick={() => setLocation(`/${schoolId}/admin/students`)}>Open</Button>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Teachers</div>
                          <div className="text-xs text-gray-500">Hire and manage teachers</div>
                        </div>
                        <GraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-2xl font-semibold">{headerStats.teachers}</div>
                        <Button size="sm" onClick={() => setLocation(`/${schoolId}/admin/teachers`)}>Open</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes */}
            <TabsContent value="classes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-3">Create, assign, and update classes</div>
                  <Button onClick={() => setLocation(`/${schoolId}/admin/classes`)}>Open Classes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>School Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md border p-4 bg-white">
                      <div className="text-sm font-medium text-gray-700 mb-2">General</div>
                      <div className="grid grid-cols-1 gap-2">
                        <LabeledValue label="Name" value={school.name || "-"} />
                        <LabeledValue label="Code" value={school.code || "-"} />
                        <LabeledValue label="Email" value={school.email || "-"} />
                        <LabeledValue label="Phone" value={school.phone || "-"} />
                        <LabeledValue label="Address" value={school.address || "-"} />
                      </div>
                      <div className="mt-3">
                        <Button variant="secondary" size="sm"><Settings className="h-4 w-4 mr-1" /> Edit Settings</Button>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 bg-white">
                      <div className="text-sm font-medium text-gray-700 mb-2">Administrators</div>
                      <div className="text-sm text-gray-600">Manage school admins and invitations</div>
                      <div className="mt-3">
                        <Button size="sm" variant="outline">Manage Admins</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function LabeledValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
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
