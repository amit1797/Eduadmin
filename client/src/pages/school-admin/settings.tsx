import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <PageLayout
      title="Settings"
      subtitle="Personal and system preferences"
      sidebar={{ userRole: user?.role || "student", schoolId: user?.schoolId }}
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <p className="text-sm text-gray-600">This is a placeholder settings page. We can add preferences and account settings here.</p>
      </div>
    </PageLayout>
  );
}
