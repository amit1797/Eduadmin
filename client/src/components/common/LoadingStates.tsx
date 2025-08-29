import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Skeleton components for different content types
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Loading spinner components
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
}

// Full page loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Button loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ loading, children, disabled, className, ...props }: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

// Data loading wrapper
interface DataLoadingProps<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  children: (data: T) => React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function DataLoading<T>({
  data,
  loading,
  error,
  children,
  loadingSkeleton,
  errorFallback
}: DataLoadingProps<T>) {
  if (loading) {
    return loadingSkeleton || <TableSkeleton />;
  }

  if (error) {
    return errorFallback || (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return <>{children(data)}</>;
}

// List loading component
export function ListLoading({ 
  items, 
  loading, 
  error, 
  children, 
  emptyMessage = 'No items found',
  loadingRows = 5 
}: {
  items: any[] | null;
  loading: boolean;
  error: Error | null;
  children: (items: any[]) => React.ReactNode;
  emptyMessage?: string;
  loadingRows?: number;
}) {
  if (loading) {
    return <TableSkeleton rows={loadingRows} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children(items)}</>;
}

// Inline loading component for smaller elements
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className, showPercentage = false }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
