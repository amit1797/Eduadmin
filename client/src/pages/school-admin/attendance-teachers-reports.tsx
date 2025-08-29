import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminAttendanceTeachersReports() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  return (
    <PageLayout title="Attendance Reports" subtitle="Teachers" sidebar={{ userRole: user?.role || "", schoolId }}>
      <Card>
        <CardHeader>
          <CardTitle>Teachers Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Report UI coming soon. You can filter by date range and department.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
