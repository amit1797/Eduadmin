import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, BellOff, User as UserIcon, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { routes } from "@/lib/routes";

interface NavbarProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
}

export function Navbar({ 
  title, 
  subtitle, 
  showAddButton, 
  addButtonText = "Add", 
  onAddClick 
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { data: notif } = useQuery({
    queryKey: ["/api/audit-logs", "navbar", "limit=5"],
    queryFn: () => auditApi.getLogs({ limit: 5 }),
  });
  const notifications = ((notif as any[]) || []).map((log: any, idx: number) => ({
    id: log.id || idx,
    message: log.message || `${log.action || "Activity"} on ${log.resource || "system"}`,
    createdAt: log.createdAt,
  }));

  // Compute dashboard path by role
  const dashboardPath = routes.dashboardFor(user ?? undefined);

  const isDashboard = location === dashboardPath;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-purple-100 text-purple-800";
      case "school_admin": return "bg-green-100 text-green-800";
      case "teacher": return "bg-indigo-100 text-indigo-800";
      case "student": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "school_admin": return "Admin";
      case "sub_school_admin": return "Sub Admin";
      case "teacher": return "Teacher";
      case "student": return "Student";
      case "parent": return "Parent";
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 1 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
            </div>
            {user && (
              <Badge className={`ml-4 ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {showAddButton && onAddClick && (
              <Button 
                onClick={onAddClick}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-add"
              >
                + {addButtonText}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <BellOff className="h-4 w-4 text-blue-600" />
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    {notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="whitespace-normal py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{n.message}</span>
                          {n.createdAt && (
                            <span className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={`${user?.firstName} ${user?.lastName}`} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="ml-1 w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild data-testid="menu-profile">
                  <Link href={routes.profile()} className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-testid="menu-settings">
                  <Link href={routes.settings()} className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-blue-600" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} data-testid="menu-logout" className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-red-600" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
