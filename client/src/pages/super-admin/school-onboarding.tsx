import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { superAdminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  FileText, 
  Settings2, 
  Upload, 
  Users, 
  GraduationCap,
  Check, 
  ArrowRight, 
  ArrowLeft,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  UserCheck
} from "lucide-react";

// Form schemas for each step
const basicDetailsSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().min(3, "School code must be at least 3 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid principal email is required"),
  principalPhone: z.string().min(10, "Valid principal phone is required"),
  establishedYear: z.string().min(4, "Valid year is required"),
  schoolType: z.enum(["public", "private", "government"]),
  board: z.enum(["cbse", "icse", "state", "ib", "other"]),
  description: z.string().optional(),
});

const documentsSchema = z.object({
  registrationCertificate: z.string().min(1, "Registration certificate is required"),
  taxCertificate: z.string().min(1, "Tax certificate is required"),
  affiliationCertificate: z.string().min(1, "Affiliation certificate is required"),
  noCertificate: z.string().optional(),
  auditReport: z.string().optional(),
  other: z.string().optional(),
});

const modulesSchema = z.object({
  coreModules: z.array(z.string()).min(1, "At least one core module is required"),
  optionalModules: z.array(z.string()),
});

const configurationSchema = z.object({
  currentSession: z.string().min(1, "Current session is required"),
  sessionStartMonth: z.string().min(1, "Session start month is required"),
  sessionEndMonth: z.string().min(1, "Session end month is required"),
  workingDays: z.array(z.string()).min(1, "At least one working day is required"),
  schoolTimings: z.object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  }),
  gradingSystem: z.enum(["percentage", "gpa", "letter"]),
  currency: z.string().min(1, "Currency is required"),
  language: z.string().min(1, "Primary language is required"),
});

const dataUploadSchema = z.object({
  studentDataFile: z.string().optional(),
  teacherDataFile: z.string().optional(),
  academicDataFile: z.string().optional(),
  skipDataUpload: z.boolean().default(false),
});

export default function SchoolOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form instances for each step
  const basicForm = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      website: "",
      principalName: "",
      principalEmail: "",
      principalPhone: "",
      establishedYear: "",
      schoolType: "private" as const,
      board: "cbse" as const,
      description: "",
    }
  });

  const documentsForm = useForm({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      registrationCertificate: "",
      taxCertificate: "",
      affiliationCertificate: "",
      noCertificate: "",
      auditReport: "",
      other: "",
    }
  });

  const modulesForm = useForm({
    resolver: zodResolver(modulesSchema),
    defaultValues: {
      coreModules: ["student_management", "attendance_management"],
      optionalModules: [],
    }
  });

  const configForm = useForm({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      currentSession: "",
      sessionStartMonth: "",
      sessionEndMonth: "",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      schoolTimings: {
        startTime: "",
        endTime: "",
      },
      gradingSystem: "percentage" as const,
      currency: "USD",
      language: "English",
    }
  });

  const dataForm = useForm({
    resolver: zodResolver(dataUploadSchema),
    defaultValues: {
      studentDataFile: "",
      teacherDataFile: "",
      academicDataFile: "",
      skipDataUpload: false,
    }
  });

  const onboardMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.onboardSchool(data),
    onSuccess: () => {
      toast({ title: "School onboarded successfully!" });
      setLocation("/super-admin/schools");
    },
    onError: () => {
      toast({ title: "Failed to onboard school", variant: "destructive" });
    }
  });

  const coreModules = [
    { id: "student_management", name: "Student Management", description: "Manage student records, enrollment, and profiles" },
    { id: "teacher_management", name: "Teacher Management", description: "Manage teacher profiles, assignments, and schedules" },
    { id: "attendance_management", name: "Attendance Management", description: "Track student and staff attendance" },
    { id: "class_management", name: "Class Management", description: "Organize classes, sections, and subjects" },
    { id: "academic_management", name: "Academic Management", description: "Manage curriculum, grades, and academic records" },
    { id: "test_result_management", name: "Test & Result Management", description: "Create tests, exams, and manage results" },
  ];

  const optionalModules = [
    { id: "library_management", name: "Library Management", description: "Manage library books, issues, and returns" },
    { id: "transport_management", name: "Transport Management", description: "Manage school buses, routes, and drivers" },
    { id: "payroll_management", name: "Payroll Management", description: "Manage staff salaries and payroll" },
    { id: "event_management", name: "Event Management", description: "Organize school events and activities" },
    { id: "accounts_management", name: "Accounts Management", description: "Manage school finances and accounting" },
    { id: "notification_system", name: "Notification System", description: "Send notifications to students and parents" },
    { id: "audit_management", name: "Audit Management", description: "Track system activities and audit logs" },
    { id: "branch_management", name: "Branch Management", description: "Manage multiple school branches" },
  ];

  const steps = [
    { id: 1, title: "Basic Details", icon: Building2, description: "School information and contact details" },
    { id: 2, title: "Documents", icon: FileText, description: "Upload required certificates and documents" },
    { id: 3, title: "Modules", icon: Settings2, description: "Select core and optional modules" },
    { id: 4, title: "Configuration", icon: School, description: "School settings and preferences" },
    { id: 5, title: "Data Upload", icon: Upload, description: "Upload student, teacher, and academic data" },
    { id: 6, title: "Complete", icon: Check, description: "Review and finalize onboarding" },
  ];

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onBasicSubmit = (data: any) => {
    console.log("Basic details:", data);
    nextStep();
  };

  const onDocumentsSubmit = (data: any) => {
    console.log("Documents:", data);
    nextStep();
  };

  const onModulesSubmit = (data: any) => {
    console.log("Modules:", data);
    nextStep();
  };

  const onConfigSubmit = (data: any) => {
    console.log("Configuration:", data);
    nextStep();
  };

  const onDataSubmit = (data: any) => {
    console.log("Data upload:", data);
    nextStep();
  };

  const handleFinalSubmit = () => {
    const allData = {
      basicDetails: basicForm.getValues(),
      documents: documentsForm.getValues(),
      modules: modulesForm.getValues(),
      configuration: configForm.getValues(),
      dataUpload: dataForm.getValues(),
    };
    
    onboardMutation.mutate(allData);
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="School Onboarding" />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">School Onboarding Process</h1>
                <Badge variant="outline" className="text-sm">
                  Step {currentStep} of {steps.length}
                </Badge>
              </div>
              
              <Progress value={progressPercentage} className="h-2 mb-4" />
              
              {/* Step indicators */}
              <div className="flex justify-between">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`flex flex-col items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <div className={`rounded-full p-2 mb-2 ${
                        isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-center">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {(() => {
                    const CurrentIcon = steps[currentStep - 1]?.icon;
                    return CurrentIcon ? <CurrentIcon className="mr-3 h-6 w-6" /> : null;
                  })()}
                  {steps[currentStep - 1]?.title}
                </CardTitle>
                <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
              </CardHeader>
              
              <CardContent>
                {/* Step 1: Basic Details */}
                {currentStep === 1 && (
                  <Form {...basicForm}>
                    <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={basicForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter school name" data-testid="input-school-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Code *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., ABC001" data-testid="input-school-code" />
                              </FormControl>
                              <FormDescription>Unique identifier for the school</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="schoolType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-school-type">
                                    <SelectValue placeholder="Select school type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private">Private School</SelectItem>
                                  <SelectItem value="public">Public School</SelectItem>
                                  <SelectItem value="government">Government School</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="board"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Educational Board *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-board">
                                    <SelectValue placeholder="Select board" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cbse">CBSE</SelectItem>
                                  <SelectItem value="icse">ICSE</SelectItem>
                                  <SelectItem value="state">State Board</SelectItem>
                                  <SelectItem value="ib">International Baccalaureate</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="establishedYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Established Year *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 1990" data-testid="input-established-year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Email *</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} placeholder="school@example.com" data-testid="input-school-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Phone *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-school-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={basicForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Website</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://school.edu" data-testid="input-school-website" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <MapPin className="mr-2 h-5 w-5" />
                          Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={basicForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Street Address *</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Enter complete address" data-testid="textarea-address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={basicForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter city" data-testid="input-city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={basicForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter state" data-testid="input-state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={basicForm.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter pincode" data-testid="input-pincode" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <UserCheck className="mr-2 h-5 w-5" />
                          Principal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={basicForm.control}
                            name="principalName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Principal Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter principal name" data-testid="input-principal-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={basicForm.control}
                            name="principalEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Principal Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} placeholder="principal@school.com" data-testid="input-principal-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={basicForm.control}
                            name="principalPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Principal Phone *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-principal-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <FormField
                        control={basicForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Brief description about the school" data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-step">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 2: Documents */}
                {currentStep === 2 && (
                  <Form {...documentsForm}>
                    <form onSubmit={documentsForm.handleSubmit(onDocumentsSubmit)} className="space-y-6">
                      <div className="text-center mb-6">
                        <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Upload Required Documents</h3>
                        <p className="text-gray-600">Please upload the following documents for verification</p>
                      </div>
                      
                      <div className="space-y-6">
                        <FormField
                          control={documentsForm.control}
                          name="registrationCertificate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                School Registration Certificate *
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                  <Input 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png" 
                                    className="hidden" 
                                    data-testid="file-registration-cert"
                                  />
                                  <Button variant="outline" type="button">
                                    Choose File
                                  </Button>
                                  <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentsForm.control}
                          name="taxCertificate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Tax Exemption Certificate *
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                  <Button variant="outline" type="button" data-testid="button-tax-cert">
                                    Choose File
                                  </Button>
                                  <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentsForm.control}
                          name="affiliationCertificate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Board Affiliation Certificate *
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                  <Button variant="outline" type="button" data-testid="button-affiliation-cert">
                                    Choose File
                                  </Button>
                                  <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={documentsForm.control}
                            name="noCertificate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <FileText className="mr-2 h-4 w-4" />
                                  No Objection Certificate (Optional)
                                </FormLabel>
                                <FormControl>
                                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                    <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                                    <Button variant="outline" size="sm" type="button" data-testid="button-noc">
                                      Choose File
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={documentsForm.control}
                            name="auditReport"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Latest Audit Report (Optional)
                                </FormLabel>
                                <FormControl>
                                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                    <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                                    <Button variant="outline" size="sm" type="button" data-testid="button-audit-report">
                                      Choose File
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-step">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 3: Module Selection */}
                {currentStep === 3 && (
                  <Form {...modulesForm}>
                    <form onSubmit={modulesForm.handleSubmit(onModulesSubmit)} className="space-y-6">
                      <div className="text-center mb-6">
                        <Settings2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select Modules</h3>
                        <p className="text-gray-600">Choose the modules your school needs to manage operations</p>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-semibold mb-4 text-blue-600">Core Modules (Required)</h4>
                        <FormField
                          control={modulesForm.control}
                          name="coreModules"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {coreModules.map((module) => (
                                  <FormField
                                    key={module.id}
                                    control={modulesForm.control}
                                    name="coreModules"
                                    render={({ field }) => {
                                      return (
                                        <FormItem 
                                          key={module.id}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(module.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, module.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value: string) => value !== module.id
                                                      )
                                                    )
                                              }}
                                              data-testid={`checkbox-core-${module.id}`}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-normal">
                                              {module.name}
                                            </FormLabel>
                                            <p className="text-xs text-gray-500">
                                              {module.description}
                                            </p>
                                          </div>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-md font-semibold mb-4 text-green-600">Optional Modules</h4>
                        <FormField
                          control={modulesForm.control}
                          name="optionalModules"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {optionalModules.map((module) => (
                                  <FormField
                                    key={module.id}
                                    control={modulesForm.control}
                                    name="optionalModules"
                                    render={({ field }) => {
                                      return (
                                        <FormItem 
                                          key={module.id}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(module.id) || false}
                                              onCheckedChange={(checked) => {
                                                const currentValue = field.value || [];
                                                return checked
                                                  ? field.onChange([...currentValue, module.id])
                                                  : field.onChange(
                                                      currentValue.filter(
                                                        (value: string) => value !== module.id
                                                      )
                                                    )
                                              }}
                                              data-testid={`checkbox-optional-${module.id}`}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-normal">
                                              {module.name}
                                            </FormLabel>
                                            <p className="text-xs text-gray-500">
                                              {module.description}
                                            </p>
                                          </div>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-step">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 4: School Configuration */}
                {currentStep === 4 && (
                  <Form {...configForm}>
                    <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-6">
                      <div className="text-center mb-6">
                        <School className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">School Configuration</h3>
                        <p className="text-gray-600">Set up your school's operational settings</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={configForm.control}
                          name="currentSession"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Current Academic Session *
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2024-2025" data-testid="input-session" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="sessionStartMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Start Month *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-start-month">
                                    <SelectValue placeholder="Select month" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="january">January</SelectItem>
                                  <SelectItem value="february">February</SelectItem>
                                  <SelectItem value="march">March</SelectItem>
                                  <SelectItem value="april">April</SelectItem>
                                  <SelectItem value="may">May</SelectItem>
                                  <SelectItem value="june">June</SelectItem>
                                  <SelectItem value="july">July</SelectItem>
                                  <SelectItem value="august">August</SelectItem>
                                  <SelectItem value="september">September</SelectItem>
                                  <SelectItem value="october">October</SelectItem>
                                  <SelectItem value="november">November</SelectItem>
                                  <SelectItem value="december">December</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="sessionEndMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session End Month *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-end-month">
                                    <SelectValue placeholder="Select month" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="january">January</SelectItem>
                                  <SelectItem value="february">February</SelectItem>
                                  <SelectItem value="march">March</SelectItem>
                                  <SelectItem value="april">April</SelectItem>
                                  <SelectItem value="may">May</SelectItem>
                                  <SelectItem value="june">June</SelectItem>
                                  <SelectItem value="july">July</SelectItem>
                                  <SelectItem value="august">August</SelectItem>
                                  <SelectItem value="september">September</SelectItem>
                                  <SelectItem value="october">October</SelectItem>
                                  <SelectItem value="november">November</SelectItem>
                                  <SelectItem value="december">December</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="gradingSystem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grading System *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-grading">
                                    <SelectValue placeholder="Select grading system" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                                  <SelectItem value="gpa">GPA (0.0-4.0)</SelectItem>
                                  <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-currency">
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Language *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-language">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="English">English</SelectItem>
                                  <SelectItem value="Spanish">Spanish</SelectItem>
                                  <SelectItem value="French">French</SelectItem>
                                  <SelectItem value="Hindi">Hindi</SelectItem>
                                  <SelectItem value="Mandarin">Mandarin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={configForm.control}
                          name="schoolTimings.startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School Start Time *</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} data-testid="input-start-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={configForm.control}
                          name="schoolTimings.endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School End Time *</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} data-testid="input-end-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={configForm.control}
                        name="workingDays"
                        render={() => (
                          <FormItem>
                            <FormLabel>Working Days *</FormLabel>
                            <div className="flex flex-wrap gap-4">
                              {[
                                { id: "monday", label: "Monday" },
                                { id: "tuesday", label: "Tuesday" },
                                { id: "wednesday", label: "Wednesday" },
                                { id: "thursday", label: "Thursday" },
                                { id: "friday", label: "Friday" },
                                { id: "saturday", label: "Saturday" },
                                { id: "sunday", label: "Sunday" },
                              ].map((day) => (
                                <FormField
                                  key={day.id}
                                  control={configForm.control}
                                  name="workingDays"
                                  render={({ field }) => {
                                    return (
                                      <FormItem 
                                        key={day.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(day.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, day.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value: string) => value !== day.id
                                                    )
                                                  )
                                            }}
                                            data-testid={`checkbox-${day.id}`}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {day.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-step">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 5: Data Upload */}
                {currentStep === 5 && (
                  <Form {...dataForm}>
                    <form onSubmit={dataForm.handleSubmit(onDataSubmit)} className="space-y-6">
                      <div className="text-center mb-6">
                        <Upload className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Data Upload</h3>
                        <p className="text-gray-600">Upload existing data to get your school up and running quickly</p>
                      </div>
                      
                      <div className="space-y-6">
                        <FormField
                          control={dataForm.control}
                          name="studentDataFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Student Data (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <div className="text-center">
                                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <Button variant="outline" type="button" data-testid="button-student-data">
                                      Upload Student Data
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-2">Excel/CSV format with student information</p>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Upload a file containing student names, roll numbers, classes, and contact information
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={dataForm.control}
                          name="teacherDataFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Teacher Data (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <div className="text-center">
                                    <GraduationCap className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <Button variant="outline" type="button" data-testid="button-teacher-data">
                                      Upload Teacher Data
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-2">Excel/CSV format with teacher information</p>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Upload a file containing teacher names, subjects, qualifications, and contact information
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={dataForm.control}
                          name="academicDataFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Academic Data (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <div className="text-center">
                                    <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <Button variant="outline" type="button" data-testid="button-academic-data">
                                      Upload Academic Data
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-2">Excel/CSV format with academic information</p>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Upload a file containing class schedules, subjects, syllabus, and academic calendar
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={dataForm.control}
                          name="skipDataUpload"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-skip-upload"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Skip data upload for now
                                </FormLabel>
                                <FormDescription>
                                  You can upload data later from the admin dashboard
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-next-step">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 6: Complete */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Review & Complete</h3>
                      <p className="text-gray-600">Please review all information before finalizing the onboarding</p>
                    </div>
                    
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p><strong>School:</strong> {basicForm.getValues().name}</p>
                          <p><strong>Code:</strong> {basicForm.getValues().code}</p>
                          <p><strong>Type:</strong> {basicForm.getValues().schoolType}</p>
                          <p><strong>Board:</strong> {basicForm.getValues().board}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Selected Modules</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <div className="flex flex-wrap gap-2">
                            {[...modulesForm.getValues().coreModules, ...modulesForm.getValues().optionalModules].map((module) => (
                              <Badge key={module} variant="outline">{module.replace('_', ' ')}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p><strong>Session:</strong> {configForm.getValues().currentSession}</p>
                          <p><strong>Grading:</strong> {configForm.getValues().gradingSystem}</p>
                          <p><strong>Working Days:</strong> {configForm.getValues().workingDays.length} days</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleFinalSubmit} 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={onboardMutation.isPending}
                        data-testid="button-complete-onboarding"
                      >
                        {onboardMutation.isPending ? "Processing..." : "Complete Onboarding"}
                        <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}