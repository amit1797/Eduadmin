import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi, attendanceApi } from "@/lib/api";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function TeacherAttendance() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["/api/schools", schoolId, "classes"],
    queryFn: () => (schoolId ? schoolApi.getClasses(schoolId) : Promise.resolve([])),
    enabled: !!schoolId,
  });

  // Filter classes to those assigned to this teacher
  const myClasses = useMemo(() => {
    return (classes || []).filter((c: any) => c.classTeacherId === user?.id);
  }, [classes, user?.id]);

  useEffect(() => {
    if (!selectedClassId && myClasses && myClasses.length > 0) {
      setSelectedClassId(myClasses[0].id);
    }
  }, [myClasses, selectedClassId]);

  const { data: students } = useQuery({
    queryKey: ["/api/schools", schoolId, "students"],
    queryFn: () => (schoolId ? schoolApi.getStudents(schoolId) : Promise.resolve([])),
    enabled: !!schoolId,
  });

  const studentsInClass = useMemo(() => {
    return (students || []).filter((s: any) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const { data: attendanceForDate, isFetching: loadingAttendance, refetch } = useQuery({
    queryKey: ["/api/classes", selectedClassId, "attendance", date],
    queryFn: () => (selectedClassId ? attendanceApi.getByClass(selectedClassId, date) : Promise.resolve([])),
    enabled: !!selectedClassId && !!date,
  });

  const existingStatusByStudent = useMemo(() => {
    const map: Record<string, string> = {};
    (attendanceForDate || []).forEach((rec: any) => {
      map[rec.studentId] = (rec.status || "").toLowerCase();
    });
    return map;
  }, [attendanceForDate]);

  useEffect(() => {
    const map: Record<string, string> = {};
    studentsInClass.forEach((s: any) => {
      map[s.id] = existingStatusByStudent[s.id] || "present";
    });
    setStatusMap(map);
  }, [studentsInClass, existingStatusByStudent]);

  const markAll = (status: string) => {
    const next: Record<string, string> = {};
    studentsInClass.forEach((s: any) => {
      next[s.id] = status;
    });
    setStatusMap(next);
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const toSave = studentsInClass.filter((s: any) => statusMap[s.id] && statusMap[s.id] !== existingStatusByStudent[s.id]);
      await Promise.all(
        toSave.map((s: any) =>
          attendanceApi.mark(selectedClassId, {
            studentId: s.id,
            status: statusMap[s.id],
            date,
            remarks: undefined,
          })
        )
      );
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Attendance" subtitle="My Classes" />
      <div className="flex">
        <Sidebar userRole={user?.role || ""} schoolId={schoolId} />
        <div className="flex-1 p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex gap-3 items-center">
                  {loadingClasses ? (
                    <Skeleton className="h-10 w-56" />
                  ) : (
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {(myClasses || []).map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} - {c.grade}{c.section ? ` ${c.section}` : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => markAll("present")} disabled={!selectedClassId}>Mark All Present</Button>
                  <Button variant="outline" size="sm" onClick={() => markAll("absent")} disabled={!selectedClassId}>Mark All Absent</Button>
                  <Button variant="default" size="sm" onClick={handleSave} disabled={saving || loadingAttendance || !selectedClassId}>
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
        </div>
      </div>
    </div>
  );
}
