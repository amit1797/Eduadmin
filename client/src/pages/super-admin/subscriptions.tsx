import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { CreditCard, Search, Plus, Edit, DollarSign, Calendar, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Subscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/super-admin/subscriptions"],
    queryFn: () => superAdminApi.getSubscriptions()
  });

  const { data: schools } = useQuery({
    queryKey: ["/api/super-admin/schools"],
    queryFn: () => superAdminApi.getSchools()
  });

  // Mock subscription data (replace with real data)
  const mockSubscriptions = [
    {
      id: 1,
      school: { id: 1, name: "Sunrise Public School", code: "SPS001" },
      plan: "Professional",
      status: "active",
      amount: 299,
      billingCycle: "monthly",
      nextBilling: "2024-09-15",
      users: 450,
      userLimit: 500,
      features: ["Student Management", "Attendance", "Academics", "Library", "Transport"],
      startDate: "2024-01-15",
    },
    {
      id: 2,
      school: { id: 2, name: "Green Valley Academy", code: "GVA002" },
      plan: "Enterprise",
      status: "active",
      amount: 599,
      billingCycle: "monthly",
      nextBilling: "2024-09-20",
      users: 850,
      userLimit: 1000,
      features: ["All Modules", "Custom Reports", "API Access", "Priority Support"],
      startDate: "2024-02-01",
    },
    {
      id: 3,
      school: { id: 3, name: "Mountain View School", code: "MVS003" },
      plan: "Basic",
      status: "trial",
      amount: 99,
      billingCycle: "monthly",
      nextBilling: "2024-09-10",
      users: 125,
      userLimit: 200,
      features: ["Student Management", "Attendance", "Basic Academics"],
      startDate: "2024-08-25",
    },
  ];

  const filteredSubscriptions = mockSubscriptions.filter((sub: any) => {
    const matchesSearch = 
      sub.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.school.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan.toLowerCase() === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Subscriptions" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalRevenue: mockSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
    activeSubscriptions: mockSubscriptions.filter(sub => sub.status === "active").length,
    trialSubscriptions: mockSubscriptions.filter(sub => sub.status === "trial").length,
    totalUsers: mockSubscriptions.reduce((sum, sub) => sum + sub.users, 0),
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "trial": return "bg-blue-100 text-blue-800";
      case "expired": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "basic": return "bg-gray-100 text-gray-800";
      case "professional": return "bg-blue-100 text-blue-800";
      case "enterprise": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        title="Subscription Management"
        showAddButton
        addButtonText="Create Plan"
        onAddClick={() => {/* TODO: Create subscription plan modal */}}
      />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 ml-1">+12.5%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeSubscriptions}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600 ml-1">+3 this month</span>
                    </div>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trial Subscriptions</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.trialSubscriptions}</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-600 ml-1">5 expiring soon</span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-600 ml-1">Across all schools</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-subscriptions"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-plan-filter">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-plan">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Billing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription: any) => (
                      <tr key={subscription.id} className="hover:bg-gray-50" data-testid={`subscription-row-${subscription.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {subscription.school.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {subscription.school.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {subscription.school.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getPlanBadgeColor(subscription.plan)}>
                            {subscription.plan}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusBadgeColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subscription.users} / {subscription.userLimit}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(subscription.users / subscription.userLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${subscription.amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.billingCycle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(subscription.nextBilling).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-${subscription.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-billing-${subscription.id}`}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No subscriptions found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans Overview */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Basic",
                      price: "$99",
                      users: "Up to 200 users",
                      features: ["Student Management", "Attendance", "Basic Academics", "Email Support"],
                      color: "border-gray-200"
                    },
                    {
                      name: "Professional",
                      price: "$299",
                      users: "Up to 500 users",
                      features: ["All Basic features", "Library Management", "Transport", "Advanced Reports", "Phone Support"],
                      color: "border-blue-200 bg-blue-50"
                    },
                    {
                      name: "Enterprise",
                      price: "$599",
                      users: "Up to 1000 users",
                      features: ["All Professional features", "Custom integrations", "API Access", "Dedicated support", "Training"],
                      color: "border-purple-200 bg-purple-50"
                    }
                  ].map((plan, index) => (
                    <div key={index} className={`border-2 rounded-lg p-6 ${plan.color}`}>
                      <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold mb-1">{plan.price}</div>
                      <div className="text-sm text-gray-600 mb-4">{plan.users}</div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}