import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { schoolApi, attendanceApi } from "@/lib/api";
import { Mail, Phone, Calendar, MapPin, Users, GraduationCap } from "lucide-react";

export default function StudentDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/:schoolId/admin/students/:studentId");
  const schoolId = params?.schoolId || user?.schoolId;
  const studentId = params?.studentId;

  const { data: student, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "students", studentId],
    queryFn: () => (schoolId && studentId ? schoolApi.getStudent(schoolId, studentId) : Promise.resolve(null)),
    enabled: !!schoolId && !!studentId,
  });

  // Fetch related details
  const { data: attendanceData } = useQuery({
    queryKey: ["/api/schools", schoolId, "students", studentId, "attendance"],
    queryFn: () => (schoolId && studentId ? attendanceApi.getStudentAttendance(schoolId, studentId) : Promise.resolve(null)),
    enabled: !!schoolId && !!studentId,
  });

  // Fees API not available yet; keep placeholder via local fallback
  const { data: feesData } = useQuery({
    queryKey: ["/api/schools", schoolId, "students", studentId, "fees"],
    queryFn: () => Promise.resolve(null as any),
    enabled: false,
  });

  // Documents API not available yet; keep placeholder via local fallback
  const { data: documentsData } = useQuery({
    queryKey: ["/api/schools", schoolId, "students", studentId, "documents"],
    queryFn: () => Promise.resolve([] as any[]),
    enabled: false,
  });

  // Tabs state (must be declared before any early returns)
  const [activeTab, setActiveTab] = useState<string>("academic");
  const tabLabels: Record<string, string> = {
    academic: "Academic",
    attendance: "Attendance",
    fees: "Fees",
    documents: "Documents",
  };

  if (isLoading) {
    return (
      <PageLayout title="Student Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!student) {
    return (
      <PageLayout title="Student Details" subtitle="Sunrise Public School" sidebar={{ userRole: user?.role || "", schoolId }}>
        <Card>
          <CardContent className="p-10 text-center text-gray-500">Student not found.</CardContent>
        </Card>
      </PageLayout>
    );
  }

  const fullName = `${student.user.firstName} ${student.user.lastName}`;
  const className = student.class?.name || "Not assigned";
  const rollNo = student.rollNumber || student.rollNo || "-";
  const admissionNo = student.admissionNo || student.admissionNumber || "-";
  const academicYear = student.academicYear || "2023-2024";
  const classTeacher = student.class?.teacher?.name || "Ms. Sarah Johnson";
  const parentName = student.parent?.name || student.guardian?.name || "Parent: Robert Smith";
  const parentPhone = student.parent?.phone || student.guardian?.phone || "+1 234-567-8902";
  const address = student.address || "123 School Lane, Education City, EC 12345";
  const dob = student.dob || student.dateOfBirth || "2008-05-15";

  // Placeholders for detailed tabs
  const currentSubjects: { subject: string; teacher: string; grade: string }[] = student.subjects || [
    { subject: "Mathematics", teacher: "Mr. David Wilson", grade: "A-" },
    { subject: "Science", teacher: "Ms. Emily Rodriguez", grade: "A" },
    { subject: "English", teacher: "Mr. Michael Chen", grade: "B+" },
    { subject: "Social Studies", teacher: "Ms. Jessica Lee", grade: "A" },
    { subject: "Computer Science", teacher: "Mr. Robert Johnson", grade: "A+" },
  ];

  const previousRecords: { year: string; cls: string; percentage: string; grade: string; rank: string }[] = student.previousRecords || [
    { year: "2022-2023", cls: "9", percentage: "87.5%", grade: "A", rank: "5" },
    { year: "2021-2022", cls: "8", percentage: "85.2%", grade: "A", rank: "7" },
    { year: "2020-2021", cls: "7", percentage: "82.5%", grade: "B+", rank: "10" },
  ];

  const attendanceSummary = attendanceData || student.attendanceSummary || {
    present: 18,
    absent: 2,
    late: 1,
    total: 21,
    percentage: 85.7,
    monthly: [92, 88, 95, 90, 85.7],
    recent: [
      { date: "2025-05-20", status: "Present", time: "08:30 AM" },
      { date: "2025-05-19", status: "Present", time: "08:25 AM" },
      { date: "2025-05-18", status: "Absent", time: "-" },
      { date: "2025-05-17", status: "Present", time: "08:20 AM" },
    ],
  };

  const fees = feesData || student.fees || {
    academicYear,
    total: 12000,
    paid: 9000,
    due: 3000,
    nextDue: "2025-06-15",
    structure: [
      { type: "Tuition Fee", amount: 8000, frequency: "Annual" },
      { type: "Development Fee", amount: 2000, frequency: "Annual" },
      { type: "Library Fee", amount: 1000, frequency: "Annual" },
      { type: "Computer Lab Fee", amount: 1000, frequency: "Annual" },
    ],
    payments: [
      { receipt: "PMT001", date: "2025-01-10", amount: 5000, mode: "Online", status: "Paid" },
      { receipt: "PMT002", date: "2025-03-15", amount: 4000, mode: "Cash", status: "Paid" },
    ],
  };

  const documents = documentsData || student.documents || [
    { name: "Birth Certificate", uploaded: "2019-06-01", status: "Verified" },
    { name: "Transfer Certificate", uploaded: "2019-06-01", status: "Verified" },
    { name: "Medical Certificate", uploaded: "2019-06-01", status: "Verified" },
    { name: "Address Proof", uploaded: "2019-06-01", status: "Pending" },
  ];

  return (
    <PageLayout
      title="Student Profile"
      subtitle="Sunrise Public School"
      sidebar={{ userRole: user?.role || "", schoolId }}
      breadcrumbs={{
        labelMap: studentId ? { [studentId]: fullName } : undefined,
        extra: [{ label: tabLabels[activeTab] }],
      }}
    >
      <div className="space-y-6">
          {/* Header Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={fullName} />
                  <AvatarFallback>
                    {student.user.firstName[0]}
                    {student.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{fullName}</div>
                      <div className="text-sm text-gray-500">
                        Admission No: {admissionNo} | Class: {className} | Roll No: {rollNo}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">{student.status || "Active"}</Badge>
                      <Button variant="secondary" size="sm">Edit Profile</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span>{student.user.email}</span></div>
                    <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>{student.user.phone || "+1 234-567-8901"}</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>DOB: {dob}</span></div>
                    <div className="flex items-center space-x-2"><Users className="w-4 h-4 text-gray-400" /><span>{parentName}</span></div>
                    <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>Parent Phone: {parentPhone}</span></div>
                    <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-400" /><span>{address}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Academic Tab */}
            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoTile title="Current Class" value={className} />
                    <InfoTile title="Academic Year" value={academicYear} />
                    <InfoTile title="Class Teacher" value={classTeacher} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentSubjects.map((sub, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.teacher}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><Badge className="bg-gray-100 text-gray-800">{sub.grade}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previous Academic Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previousRecords.map((r, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.year}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.cls}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.percentage}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.grade}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.rank}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InfoTile title="Present Days" value={`${attendanceSummary.present}/${attendanceSummary.total}`} accent="text-green-700" />
                    <InfoTile title="Absent Days" value={`${attendanceSummary.absent}/${attendanceSummary.total}`} accent="text-red-700" />
                    <InfoTile title="Late Days" value={`${attendanceSummary.late}/${attendanceSummary.total}`} accent="text-yellow-700" />
                    <InfoTile title="Attendance Percentage" value={`${attendanceSummary.percentage}%`} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                    {attendanceSummary.monthly.map((v: number, i: number) => (
                      <div key={i}>
                        <div className="text-sm text-gray-600">{["January","February","March","April","May"][i] || `M${i+1}`}</div>
                        <div className="h-2 bg-gray-200 rounded mt-1">
                          <div className="h-2 bg-gray-800 rounded" style={{ width: `${v}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{v}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceSummary.recent.map((r: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.date}</td>
                            <td className="px-6 py-4 text-sm"><Badge className={
                              r.status === "Present" ? "bg-green-100 text-green-800" : r.status === "Late" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                            }>{r.status}</Badge></td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fees Tab */}
            <TabsContent value="fees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fees Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500 mb-3">Academic year: {fees.academicYear}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoTile title="Total Fees" value={`$${fees.total}`} />
                    <InfoTile title="Paid Amount" value={`$${fees.paid}`} accent="text-green-700" />
                    <InfoTile title="Due Amount" value={`$${fees.due}`} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Payment Progress</span><span>{Math.round((fees.paid/fees.total)*100)}%</span></div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-gray-800 rounded" style={{ width: `${(fees.paid/fees.total)*100}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fees.structure.map((f: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">{f.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${f.amount}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{f.frequency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No.</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fees.payments.map((p: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">{p.receipt}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{p.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${p.amount}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{p.mode}</td>
                            <td className="px-6 py-4 text-sm"><Badge className="bg-green-100 text-green-800">{p.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500 mb-3">Important documents and certificates</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((d: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">{d.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{d.uploaded}</td>
                            <td className="px-6 py-4 text-sm"><Badge className={d.status === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{d.status}</Badge></td>
                            <td className="px-6 py-4 text-right text-sm"><Button variant="ghost" size="sm">View</Button></td>
                          </tr>
                        ))}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function InfoTile({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className="rounded-md border p-4 bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`text-base font-medium mt-1 ${accent || ""}`}>{value}</div>
    </div>
  );
}
