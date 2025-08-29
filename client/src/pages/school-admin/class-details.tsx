import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi, attendanceApi } from "@/lib/api";
import { Users, Calendar, BookOpen, CheckCircle2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ClassDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/:schoolId/admin/classes/:classId");
  const schoolId = params?.schoolId || user?.schoolId;
  const classId = params?.classId;

  const { data: klass, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "classes", classId],
    queryFn: () => (schoolId && classId ? schoolApi.getClass(schoolId, classId) : Promise.resolve(null)),
    enabled: !!schoolId && !!classId,
  });

  // Attendance state
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  const { data: allStudents } = useQuery<any[]>({
    queryKey: ["/api/schools", schoolId, "students"],
    queryFn: () => (schoolId ? schoolApi.getStudents(schoolId) : Promise.resolve([] as any[])),
    enabled: !!schoolId,
  });

  const studentsInClass = useMemo(() => {
    return (allStudents ?? []).filter((s: any) => s.classId === classId);
  }, [allStudents, classId]);

  const { data: attendanceToday, refetch: refetchAttendance, isFetching: loadingAttendance } = useQuery({
    queryKey: ["/api/classes", classId, "attendance", date],
    queryFn: () => (classId ? attendanceApi.getByClass(classId, date) : Promise.resolve([])),
    enabled: !!classId && !!date,
  });

  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  // Initialize map from fetched attendance
  useEffect(() => {
    const map: Record<string, string> = {};
    (attendanceToday || []).forEach((rec: any) => {
      map[rec.studentId] = (rec.status || "").toLowerCase();
    });
    // default unset students to "present"
    studentsInClass.forEach((s: any) => {
      if (!map[s.id]) map[s.id] = "present";
    });
    setStatusMap(map);
  }, [attendanceToday, studentsInClass]);

  const existingStatusByStudent = useMemo(() => {
    const map: Record<string, string> = {};
    (attendanceToday || []).forEach((rec: any) => {
      map[rec.studentId] = (rec.status || "").toLowerCase();
    });
    return map;
  }, [attendanceToday]);

  const markAll = (status: string) => {
    const next: Record<string, string> = {};
    studentsInClass.forEach((s: any) => { next[s.id] = status; });
    setStatusMap(next);
  };

  const savingKey = useMemo(() => [classId, date, Object.values(statusMap).join(",")].join("|"), [classId, date, statusMap]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!classId || !date) return;
    setSaving(true);
    try {
      const toSave = studentsInClass.filter((s: any) => statusMap[s.id] && statusMap[s.id] !== existingStatusByStudent[s.id]);
      await Promise.all(
        toSave.map((s: any) =>
          attendanceApi.mark(classId, {
            studentId: s.id,
            status: statusMap[s.id],
            date,
            remarks: undefined,
          })
        )
      );
      await refetchAttendance();
    } finally {
      setSaving(false);
    }
  };

  // Tabs state for this page (must be declared before any early returns)
  const [activeTab, setActiveTab] = useState<string>("students");
  const activeTabLabels: Record<string, string> = {
    students: "Students",
    subjects: "Subjects",
    attendance: "Attendance",
  };

  if (isLoading) {
    return (
      <PageLayout title="Class Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!klass) {
    return (
      <PageLayout title="Class Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-10 text-center text-gray-500">Class not found.</CardContent>
        </Card>
      </PageLayout>
    );
  }
  return (
    <PageLayout
      title="Class Profile"
      subtitle="Sunrise Public School"
      sidebar={{ userRole: user?.role || "", schoolId }}
      breadcrumbs={{
        labelMap: classId ? { [classId]: klass?.name || "Class" } : undefined,
        extra: [{ label: activeTabLabels[activeTab] }],
      }}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-900">{klass.name}</div>
                <div className="text-sm text-gray-500">Grade {klass.grade}{klass.section ? ` - Section ${klass.section}` : ""}</div>
              </div>
              <div className="ml-auto flex items-center space-x-3">
                <Badge className={klass.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {klass.status}
                </Badge>
                <Button variant="secondary" size="sm">Edit Class</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-sm text-gray-700">
              <InfoTile title="Capacity" value={String(klass.capacity)} />
              <InfoTile title="Academic Year" value={klass.academicYear} />
              <InfoTile title="Class Teacher" value={klass.classTeacherId ? klass.classTeacherId : 'Not assigned'} />
              <InfoTile title="Created" value={(klass.createdAt && new Date(klass.createdAt).toISOString().slice(0,10)) || '-'} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="w-4 h-4 mr-2" /> Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">Coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">Coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Date</span>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => markAll("present")}>
                      Mark All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => markAll("absent")}>
                      Mark All Absent
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave} disabled={saving || loadingAttendance}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentsInClass.map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.user?.firstName} {s.user?.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.studentId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select value={statusMap[s.id] || "present"} onValueChange={(v) => setStatusMap(prev => ({ ...prev, [s.id]: v }))}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                      {studentsInClass.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No students in this class</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-4 bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-base font-medium mt-1">{value}</div>
    </div>
  );
}
