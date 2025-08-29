import { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

type ExtraCrumb = { label: string; href?: string };

export interface PageLayoutProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  sidebar: {
    userRole: string;
    schoolId?: string;
  };
  breadcrumbs?: {
    labelMap?: Record<string, string>;
    hideSegments?: string[];
    extra?: ExtraCrumb[];
  };
  children: ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  showAddButton,
  addButtonText,
  onAddClick,
  sidebar,
  breadcrumbs,
  children,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        title={title}
        subtitle={subtitle}
        showAddButton={showAddButton}
        addButtonText={addButtonText}
        onAddClick={onAddClick}
      />
      <div className="flex">
        <Sidebar userRole={sidebar.userRole} schoolId={sidebar.schoolId} />
        <div className="flex-1 p-6">
          <div className="mb-4">
            <Breadcrumbs
              labelMap={breadcrumbs?.labelMap}
              hideSegments={breadcrumbs?.hideSegments}
              extra={breadcrumbs?.extra}
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
