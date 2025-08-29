import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { dataUploadSchema } from "../schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Upload, Users, GraduationCap, BookOpen, ArrowLeft, ArrowRight } from "lucide-react";

export type DataUploadValues = z.infer<typeof dataUploadSchema>;

export function DataUploadStep(props: {
  form: UseFormReturn<DataUploadValues>;
  onSubmit: (data: DataUploadValues) => void;
  onPrev: () => void;
}) {
  const { form, onSubmit, onPrev } = props;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <Upload className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Data Upload</h3>
          <p className="text-gray-600">Upload existing data to get your school up and running quickly</p>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="studentDataFile"
            render={() => (
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
            control={form.control}
            name="teacherDataFile"
            render={() => (
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
            control={form.control}
            name="academicDataFile"
            render={() => (
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
            control={form.control}
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
