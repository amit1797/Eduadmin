import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi } from "@/lib/api";

export default function AdminTeacherAttendance() {
  const { user } = useAuth();
  const schoolId = user?.schoolId as string | undefined;

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "teachers"],
    queryFn: () => (schoolId ? schoolApi.getTeachers(schoolId) : Promise.resolve([])),
    enabled: !!schoolId,
  });

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [] as any[];
    return teachers.filter((t: any) => {
      if (filter === "all") return true;
      const st = (statusMap[t.id] || "present").toLowerCase();
      return st === filter;
    });
  }, [teachers, filter, statusMap]);

  const markAll = (status: string) => {
    const map: Record<string, string> = {};
    (teachers || []).forEach((t: any) => {
      map[t.id] = status;
    });
    setStatusMap(map);
  };

  const handleSave = async () => {
    // Placeholder: no backend yet for teacher attendance
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Attendance (Teachers)"
      subtitle="Daily staff attendance"
      sidebar={{ userRole: user?.role || "", schoolId }}
    >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mark Teacher Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex gap-3 items-center">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => markAll("present")}>Mark All Present</Button>
                  <Button variant="outline" size="sm" onClick={() => markAll("absent")}>Mark All Absent</Button>
                  <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
                    Save
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeachers.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.user?.firstName} {t.user?.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.employeeId || t.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select value={statusMap[t.id] || "present"} onValueChange={(v) => setStatusMap(prev => ({ ...prev, [t.id]: v }))}>
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
                      {filteredTeachers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No teachers</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
    </PageLayout>
  );
}
