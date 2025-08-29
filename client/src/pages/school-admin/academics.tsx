import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function AdminAcademics() {
  const { user } = useAuth();

  // Local UI state (MVP – no server yet)
  const [term, setTerm] = useState<string>("Term 1");
  const [newSubject, setNewSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
  ]);

  const [curriculumFocus, setCurriculumFocus] = useState<string>(
    "Strengthen foundational concepts and introduce project-based learning."
  );

  const [activeTab, setActiveTab] = useState<string>("overview");
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    subjects: "Subjects",
    "term-planner": "Term Planner",
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) return;
    setSubjects((prev) => [...prev, newSubject.trim()]);
    setNewSubject("");
  };

  return (
    <PageLayout
      title="Academics"
      subtitle="Curriculum & Planning"
      sidebar={{ userRole: "school_admin", schoolId: user?.schoolId }}
      breadcrumbs={{ extra: [{ label: tabLabels[activeTab] }] }}
    >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="term-planner">Term Planner</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Curriculum Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-white">
                      <p className="text-sm text-gray-500">Current Term</p>
                      <p className="text-lg font-semibold">{term}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-white">
                      <p className="text-sm text-gray-500">Active Subjects</p>
                      <p className="text-lg font-semibold">{subjects.length}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-white">
                      <p className="text-sm text-gray-500">Focus Area</p>
                      <p className="text-sm text-gray-800">Project-based learning</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Curriculum Focus</p>
                    <Input
                      value={curriculumFocus}
                      onChange={(e) => setCurriculumFocus(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Draft-only for now. Hook this to an API to persist.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Subjects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Add a new subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button onClick={addSubject}>Add</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjects.map((s) => (
                      <div key={s} className="flex items-center justify-between p-3 border rounded-md bg-white">
                        <span className="text-sm text-gray-800">{s}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSubjects((prev) => prev.filter((x) => x !== s))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="term-planner" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Term Planner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="flex gap-3 items-center">
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Term 1">Term 1</SelectItem>
                          <SelectItem value="Term 2">Term 2</SelectItem>
                          <SelectItem value="Term 3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="date" className="w-44" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Export Plan</Button>
                      <Button size="sm">Save Draft</Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 bg-white">
                    <p className="text-sm text-gray-600 mb-2">Weekly Plan</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Week 1 focus" />
                      <Input placeholder="Week 2 focus" />
                      <Input placeholder="Week 3 focus" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </PageLayout>
  );
}
