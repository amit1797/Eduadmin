import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminEvents() {
  const { user } = useAuth();
  const schoolId = user?.schoolId as string | undefined;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["/api/schools", schoolId, "events"],
    queryFn: () => (schoolId ? schoolApi.getEvents(schoolId) : Promise.resolve([])),
    enabled: !!schoolId,
  });

  const create = async () => {
    if (!schoolId || !title.trim() || !date) return;
    setSaving(true);
    try {
      await schoolApi.createEvent(schoolId, { title: title.trim(), date, description });
      setTitle("");
      setDate("");
      setDescription("");
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Events"
      subtitle="School Calendar & Activities"
      sidebar={{ userRole: "school_admin", schoolId }}
    >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Button onClick={create} disabled={saving || !title.trim() || !date}>Create</Button>
              </div>
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {(events || []).length === 0 && (
                    <div className="text-sm text-gray-500">No events yet.</div>
                  )}
                  {(events || []).map((ev: any) => (
                    <div key={ev.id} className="py-3 flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ev.title}</div>
                        <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                        {ev.description && (
                          <div className="text-xs text-gray-600 mt-1">{ev.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </PageLayout>
  );
}
