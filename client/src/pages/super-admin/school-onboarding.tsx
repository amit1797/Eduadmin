import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { onboardingDraftsApi } from "@/lib/api";
import { basicDetailsSchema, documentsSchema, modulesSchema, configurationSchema, dataUploadSchema } from "./school-onboarding/schemas";
import { presignedOrLocalUpload } from "./school-onboarding/upload";
import { DocumentsStep } from "./school-onboarding/components/DocumentsStep";
import { BasicDetailsStep } from "./school-onboarding/components/BasicDetailsStep";
import { ModulesStep } from "./school-onboarding/components/ModulesStep";
import { ConfigurationStep } from "./school-onboarding/components/ConfigurationStep";
import { DataUploadStep } from "./school-onboarding/components/DataUploadStep";
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

// Schemas moved to ./school-onboarding/schemas

export default function SchoolOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Documents step moved into its own component

  const uploadDocument = async (field: keyof z.infer<typeof documentsSchema>, file: File) => {
    const schoolCode = basicForm.getValues().code || "temp";
    const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : "";
    const safeField = String(field);
    // Deterministic key so reuploads overwrite same path
    const key = `schools/${encodeURIComponent(schoolCode)}/onboarding/${safeField}${ext}`;
    try {
      const publicUrl = await presignedOrLocalUpload({ key, file });
      const cacheBusted = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
      documentsForm.setValue(field as any, cacheBusted, { shouldValidate: true, shouldDirty: true });
      // Persist documents to draft immediately to survive refresh
      try {
        if (draftId) {
          await onboardingDraftsApi.patch(draftId, {
            step: 2,
            data: {
              basicDetails: basicForm.getValues(),
              documents: {
                ...(documentsForm.getValues() as any),
                [safeField]: cacheBusted,
              },
            },
          });
        }
      } catch {}
      toast({ title: "Uploaded", description: `${safeField} uploaded successfully.` });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err?.message || "Could not upload file", variant: "destructive" });
    }
  };

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

  // Helper to build draft data object
  const buildDraftData = () => ({
    basicDetails: basicForm.getValues(),
    documents: documentsForm.getValues(),
    modules: modulesForm.getValues(),
    configuration: configForm.getValues(),
    dataUpload: dataForm.getValues(),
  });

  // Parse draftId from query string to resume draft
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qDraftId = params.get("draftId") || undefined;
    if (qDraftId) {
      setDraftId(qDraftId);
      // Load draft and populate forms
      onboardingDraftsApi.get(qDraftId).then((draft) => {
        try {
          const data = draft.data ? JSON.parse(draft.data) : null;
          const step = Number(draft.step || data?.step || 1);
          if (data?.basicDetails) {
            basicForm.reset({ ...basicForm.getValues(), ...data.basicDetails });
          }
          if (data?.documents) {
            documentsForm.reset({ ...documentsForm.getValues(), ...data.documents });
          }
          if (data?.modules) {
            modulesForm.reset({ ...modulesForm.getValues(), ...data.modules });
          }
          if (data?.configuration) {
            configForm.reset({ ...configForm.getValues(), ...data.configuration });
          }
          if (data?.dataUpload) {
            dataForm.reset({ ...dataForm.getValues(), ...data.dataUpload });
          }
          setCurrentStep(Math.max(1, step));
        } catch {
          // ignore parsing errors
        }
      }).catch(() => {
        // ignore fetch errors
      });
    }
  }, []);

  // Watch for document field removals/changes and persist to draft (debounced)
  useEffect(() => {
    const subscription = documentsForm.watch(async () => {
      try {
        if (draftId) {
          await onboardingDraftsApi.patch(draftId, {
            step: 2,
            data: {
              basicDetails: basicForm.getValues(),
              documents: documentsForm.getValues(),
            },
          });
        }
      } catch {
        // non-blocking
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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

  const onBasicSubmit = async (data: any) => {
    try {
      if (!draftId) {
        const created = await onboardingDraftsApi.create({
          schoolCode: data.code,
          step: 1,
          data: { basicDetails: data },
        });
        setDraftId(created.id);
        const url = new URL(window.location.href);
        url.searchParams.set("draftId", created.id);
        setLocation(url.pathname + "?" + url.searchParams.toString());
      } else {
        await onboardingDraftsApi.patch(draftId, {
          step: 1,
          data: { basicDetails: data },
        });
      }
    } catch (e) {
      // Non-blocking; allow continuing even if draft save fails
    }
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

  const handleFinalSubmit = async () => {
    try {
      if (!draftId) {
        // create minimal draft if none exists
        const created = await onboardingDraftsApi.create({
          schoolCode: basicForm.getValues().code,
          step: currentStep,
          data: buildDraftData(),
        });
        setDraftId(created.id);
      } else {
        await onboardingDraftsApi.patch(draftId, { step: currentStep, data: buildDraftData() });
      }
      const id = draftId || (await (async () => {
        const created = await onboardingDraftsApi.create({
          schoolCode: basicForm.getValues().code,
          step: currentStep,
          data: buildDraftData(),
        });
        return created.id;
      })());
      const result = await onboardingDraftsApi.finalize(id);
      toast({ title: "School onboarded successfully!" });
      // Invalidate dashboard data so it's fresh after redirect
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/super-admin/stats"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/super-admin/schools"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/onboarding-drafts"] }),
        ]);
      } catch {}
      setLocation("/super-admin/dashboard?onboarded=1");
    } catch (err: any) {
      toast({ title: "Failed to finalize onboarding", description: err?.message || "", variant: "destructive" });
    }
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
                  <BasicDetailsStep form={basicForm as any} onSubmit={onBasicSubmit as any} />
                )}

                {/* Step 2: Documents */}
                {currentStep === 2 && (
                  <DocumentsStep
                    form={documentsForm as any}
                    onSubmit={onDocumentsSubmit as any}
                    onPrev={prevStep}
                    onUpload={uploadDocument as any}
                  />
                )}

                {/* Step 3: Module Selection */}
                {currentStep === 3 && (
                  <ModulesStep
                    form={modulesForm as any}
                    onSubmit={onModulesSubmit as any}
                    onPrev={prevStep}
                    coreModules={coreModules as any}
                    optionalModules={optionalModules as any}
                  />
                )}

                {/* Step 4: School Configuration */}
                {currentStep === 4 && (
                  <ConfigurationStep
                    form={configForm as any}
                    onSubmit={onConfigSubmit as any}
                    onPrev={prevStep}
                  />
                )}

                {/* Step 5: Data Upload */}
                {currentStep === 5 && (
                  <DataUploadStep
                    form={dataForm as any}
                    onSubmit={onDataSubmit as any}
                    onPrev={prevStep}
                  />
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
                        // No mutation pending state tracked here currently
                        data-testid="button-complete-onboarding"
                      >
                        Complete Onboarding
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