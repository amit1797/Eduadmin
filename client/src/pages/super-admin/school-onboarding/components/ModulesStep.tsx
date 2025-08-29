import React from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { modulesSchema } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings2, ArrowLeft, ArrowRight } from "lucide-react";

export type ModulesValues = z.infer<typeof modulesSchema>;

export type ModuleDef = { id: string; name: string; description: string };

export function ModulesStep(props: {
  form: UseFormReturn<ModulesValues>;
  onSubmit: (data: ModulesValues) => void;
  onPrev: () => void;
  coreModules: ModuleDef[];
  optionalModules: ModuleDef[];
}) {
  const { form, onSubmit, onPrev, coreModules, optionalModules } = props;

  // Watch arrays once
  const watchedCore = (useWatch({ control: form.control, name: "coreModules" }) || []) as string[];
  const watchedOptional = (useWatch({ control: form.control, name: "optionalModules" }) || []) as string[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <Settings2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select Modules</h3>
          <p className="text-gray-600">Choose the modules your school needs to manage operations</p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-4 text-blue-600">Core Modules (Required)</h4>
          <FormField
            control={form.control}
            name="coreModules"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coreModules.map((module) => (
                    <FormField
                      key={module.id}
                      control={form.control}
                      name="coreModules"
                      render={({ field }) => {
                        return (
                          <FormItem 
                            key={module.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={watchedCore.includes(module.id)}
                                onCheckedChange={(checked) => {
                                  const isChecked = checked === true;
                                  const cur = form.getValues("coreModules") || [];
                                  const next = isChecked
                                    ? Array.from(new Set([...(cur as string[]), module.id]))
                                    : (cur as string[]).filter((v: string) => v !== module.id);
                                  form.setValue("coreModules", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
                        );
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
            control={form.control}
            name="optionalModules"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionalModules.map((module) => (
                    <FormField
                      key={module.id}
                      control={form.control}
                      name="optionalModules"
                      render={({ field }) => {
                        return (
                          <FormItem 
                            key={module.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={watchedOptional.includes(module.id)}
                                onCheckedChange={(checked) => {
                                  const isChecked = checked === true;
                                  const cur = form.getValues("optionalModules") || [];
                                  const next = isChecked
                                    ? Array.from(new Set([...(cur as string[]), module.id]))
                                    : (cur as string[]).filter((v: string) => v !== module.id);
                                  form.setValue("optionalModules", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
                        );
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
