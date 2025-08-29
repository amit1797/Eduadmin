import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { basicDetailsSchema } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, UserCheck, ArrowRight } from "lucide-react";

export type BasicDetailsValues = z.infer<typeof basicDetailsSchema>;

export function BasicDetailsStep(props: {
  form: UseFormReturn<BasicDetailsValues>;
  onSubmit: (data: BasicDetailsValues) => void;
}) {
  const { form, onSubmit } = props;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
          control={form.control}
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
  );
}
