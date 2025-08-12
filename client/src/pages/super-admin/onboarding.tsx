import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  FileText, 
  Settings, 
  Upload, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Image
} from "lucide-react";

const basicDetailsSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().min(3, "School code must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid principal email is required"),
  website: z.string().optional(),
  description: z.string().optional(),
});

const documentsSchema = z.object({
  registrationCertificate: z.boolean().refine(val => val, "Registration certificate is required"),
  taxExemptionCertificate: z.boolean().optional(),
  affiliationCertificate: z.boolean().refine(val => val, "Affiliation certificate is required"),
  buildingPlan: z.boolean().optional(),
  fireSafetyCertificate: z.boolean().optional(),
});

const modulesSchema = z.object({
  coreModules: z.array(z.string()).min(1, "At least one core module must be selected"),
  optionalModules: z.array(z.string()).optional(),
});

const configurationSchema = z.object({
  currentSession: z.string().min(1, "Current session is required"),
  sessionStartMonth: z.string().min(1, "Session start month is required"),
  gradeSystem: z.string().min(1, "Grade system is required"),
  currency: z.string().min(1, "Currency is required"),
  timeZone: z.string().min(1, "Time zone is required"),
  workingDays: z.array(z.string()).min(1, "At least one working day must be selected"),
  schoolTimings: z.object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  }),
});

const STEPS = [
  { id: 1, title: "Basic Details", icon: Building2 },
  { id: 2, title: "Documents", icon: FileText },
  { id: 3, title: "Module Selection", icon: Settings },
  { id: 4, title: "Configuration", icon: Settings },
  { id: 5, title: "Data Upload", icon: Upload },
];

const CORE_MODULES = [
  { id: "student_management", name: "Student Management", description: "Manage student profiles, enrollment, and records" },
  { id: "teacher_management", name: "Teacher Management", description: "Manage teacher profiles and assignments" },
  { id: "class_management", name: "Class Management", description: "Organize classes, sections, and subjects" },
  { id: "attendance_management", name: "Attendance Management", description: "Track daily attendance for students and staff" },
  { id: "academics_management", name: "Academics Management", description: "Manage curriculum, syllabus, and academic calendar" },
  { id: "test_result_management", name: "Test & Result Management", description: "Create exams, assignments, and manage results" },
];

const OPTIONAL_MODULES = [
  { id: "library_management", name: "Library Management", description: "Manage books, issuing, and library operations" },
  { id: "transport_management", name: "Transport Management", description: "Manage school buses, routes, and transportation" },
  { id: "payroll_management", name: "Payroll Management", description: "Handle staff salaries and payroll processing" },
  { id: "accounts_management", name: "Accounts Management", description: "Financial management and accounting" },
  { id: "notification_management", name: "Notification Management", description: "Send notifications via SMS, email, and app" },
  { id: "event_management", name: "Event Management", description: "Organize and manage school events and activities" },
];

export default function SchoolOnboarding() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  const basicForm = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: formData.basicDetails || {}
  });

  const documentsForm = useForm({
    resolver: zodResolver(documentsSchema),
    defaultValues: formData.documents || {}
  });

  const modulesForm = useForm({
    resolver: zodResolver(modulesSchema),
    defaultValues: {
      coreModules: formData.modules?.coreModules || [],
      optionalModules: formData.modules?.optionalModules || []
    }
  });

  const configForm = useForm({
    resolver: zodResolver(configurationSchema),
    defaultValues: formData.configuration || {
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      schoolTimings: { startTime: "08:00", endTime: "15:00" }
    }
  });

  const onboardSchoolMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.onboardSchool(data),
    onSuccess: () => {
      toast({ title: "School onboarded successfully!" });
      // Navigate to schools page
    },
    onError: () => {
      toast({ title: "Failed to onboard school", variant: "destructive" });
    }
  });

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onBasicDetailsSubmit = (data: any) => {
    setFormData({ ...formData, basicDetails: data });
    nextStep();
  };

  const onDocumentsSubmit = (data: any) => {
    setFormData({ ...formData, documents: data });
    nextStep();
  };

  const onModulesSubmit = (data: any) => {
    setFormData({ ...formData, modules: data });
    nextStep();
  };

  const onConfigurationSubmit = (data: any) => {
    setFormData({ ...formData, configuration: data });
    nextStep();
  };

  const onFinalSubmit = () => {
    onboardSchoolMutation.mutate(formData);
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="School Onboarding" />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Step {currentStep} of {STEPS.length}</h2>
                  <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center ${step.id < STEPS.length ? 'flex-1' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        <div 
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2
                            ${isCompleted ? 'bg-green-100 border-green-500 text-green-700' :
                              isCurrent ? 'bg-blue-100 border-blue-500 text-blue-700' :
                              'bg-gray-100 border-gray-300 text-gray-400'}
                          `}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs mt-1 ${isCurrent ? 'font-medium' : 'text-gray-500'}`}>
                          {step.title}
                        </span>
                      </div>
                      {step.id < STEPS.length && (
                        <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {React.createElement(STEPS[currentStep - 1].icon, { className: "w-6 h-6 mr-2" })}
                {STEPS[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <Form {...basicForm}>
                  <form onSubmit={basicForm.handleSubmit(onBasicDetailsSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={basicForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter school name" {...field} data-testid="input-school-name" />
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
                              <Input placeholder="e.g., SPS001" {...field} data-testid="input-school-code" />
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
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input placeholder="school@example.com" className="pl-10" {...field} data-testid="input-school-email" />
                              </div>
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
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} data-testid="input-school-phone" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={basicForm.control}
                        name="principalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter principal name" {...field} data-testid="input-principal-name" />
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
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input placeholder="principal@example.com" className="pl-10" {...field} data-testid="input-principal-email" />
                              </div>
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
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://school.example.com" {...field} data-testid="input-school-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={basicForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Textarea 
                                placeholder="Enter complete address" 
                                className="pl-10 resize-none" 
                                rows={3}
                                {...field} 
                                data-testid="textarea-school-address"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={basicForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description about the school" 
                              className="resize-none" 
                              rows={3}
                              {...field} 
                              data-testid="textarea-school-description"
                            />
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
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Please upload the required documents. All mandatory documents must be provided to complete the onboarding process.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={documentsForm.control}
                          name="registrationCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-registration-certificate"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Registration Certificate *
                                </FormLabel>
                                <p className="text-xs text-gray-500">
                                  Government registration certificate for the school
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentsForm.control}
                          name="affiliationCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-affiliation-certificate"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Affiliation Certificate *
                                </FormLabel>
                                <p className="text-xs text-gray-500">
                                  Board affiliation certificate (CBSE/ICSE/State Board)
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentsForm.control}
                          name="taxExemptionCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-tax-exemption"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Tax Exemption Certificate
                                </FormLabel>
                                <p className="text-xs text-gray-500">
                                  Tax exemption certificate (if applicable)
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentsForm.control}
                          name="fireSafetyCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-fire-safety"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Fire Safety Certificate
                                </FormLabel>
                                <p className="text-xs text-gray-500">
                                  Fire safety certificate from local authorities
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </Button>
                              </div>
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
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Core Modules (Required)</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          These modules are essential for basic school operations and are included by default.
                        </p>
                        <FormField
                          control={modulesForm.control}
                          name="coreModules"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CORE_MODULES.map((module) => (
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
                                              data-testid={`checkbox-${module.id}`}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-medium">
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

                      <div>
                        <h3 className="text-lg font-medium mb-4">Optional Modules</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Select additional modules based on your school's specific requirements.
                        </p>
                        <FormField
                          control={modulesForm.control}
                          name="optionalModules"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {OPTIONAL_MODULES.map((module) => (
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
                                              checked={field.value?.includes(module.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), module.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value: string) => value !== module.id
                                                      )
                                                    )
                                              }}
                                              data-testid={`checkbox-${module.id}`}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-medium">
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

              {/* Step 4: Configuration */}
              {currentStep === 4 && (
                <Form {...configForm}>
                  <form onSubmit={configForm.handleSubmit(onConfigurationSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={configForm.control}
                        name="currentSession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Academic Session *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-current-session">
                                  <SelectValue placeholder="Select current session" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2024-25">2024-25</SelectItem>
                                <SelectItem value="2025-26">2025-26</SelectItem>
                                <SelectItem value="2026-27">2026-27</SelectItem>
                              </SelectContent>
                            </Select>
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
                                <SelectTrigger data-testid="select-session-start-month">
                                  <SelectValue placeholder="Select start month" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="april">April</SelectItem>
                                <SelectItem value="june">June</SelectItem>
                                <SelectItem value="july">July</SelectItem>
                                <SelectItem value="january">January</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="gradeSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade System *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-grade-system">
                                  <SelectValue placeholder="Select grade system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                                <SelectItem value="gpa">GPA (0-4.0)</SelectItem>
                                <SelectItem value="cgpa">CGPA (0-10.0)</SelectItem>
                                <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
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
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="timeZone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Zone *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-timezone">
                                  <SelectValue placeholder="Select time zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                                <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                                <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                                <SelectItem value="UTC+5:30">India Standard Time (UTC+5:30)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-6">
                  <div className="text-center">
                    <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">School Setup Complete!</h3>
                    <p className="text-gray-600 mb-6">
                      Your school has been successfully onboarded. You can now upload initial data to get started.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center p-6">
                      <Upload className="mx-auto h-8 w-8 text-blue-600 mb-3" />
                      <h4 className="font-medium mb-2">Student Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Upload student information via CSV file</p>
                      <Button variant="outline" size="sm" data-testid="button-upload-students">
                        Upload Students
                      </Button>
                    </Card>
                    
                    <Card className="text-center p-6">
                      <Upload className="mx-auto h-8 w-8 text-green-600 mb-3" />
                      <h4 className="font-medium mb-2">Teacher Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Upload teacher information via CSV file</p>
                      <Button variant="outline" size="sm" data-testid="button-upload-teachers">
                        Upload Teachers
                      </Button>
                    </Card>
                    
                    <Card className="text-center p-6">
                      <Upload className="mx-auto h-8 w-8 text-purple-600 mb-3" />
                      <h4 className="font-medium mb-2">Academic Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Upload subjects, classes, and curriculum</p>
                      <Button variant="outline" size="sm" data-testid="button-upload-academic">
                        Upload Academic Data
                      </Button>
                    </Card>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button 
                      onClick={onFinalSubmit} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={onboardSchoolMutation.isPending}
                      data-testid="button-complete-onboarding"
                    >
                      {onboardSchoolMutation.isPending ? "Processing..." : "Complete Onboarding"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}