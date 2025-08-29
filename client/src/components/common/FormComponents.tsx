import React, { useState } from 'react';
import { useForm, Controller, FieldError, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from './LoadingStates';
import { cn } from '@/lib/utils';
import { FormFieldProps } from '@/types';

// Enhanced form field component
interface FormFieldComponentProps extends FormFieldProps {
  control: any;
  error?: FieldError;
  className?: string;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  options = [],
  control,
  error,
  className
}: FormFieldComponentProps) {
  const [showPassword, setShowPassword] = useState(false);

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={cn(error && 'border-red-500')}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={placeholder}
                className={cn(error && 'border-red-500')}
                rows={4}
              />
            )}
          />
        );

      case 'password':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={placeholder}
                  className={cn(error && 'border-red-500', 'pr-10')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          />
        );

      default:
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={cn(error && 'border-red-500')}
              />
            )}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

// Generic form wrapper
interface FormWrapperProps<T extends z.ZodSchema> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  defaultValues?: Partial<z.infer<T>>;
  children: (props: {
    control: any;
    errors: any;
    isSubmitting: boolean;
    reset: () => void;
  }) => React.ReactNode;
  className?: string;
}

export function FormWrapper<T extends z.ZodSchema>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className
}: FormWrapperProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: (defaultValues as DefaultValues<z.infer<T>>) || undefined
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {children({ control, errors, isSubmitting, reset })}
    </form>
  );
}

// Modal form component
interface ModalFormProps<T extends z.ZodSchema> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  defaultValues?: Partial<z.infer<T>>;
  fields: FormFieldProps[];
  submitText?: string;
  cancelText?: string;
}

export function ModalForm<T extends z.ZodSchema>({
  isOpen,
  onClose,
  title,
  schema,
  onSubmit,
  defaultValues,
  fields,
  submitText = 'Save',
  cancelText = 'Cancel'
}: ModalFormProps<T>) {
  if (!isOpen) return null;

  const handleSubmit = async (data: z.infer<T>) => {
    try {
      await Promise.resolve(onSubmit(data));
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        <FormWrapper
          schema={schema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          {({ control, errors, isSubmitting }) => (
            <div className="space-y-4">
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  control={control}
                  error={errors[field.name]}
                />
              ))}
              
              <div className="flex space-x-2 pt-4">
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {submitText}
                </LoadingButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {cancelText}
                </Button>
              </div>
            </div>
          )}
        </FormWrapper>
      </div>
    </div>
  );
}

// Card form component
interface CardFormProps<T extends z.ZodSchema> {
  title: string;
  description?: string;
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  defaultValues?: Partial<z.infer<T>>;
  fields: FormFieldProps[];
  submitText?: string;
  className?: string;
}

export function CardForm<T extends z.ZodSchema>({
  title,
  description,
  schema,
  onSubmit,
  defaultValues,
  fields,
  submitText = 'Save',
  className
}: CardFormProps<T>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent>
        <FormWrapper
          schema={schema}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
        >
          {({ control, errors, isSubmitting, reset }) => (
            <div className="space-y-4">
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  control={control}
                  error={errors[field.name]}
                />
              ))}
              
              <div className="flex space-x-2 pt-4">
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                >
                  {submitText}
                </LoadingButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </FormWrapper>
      </CardContent>
    </Card>
  );
}

// Validation schemas for common forms
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  schoolCode: z.string().optional()
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'school_admin', 'sub_school_admin', 'teacher', 'student', 'parent']),
  schoolId: z.string().optional()
});

export const createStudentSchema = z.object({
  userData: createUserSchema.omit({ role: true }).extend({
    role: z.literal('student')
  }),
  studentData: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    classId: z.string().optional(),
    admissionDate: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional()
  })
});

export const createTeacherSchema = z.object({
  userData: createUserSchema.omit({ role: true }).extend({
    role: z.literal('teacher')
  }),
  teacherData: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    department: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.number().optional(),
    specialization: z.string().optional(),
    joiningDate: z.string().optional(),
    salary: z.number().optional()
  })
});

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  classTeacherId: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY')
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().optional()
});
