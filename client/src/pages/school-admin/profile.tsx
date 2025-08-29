import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { user } = useAuth();
  return (
    <PageLayout
      title="Profile"
      subtitle="Your account overview"
      sidebar={{ userRole: user?.role || "student", schoolId: user?.schoolId }}
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>
        <p className="text-sm text-gray-600">This is a placeholder profile page. We can add editable user details here.</p>
      </div>
    </PageLayout>
  );
}
