import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  Award, 
  Building2, 
  Settings,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { routes } from "@/lib/routes";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles?: string[];
}

interface SidebarProps {
  userRole: string;
  schoolId?: string;
}

export function Sidebar({ userRole, schoolId }: SidebarProps) {
  const [location] = useLocation();
  const r = useMemo(() => routes.schoolAdmin(schoolId), [schoolId]);

  const getSidebarItems = (): SidebarItem[] => {
    // Super Admin: fixed super admin namespace
    if (userRole === "super_admin") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin/dashboard" },
        { icon: Building2, label: "Schools Management", href: "/super-admin/schools" },
        { icon: Users, label: "User Management", href: "/super-admin/users" },
        { icon: FileText, label: "Audit Logs", href: "/super-admin/audit" },
        { icon: Settings, label: "Settings", href: "/super-admin/settings" }
      ];
    }

    // School Admins: dynamic school-scoped namespace
    if (userRole === "school_admin" || userRole === "sub_school_admin") {
      const r = routes.schoolAdmin(schoolId);
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: `${r.root}/dashboard` },
        { icon: Users, label: "Students", href: r.students },
        { icon: GraduationCap, label: "Teachers", href: r.teachers },
        { icon: BookOpen, label: "Classes", href: r.classes },
        // attendance handled as collapsible groups below
        { icon: Award, label: "Academics", href: r.academics },
        { icon: Calendar, label: "Events", href: r.events },
        { icon: FileText, label: "Accounts", href: r.accounts }
      ];
    }

    if (userRole === "teacher") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
        { icon: BookOpen, label: "My Classes", href: "/teacher/classes" },
        { icon: Users, label: "Students", href: "/teacher/students" },
        { icon: ClipboardCheck, label: "Attendance", href: "/teacher/attendance" },
        { icon: Award, label: "Assignments", href: "/teacher/assignments" },
        { icon: Award, label: "Grades", href: "/teacher/grades" },
        { icon: Calendar, label: "Schedule", href: "/teacher/schedule" }
      ];
    }

    // Default minimal
    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" }
    ];
  };

  const sidebarItems = getSidebarItems();

  // Collapsible + Resizable state
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("sidebar:collapsed");
      return v === "1";
    } catch {
      return false;
    }
  });

  const [width, setWidth] = useState<number>(() => {
    try {
      const v = localStorage.getItem("sidebar:width");
      const n = v ? parseInt(v, 10) : 256; // default w-64
      return isNaN(n) ? 256 : Math.min(360, Math.max(200, n));
    } catch {
      return 256;
    }
  });

  useEffect(() => {
    try { localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

  useEffect(() => {
    try { localStorage.setItem("sidebar:width", String(width)); } catch {}
  }, [width]);

  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (collapsed) return;
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const delta = e.clientX - startXRef.current;
    const next = Math.min(360, Math.max(200, startWidthRef.current + delta));
    setWidth(next);
  };

  const onMouseUp = () => {
    isResizingRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  // Compute prefixes and default expansions
  const adminPrefix = useMemo(() => {
    if (userRole === "school_admin" || userRole === "sub_school_admin") {
      return r.root;
    }
    return "";
  }, [r.root, userRole]);

  const defaultStudentsOpen = adminPrefix && location.startsWith(r.attendanceStudents);
  const defaultTeachersOpen = adminPrefix && location.startsWith(r.attendanceTeachers);
  const [openStudents, setOpenStudents] = useState<boolean>(!!defaultStudentsOpen);
  const [openTeachers, setOpenTeachers] = useState<boolean>(!!defaultTeachersOpen);

  return (
    <div 
      className="bg-white shadow-sm min-h-screen border-r border-gray-200 relative select-none"
      style={{ width: collapsed ? 64 : width }}
    >
      <nav className="mt-6">
        <div className="px-3">
          {/* Header row with collapse toggle */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className={cn("text-xs font-semibold uppercase text-gray-400", collapsed && "sr-only")}>Navigation</span>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span 
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive 
                          ? "bg-blue-50 border-r-3 border-blue-600 text-blue-600" 
                          : "text-gray-700 hover:bg-blue-50 hover:border-r-3 hover:border-blue-600"
                      )}
                      data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="mr-3 w-5 h-5" />
                      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}

            {(userRole === "school_admin" || userRole === "sub_school_admin") && (
              <>
                {/* Attendance (Students) group */}
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenStudents((v) => !v)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      location.startsWith(r.attendanceStudents) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                    )}
                  >
                    <span className="flex items-center">
                      <ClipboardCheck className="mr-3 w-5 h-5" />
                      <span className={cn(collapsed && "sr-only")}>
                        Attendance (Students)
                      </span>
                    </span>
                    {!collapsed && (openStudents ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {openStudents && !collapsed && (
                    <ul className="mt-1 mb-2 ml-9 space-y-1">
                      <li>
                        <Link href={r.attendanceStudents}>
                          <span className={cn(
                            "block px-3 py-2 text-sm rounded-md cursor-pointer",
                            location === r.attendanceStudents ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                          )}>Mark Attendance</span>
                        </Link>
                      </li>
                      <li>
                        <Link href={`${r.attendanceStudents}/reports`}>
                          <span className={cn(
                            "block px-3 py-2 text-sm rounded-md cursor-pointer",
                            location === `${r.attendanceStudents}/reports` ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                          )}>Attendance Reports</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Attendance (Teachers) group */}
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenTeachers((v) => !v)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      location.startsWith(r.attendanceTeachers) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                    )}
                  >
                    <span className="flex items-center">
                      <UserCheck className="mr-3 w-5 h-5" />
                      <span className={cn(collapsed && "sr-only")}>
                        Attendance (Teachers)
                      </span>
                    </span>
                    {!collapsed && (openTeachers ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {openTeachers && !collapsed && (
                    <ul className="mt-1 mb-2 ml-9 space-y-1">
                      <li>
                        <Link href={r.attendanceTeachers}>
                          <span className={cn(
                            "block px-3 py-2 text-sm rounded-md cursor-pointer",
                            location === r.attendanceTeachers ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                          )}>Mark Attendance</span>
                        </Link>
                      </li>
                      <li>
                        <Link href={`${r.attendanceTeachers}/reports`}>
                          <span className={cn(
                            "block px-3 py-2 text-sm rounded-md cursor-pointer",
                            location === `${r.attendanceTeachers}/reports` ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
                          )}>Attendance Reports</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      {/* Resize handle */}
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-100"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}
    </div>
  );
}
