import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schoolApi } from "@/lib/api";
import { routes } from "@/lib/routes";
import { useAuth } from "@/hooks/use-auth";
import { useCRUD } from "@/hooks/useCRUD";
import { ModalForm } from "@/components/common/FormComponents";
import { createStudentSchema } from "@/components/common/FormComponents";
import { type Student } from "@/types";
import { Search, Filter, Grid, Download, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // CRUD integration (merged from enhanced-students.tsx)
  const {
    items: students,
    isLoading: studentsLoading,
    isModalOpen,
    modalMode,
    selectedItem,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD<Student>({
    queryKey: ['students', user?.schoolId || ''],
    fetchFn: async () => {
      if (!user?.schoolId) return [] as Student[];
      const res: any = await schoolApi.getStudents(user.schoolId);
      return (Array.isArray(res) ? res : (res.students || [])) as Student[];
    },
    createFn: async (data) => {
      if (!user?.schoolId) throw new Error('School ID missing');
      const res: any = await schoolApi.createStudent(user.schoolId, data);
      return (res?.student ?? res) as Student;
    },
    updateFn: async (id, data) => {
      if (!user?.schoolId) throw new Error('School ID missing');
      const res: any = await schoolApi.updateStudent(user.schoolId, id, data);
      return (res?.student ?? res) as Student;
    },
    deleteFn: async (id) => {
      if (!user?.schoolId) throw new Error('School ID missing');
      await schoolApi.deleteStudent(user.schoolId, id);
    }
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/schools", user?.schoolId, "classes"],
    queryFn: () => user?.schoolId ? schoolApi.getClasses(user.schoolId) : null,
    enabled: !!user?.schoolId
  });

  const filteredStudents = (students || []).filter((student: any) => {
    const matchesSearch = !searchTerm || 
      student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === "all" || student.classId === selectedClass;
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  }) || [];

  if (studentsLoading) {
    return (
      <PageLayout
        title="Student Management"
        subtitle="Sunrise Public School"
        showAddButton
        addButtonText="Add Student"
        sidebar={{ userRole: user?.role || "", schoolId: user?.schoolId }}
      >
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Student Management"
      subtitle="Sunrise Public School"
      showAddButton
      addButtonText="Add Student"
      onAddClick={openCreateModal}
      sidebar={{ userRole: user?.role || "", schoolId: user?.schoolId }}
    >
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-students"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-class">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" data-testid="button-import">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Students ({filteredStudents.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-grid-view">
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50" data-testid={`student-row-${student.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt={`${student.user.firstName} ${student.user.lastName}`} />
                            <AvatarFallback>
                              {student.user.firstName[0]}{student.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.user.firstName} {student.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.class?.name || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.user.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={student.status === "active" ? "default" : "secondary"}
                          className={
                            student.status === "active" ? "bg-green-100 text-green-800" :
                            student.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={user ? routes.schoolAdmin(user.schoolId).studentDetails(student.id) : "#"}>
                            <span 
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                              data-testid={`button-view-${student.id}`}
                            >
                              View
                            </span>
                          </Link>
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            data-testid={`button-edit-${student.id}`}
                            onClick={() => openEditModal(student)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            data-testid={`button-delete-${student.id}`}
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{Math.min(10, filteredStudents.length)}</span> of{" "}
                    <span className="font-medium">{filteredStudents.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled data-testid="button-previous">
                      Previous
                    </Button>
                    <Button size="sm" className="bg-blue-600 text-white" data-testid="button-page-1">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled data-testid="button-next">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    {/* Create / Edit Modals */}
    {modalMode === 'create' ? (
      <ModalForm
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add New Student"
        schema={createStudentSchema}
        onSubmit={handleCreate}
        fields={[
          { name: 'userData.firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
          { name: 'userData.lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
          { name: 'userData.email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
          { name: 'userData.username', label: 'Username', type: 'text', required: true, placeholder: 'Enter username' },
          { name: 'userData.password', label: 'Password', type: 'password', required: true, placeholder: 'Enter password' },
          { name: 'userData.phone', label: 'Phone', type: 'text', placeholder: 'Enter phone number' },
          { name: 'studentData.studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'Enter student ID' },
          { name: 'studentData.dateOfBirth', label: 'Date of Birth', type: 'date' },
          { name: 'studentData.gender', label: 'Gender', type: 'select', options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]},
          { name: 'studentData.bloodGroup', label: 'Blood Group', type: 'select', options: [
            { value: 'A+', label: 'A+' },{ value: 'A-', label: 'A-' },{ value: 'B+', label: 'B+' },{ value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },{ value: 'AB-', label: 'AB-' },{ value: 'O+', label: 'O+' },{ value: 'O-', label: 'O-' }
          ]},
          { name: 'studentData.address', label: 'Address', type: 'textarea', placeholder: 'Enter address' },
          { name: 'studentData.emergencyContact', label: 'Emergency Contact', type: 'text', placeholder: 'Enter emergency contact number' },
        ]}
        submitText="Create Student"
      />
    ) : (
      <ModalForm
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Edit Student"
        schema={createStudentSchema.extend({
          userData: createStudentSchema.shape.userData.extend({ password: z.string().optional() })
        })}
        onSubmit={handleUpdate}
        defaultValues={selectedItem ? {
          userData: {
            firstName: selectedItem.user?.firstName || '',
            lastName: selectedItem.user?.lastName || '',
            email: selectedItem.user?.email || '',
            username: selectedItem.user?.username || '',
            phone: selectedItem.user?.phone || '',
            role: 'student' as const,
          },
          studentData: {
            studentId: selectedItem.studentId || '',
            dateOfBirth: selectedItem.dateOfBirth || undefined,
            gender: (selectedItem.gender as 'male'|'female'|'other'|undefined) || undefined,
            bloodGroup: (selectedItem.bloodGroup as 'A+'|'A-'|'B+'|'B-'|'AB+'|'AB-'|'O+'|'O-'|undefined) || undefined,
            address: selectedItem.address || '',
            emergencyContact: selectedItem.emergencyContact || ''
          }
        } : undefined}
        fields={[
          { name: 'userData.firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
          { name: 'userData.lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
          { name: 'userData.email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
          { name: 'userData.username', label: 'Username', type: 'text', required: true, placeholder: 'Enter username' },
          { name: 'userData.password', label: 'Password', type: 'password', required: false, placeholder: 'Leave blank to keep unchanged' },
          { name: 'userData.phone', label: 'Phone', type: 'text', placeholder: 'Enter phone number' },
          { name: 'studentData.studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'Enter student ID' },
          { name: 'studentData.dateOfBirth', label: 'Date of Birth', type: 'date' },
          { name: 'studentData.gender', label: 'Gender', type: 'select', options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]},
          { name: 'studentData.bloodGroup', label: 'Blood Group', type: 'select', options: [
            { value: 'A+', label: 'A+' },{ value: 'A-', label: 'A-' },{ value: 'B+', label: 'B+' },{ value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },{ value: 'AB-', label: 'AB-' },{ value: 'O+', label: 'O+' },{ value: 'O-', label: 'O-' }
          ]},
          { name: 'studentData.address', label: 'Address', type: 'textarea', placeholder: 'Enter address' },
          { name: 'studentData.emergencyContact', label: 'Emergency Contact', type: 'text', placeholder: 'Enter emergency contact number' },
        ]}
        submitText="Update Student"
      />
    )}
    </PageLayout>
  );
}
