import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Settings as SettingsIcon, Save, Shield, Mail, Database, Bell, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const generalSettingsSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  supportEmail: z.string().email("Valid email is required"),
  supportPhone: z.string().min(1, "Support phone is required"),
  maintenanceMode: z.boolean(),
  allowNewSignups: z.boolean(),
  defaultTimeZone: z.string().min(1, "Time zone is required"),
  defaultCurrency: z.string().min(1, "Currency is required"),
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  fromEmail: z.string().email("Valid email is required"),
  fromName: z.string().min(1, "From name is required"),
});

const securitySettingsSchema = z.object({
  sessionTimeout: z.string().min(1, "Session timeout is required"),
  passwordMinLength: z.string().min(1, "Password minimum length is required"),
  requireTwoFactor: z.boolean(),
  allowPasswordReset: z.boolean(),
  loginAttempts: z.string().min(1, "Login attempts limit is required"),
});

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/super-admin/settings"],
    queryFn: () => superAdminApi.getSettings()
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updateSettings(data),
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/settings"] });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  });

  // Mock settings data (replace with real data)
  const mockSettings = {
    general: {
      platformName: "EduManage Pro",
      supportEmail: "support@edumanage.com",
      supportPhone: "+1 (555) 123-4567",
      maintenanceMode: false,
      allowNewSignups: true,
      defaultTimeZone: "UTC-5",
      defaultCurrency: "USD",
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUsername: "noreply@edumanage.com",
      smtpPassword: "••••••••",
      fromEmail: "noreply@edumanage.com",
      fromName: "EduManage Pro",
    },
    security: {
      sessionTimeout: "24",
      passwordMinLength: "8",
      requireTwoFactor: false,
      allowPasswordReset: true,
      loginAttempts: "5",
    },
  };

  const generalForm = useForm({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general || mockSettings.general
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: settings?.email || mockSettings.email
  });

  const securityForm = useForm({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings?.security || mockSettings.security
  });

  const onGeneralSubmit = (data: any) => {
    updateSettingsMutation.mutate({ type: "general", data });
  };

  const onEmailSubmit = (data: any) => {
    updateSettingsMutation.mutate({ type: "email", data });
  };

  const onSecuritySubmit = (data: any) => {
    updateSettingsMutation.mutate({ type: "security", data });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Settings" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Platform Settings" />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="mr-3 h-6 w-6" />
                Platform Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure global platform settings and preferences
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center" data-testid="tab-general">
                  <Globe className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center" data-testid="tab-email">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center" data-testid="tab-security">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center" data-testid="tab-notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...generalForm}>
                      <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={generalForm.control}
                            name="platformName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Platform Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-platform-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="supportEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Support Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} data-testid="input-support-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="supportPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Support Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-support-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="defaultTimeZone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Time Zone</FormLabel>
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
                          
                          <FormField
                            control={generalForm.control}
                            name="defaultCurrency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Currency</FormLabel>
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
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={generalForm.control}
                            name="maintenanceMode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Maintenance Mode</FormLabel>
                                  <FormDescription>
                                    Enable maintenance mode to prevent users from accessing the platform
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-maintenance-mode"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={generalForm.control}
                            name="allowNewSignups"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Allow New Signups</FormLabel>
                                  <FormDescription>
                                    Allow new schools to register for the platform
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-allow-signups"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={updateSettingsMutation.isPending}
                            data-testid="button-save-general"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={emailForm.control}
                            name="smtpHost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-smtp-host" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="smtpPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Port</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-smtp-port" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="smtpUsername"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Username</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-smtp-username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="smtpPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} data-testid="input-smtp-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="fromEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} data-testid="input-from-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="fromName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-from-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={updateSettingsMutation.isPending}
                            data-testid="button-save-email"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={securityForm.control}
                            name="sessionTimeout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Session Timeout (hours)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} data-testid="input-session-timeout" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="passwordMinLength"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Password Length</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} data-testid="input-password-length" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="loginAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Login Attempts</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} data-testid="input-login-attempts" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={securityForm.control}
                            name="requireTwoFactor"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Require Two-Factor Authentication</FormLabel>
                                  <FormDescription>
                                    Require all users to enable two-factor authentication
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-two-factor"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="allowPasswordReset"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Allow Password Reset</FormLabel>
                                  <FormDescription>
                                    Allow users to reset their passwords via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-password-reset"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={updateSettingsMutation.isPending}
                            data-testid="button-save-security"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">System Notifications</h3>
                        
                        <div className="space-y-4">
                          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <div className="text-base font-medium">New School Registration</div>
                              <div className="text-sm text-gray-500">
                                Notify when a new school registers on the platform
                              </div>
                            </div>
                            <Switch defaultChecked data-testid="switch-new-school" />
                          </div>
                          
                          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <div className="text-base font-medium">Payment Received</div>
                              <div className="text-sm text-gray-500">
                                Notify when payments are received from schools
                              </div>
                            </div>
                            <Switch defaultChecked data-testid="switch-payment-received" />
                          </div>
                          
                          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <div className="text-base font-medium">Support Tickets</div>
                              <div className="text-sm text-gray-500">
                                Notify when new support tickets are created
                              </div>
                            </div>
                            <Switch defaultChecked data-testid="switch-support-tickets" />
                          </div>
                          
                          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <div className="text-base font-medium">System Errors</div>
                              <div className="text-sm text-gray-500">
                                Notify when critical system errors occur
                              </div>
                            </div>
                            <Switch defaultChecked data-testid="switch-system-errors" />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-notifications">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}