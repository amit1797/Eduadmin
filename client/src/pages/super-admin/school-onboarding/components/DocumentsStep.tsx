import React, { useRef } from "react";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { documentsSchema } from "../schemas";
import type { UseFormReturn } from "react-hook-form";

export type DocumentsFormValues = z.infer<typeof documentsSchema>;

export function DocumentsStep(props: {
  form: UseFormReturn<DocumentsFormValues>;
  onSubmit: (data: DocumentsFormValues) => void;
  onPrev: () => void;
  onUpload: (field: keyof DocumentsFormValues, file: File) => Promise<void>;
}) {
  const { form, onSubmit, onPrev, onUpload } = props;

  const regCertRef = useRef<HTMLInputElement>(null);
  const taxCertRef = useRef<HTMLInputElement>(null);
  const affCertRef = useRef<HTMLInputElement>(null);
  const nocRef = useRef<HTMLInputElement>(null);
  const auditRef = useRef<HTMLInputElement>(null);

  const handleChoose = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click();

  // Watch current URLs to render previews
  const regUrl = form.watch("registrationCertificate");
  const taxUrl = form.watch("taxCertificate");
  const affUrl = form.watch("affiliationCertificate");
  const nocUrl = form.watch("noCertificate");
  const auditUrl = form.watch("auditReport");

  const isImage = (url: string | undefined) => !!url && /(png|jpe?g|gif|webp)$/i.test(url.split('?')[0] || "");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Required Documents</h3>
          <p className="text-gray-600">Please upload the following documents for verification</p>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="registrationCertificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  School Registration Certificate *
                </FormLabel>
                <FormControl>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      ref={regCertRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      data-testid="file-registration-cert"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) await onUpload("registrationCertificate", f);
                      }}
                    />
                    {regUrl ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          {isImage(regUrl) ? (
                            <img src={regUrl} alt="registration preview" className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-500" />
                          )}
                          <div>
                            <a href={regUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Preview uploaded file
                            </a>
                            <p className="text-xs text-gray-500">Change if incorrect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" type="button" onClick={() => handleChoose(regCertRef)}>
                            Reupload
                          </Button>
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                              form.setValue("registrationCertificate", "", { shouldDirty: true, shouldValidate: true });
                              if (regCertRef.current) regCertRef.current.value = "";
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Button variant="outline" type="button" onClick={() => handleChoose(regCertRef)}>
                          Choose File
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxCertificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Tax Exemption Certificate *
                </FormLabel>
                <FormControl>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      ref={taxCertRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) await onUpload("taxCertificate", f);
                      }}
                    />
                    {taxUrl ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          {isImage(taxUrl) ? (
                            <img src={taxUrl} alt="tax certificate preview" className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-500" />
                          )}
                          <div>
                            <a href={taxUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Preview uploaded file
                            </a>
                            <p className="text-xs text-gray-500">Change if incorrect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" type="button" onClick={() => handleChoose(taxCertRef)} data-testid="button-tax-cert">
                            Reupload
                          </Button>
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                              form.setValue("taxCertificate", "", { shouldDirty: true, shouldValidate: true });
                              if (taxCertRef.current) taxCertRef.current.value = "";
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Button variant="outline" type="button" data-testid="button-tax-cert" onClick={() => handleChoose(taxCertRef)}>
                          Choose File
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affiliationCertificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Board Affiliation Certificate *
                </FormLabel>
                <FormControl>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      ref={affCertRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) await onUpload("affiliationCertificate", f);
                      }}
                    />
                    {affUrl ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          {isImage(affUrl) ? (
                            <img src={affUrl} alt="affiliation certificate preview" className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-500" />
                          )}
                          <div>
                            <a href={affUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Preview uploaded file
                            </a>
                            <p className="text-xs text-gray-500">Change if incorrect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" type="button" data-testid="button-affiliation-cert" onClick={() => handleChoose(affCertRef)}>
                            Reupload
                          </Button>
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                              form.setValue("affiliationCertificate", "", { shouldDirty: true, shouldValidate: true });
                              if (affCertRef.current) affCertRef.current.value = "";
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Button variant="outline" type="button" data-testid="button-affiliation-cert" onClick={() => handleChoose(affCertRef)}>
                          Choose File
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="noCertificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    No Objection Certificate (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <Input
                        ref={nocRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) await onUpload("noCertificate", f);
                        }}
                      />
                      {nocUrl ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-left">
                            {isImage(nocUrl) ? (
                              <img src={nocUrl} alt="noc preview" className="h-10 w-10 object-cover rounded" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-500" />
                            )}
                            <div>
                              <a href={nocUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                Preview uploaded file
                              </a>
                              <p className="text-xs text-gray-500">Optional</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" type="button" data-testid="button-noc" onClick={() => handleChoose(nocRef)}>
                              Reupload
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              type="button"
                              onClick={() => {
                                form.setValue("noCertificate", "", { shouldDirty: true, shouldValidate: true });
                                if (nocRef.current) nocRef.current.value = "";
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                          <Button variant="outline" size="sm" type="button" data-testid="button-noc" onClick={() => handleChoose(nocRef)}>
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auditReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Latest Audit Report (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <Input
                        ref={auditRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) await onUpload("auditReport", f);
                        }}
                      />
                      {auditUrl ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-left">
                            {isImage(auditUrl) ? (
                              <img src={auditUrl} alt="audit report preview" className="h-10 w-10 object-cover rounded" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-500" />
                            )}
                            <div>
                              <a href={auditUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                Preview uploaded file
                              </a>
                              <p className="text-xs text-gray-500">Optional</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" type="button" data-testid="button-audit-report" onClick={() => handleChoose(auditRef)}>
                              Reupload
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              type="button"
                              onClick={() => {
                                form.setValue("auditReport", "", { shouldDirty: true, shouldValidate: true });
                                if (auditRef.current) auditRef.current.value = "";
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                          <Button variant="outline" size="sm" type="button" data-testid="button-audit-report" onClick={() => handleChoose(auditRef)}>
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
