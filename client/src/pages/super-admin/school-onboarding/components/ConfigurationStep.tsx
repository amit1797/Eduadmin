import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { configurationSchema } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { School, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

export type ConfigurationValues = z.infer<typeof configurationSchema>;

export function ConfigurationStep(props: {
  form: UseFormReturn<ConfigurationValues>;
  onSubmit: (data: ConfigurationValues) => void;
  onPrev: () => void;
}) {
  const { form, onSubmit, onPrev } = props;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <School className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">School Configuration</h3>
          <p className="text-gray-600">Set up your school's operational settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
                    {[
                      "january","february","march","april","may","june","july","august","september","october","november","december"
                    ].map(m => (
                      <SelectItem key={m} value={m}>{m[0].toUpperCase()+m.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
                    {[
                      "january","february","march","april","may","june","july","august","september","october","november","december"
                    ].map(m => (
                      <SelectItem key={m} value={m}>{m[0].toUpperCase()+m.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
                    {[
                      "English","Spanish","French","Hindi","Mandarin"
                    ].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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
                    control={form.control}
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
                                  ? field.onChange([...(field.value || []), day.id])
                                  : field.onChange((field.value || []).filter((v: string) => v !== day.id));
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
          <Button variant="outline" onClick={onPrev} data-testid="button-prev-step" type="button">
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
  );
}
