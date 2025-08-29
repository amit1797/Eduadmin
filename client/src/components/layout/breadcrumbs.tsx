import { Link, useLocation } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/lib/routes";

type ExtraCrumb = { label: string; href?: string };
type BreadcrumbsProps = {
  extra?: ExtraCrumb[];
  labelMap?: Record<string, string>; // override labels for specific segments
  hideSegments?: string[]; // hide specific path segments from trail
};

export function Breadcrumbs({ extra, labelMap, hideSegments = [] }: BreadcrumbsProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const dashboardPath = routes.dashboardFor(user ?? undefined);

  const isDashboard = location === dashboardPath;
  if (isDashboard) return null;

  const breadcrumb = (() => {
    const parts = location.split("/").filter(Boolean);
    const items: { label: string; href: string }[] = [];
    let path = "";
    const skipFirst = parts[1] === "admin" ? 1 : 0; // skip schoolId in labels when path starts with /:schoolId/admin
    parts.forEach((p, idx) => {
      path += `/${p}`;
      if (idx === 0 && skipFirst === 1) return;
      if (hideSegments.includes(p)) return;
      const base = labelMap?.[p] ?? p.replace(/-/g, " ");
      const label = base.replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({ label, href: path });
    });
    return items;
  })();

  return (
    <div className="px-6 pt-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={dashboardPath}>
          <button className="inline-flex items-center gap-1 text-blue-600 hover:underline" data-testid="button-back-to-dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1">
            {breadcrumb.map((b, idx) => (
              <span key={b.href} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-300" />
                {idx < breadcrumb.length - 1 ? (
                  <Link href={b.href} className="hover:underline text-gray-600">{b.label}</Link>
                ) : (
                  <span className="text-gray-800 font-medium">{b.label}</span>
                )}
              </span>
            ))}
            {Array.isArray(extra) && extra.length > 0 && extra.map((e, idx) => (
              <span key={`${e.href || e.label}-${idx}`} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-300" />
                {idx < extra.length - 1 ? (
                  e.href ? (
                    <Link href={e.href} className="hover:underline text-gray-600">{e.label}</Link>
                  ) : (
                    <span className="text-gray-600">{e.label}</span>
                  )
                ) : (
                  <span className="text-gray-800 font-medium">{e.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
