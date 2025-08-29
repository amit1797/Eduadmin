import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { auditApi, superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Pagination } from "@/components/common/Pagination";

export default function SuperAdminAuditLogs() {
  const { user } = useAuth();
  const [searchUser, setSearchUser] = useState("");
  const [action, setAction] = useState("all");
  const [resource, setResource] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["/api/audit-logs", { searchUser, action, resource, startDate, endDate }],
    queryFn: () =>
      auditApi.getLogs({
        userId: searchUser || undefined,
        action: action !== "all" ? action : undefined,
        resource: resource !== "all" ? resource : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    refetchOnWindowFocus: true,
  });

  // Fetch users and schools to resolve names
  const { data: users } = useQuery({
    queryKey: ["/api/super-admin/users"],
    queryFn: () => superAdminApi.getUserManagement(),
  });
  const { data: schools } = useQuery({
    queryKey: ["/api/super-admin/schools"],
    queryFn: () => superAdminApi.getSchools(),
  });

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    (users || []).forEach((u: any) => {
      const first = u.first_name ?? u.firstName ?? "";
      const last = u.last_name ?? u.lastName ?? "";
      const full = `${first} ${last}`.trim();
      map.set(u.id, full || u.email || u.username || u.id);
    });
    return map;
  }, [users]);

  const schoolNameById = useMemo(() => {
    const map = new Map<string, string>();
    (schools || []).forEach((s: any) => {
      map.set(s.id, s.name || s.code || s.id);
    });
    return map;
  }, [schools]);

  const actions = useMemo(() => {
    const s = new Set<string>();
    (logs || []).forEach((l: any) => { if (l.action) s.add(l.action); });
    return Array.from(s).sort();
  }, [logs]);

  const resources = useMemo(() => {
    const s = new Set<string>();
    (logs || []).forEach((l: any) => { if (l.resource) s.add(l.resource); });
    return Array.from(s).sort();
  }, [logs]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchUser, action, resource, startDate, endDate]);

  const startIdx = (page - 1) * pageSize;
  const pagedLogs = (logs || []).slice(startIdx, startIdx + pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Audit Logs" />
      <div className="flex">
        <Sidebar userRole="super_admin" />
        <div className="flex-1 p-6 overflow-auto">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <Input
                    placeholder="Filter by User ID"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    data-testid="input-filter-user"
                  />
                </div>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger data-testid="select-action-filter">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={resource} onValueChange={setResource}>
                  <SelectTrigger data-testid="select-resource-filter">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {resources.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? "Filtering..." : "Apply Filters"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs ({logs?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5,6].map(i => (<Skeleton key={i} className="h-16" />))}
                </div>
              ) : (
                <>
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pagedLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userNameById.get(log.userId) || log.userId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resourceId || "—"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.schoolId ? (schoolNameById.get(log.schoolId) || log.schoolId) : "—"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ipAddress || "—"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 truncate max-w-xs" title={log.userAgent || ""}>{log.userAgent || "—"}</td>
                        </tr>
                      ))}
                      {(logs || []).length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No logs found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {(logs || []).length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      total={(logs || []).length}
                      onPageChange={setPage}
                      onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}
