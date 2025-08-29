import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function AdminAttendanceIndex() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const base = `/${schoolId}/admin/attendance`;

  return (
    <PageLayout
      title="Attendance"
      subtitle="Select what to manage"
      sidebar={{ userRole: user?.role || "", schoolId }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" /> Students Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Mark and review daily attendance for students by class.</p>
            <Link href={`${base}/students`}>
              <Button>Go to Students</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-600" /> Teachers Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Record daily staff attendance and late marks.</p>
            <Link href={`${base}/teachers`}>
              <Button variant="outline">Go to Teachers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
