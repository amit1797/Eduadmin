import { cn } from "@/lib/utils";
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
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";

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

  const getSidebarItems = (): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" }
    ];

    if (userRole === "super_admin") {
      return [
        ...baseItems,
        { icon: Building2, label: "Schools Management", href: "/super-admin/schools" },
        { icon: Users, label: "User Management", href: "/super-admin/users" },
        { icon: Settings, label: "Modules Configuration", href: "/super-admin/modules" },
        { icon: FileText, label: "Audit Logs", href: "/super-admin/audit" },
        { icon: Settings, label: "Settings", href: "/super-admin/settings" }
      ];
    }

    if (userRole === "school_admin" || userRole === "sub_school_admin") {
      return [
        ...baseItems,
        { icon: Users, label: "Students", href: "/students" },
        { icon: GraduationCap, label: "Teachers", href: "/teachers" },
        { icon: BookOpen, label: "Classes", href: "/classes" },
        { icon: ClipboardCheck, label: "Attendance", href: "/attendance" },
        { icon: Award, label: "Academics", href: "/academics" },
        { icon: Calendar, label: "Events", href: "/events" },
        { icon: FileText, label: "Accounts", href: "/accounts" }
      ];
    }

    if (userRole === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "My Classes", href: "/teacher/classes" },
        { icon: Users, label: "Students", href: "/teacher/students" },
        { icon: ClipboardCheck, label: "Attendance", href: "/teacher/attendance" },
        { icon: Award, label: "Assignments", href: "/teacher/assignments" },
        { icon: Award, label: "Grades", href: "/teacher/grades" },
        { icon: Calendar, label: "Schedule", href: "/teacher/schedule" }
      ];
    }

    return baseItems;
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a 
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive 
                          ? "bg-blue-50 border-r-3 border-blue-600 text-blue-600" 
                          : "text-gray-700 hover:bg-blue-50 hover:border-r-3 hover:border-blue-600"
                      )}
                      data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="mr-3 w-5 h-5" />
                      {item.label}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
