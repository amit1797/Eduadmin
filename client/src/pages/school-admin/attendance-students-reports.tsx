import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminAttendanceStudentsReports() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  return (
    <PageLayout title="Attendance Reports" subtitle="Students" sidebar={{ userRole: user?.role || "", schoolId }}>
      <Card>
        <CardHeader>
          <CardTitle>Students Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Report UI coming soon. You can filter by date range, class, and section.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
