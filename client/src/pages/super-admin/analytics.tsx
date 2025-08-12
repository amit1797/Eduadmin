import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("30d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/super-admin/analytics", timeFilter],
    queryFn: () => superAdminApi.getAnalytics()
  });

  // Mock data for visualization (replace with real data from analytics)
  const revenueData = [
    { month: 'Jan', revenue: 45000, schools: 12 },
    { month: 'Feb', revenue: 52000, schools: 15 },
    { month: 'Mar', revenue: 48000, schools: 18 },
    { month: 'Apr', revenue: 61000, schools: 22 },
    { month: 'May', revenue: 55000, schools: 25 },
    { month: 'Jun', revenue: 67000, schools: 28 },
  ];

  const userGrowthData = [
    { month: 'Jan', students: 2400, teachers: 240, admins: 24 },
    { month: 'Feb', students: 3200, teachers: 320, admins: 32 },
    { month: 'Mar', students: 2800, teachers: 280, admins: 28 },
    { month: 'Apr', students: 4200, teachers: 420, admins: 42 },
    { month: 'May', students: 3800, teachers: 380, admins: 38 },
    { month: 'Jun', students: 5200, teachers: 520, admins: 52 },
  ];

  const schoolsByRegion = [
    { name: 'North America', value: 45, count: 45 },
    { name: 'Europe', value: 30, count: 30 },
    { name: 'Asia', value: 20, count: 20 },
    { name: 'Others', value: 5, count: 5 },
  ];

  const moduleUsage = [
    { module: 'Student Mgmt', usage: 95 },
    { module: 'Attendance', usage: 87 },
    { module: 'Academics', usage: 82 },
    { module: 'Events', usage: 76 },
    { module: 'Library', usage: 45 },
    { module: 'Transport', usage: 38 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Analytics" />
        <div className="flex">
          <Sidebar userRole="super_admin" />
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Analytics Dashboard" />
      
      <div className="flex">
        <Sidebar userRole="super_admin" />
        
        <div className="flex-1 p-6">
          {/* Time Filter */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48" data-testid="select-time-filter">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">$328,000</p>
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
                    <p className="text-sm font-medium text-gray-600">Active Schools</p>
                    <p className="text-2xl font-bold text-blue-600">128</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600 ml-1">+8.2%</span>
                    </div>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-purple-600">52,340</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-600 ml-1">+15.3%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
                    <p className="text-2xl font-bold text-orange-600">24m</p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600 ml-1">-2.1%</span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="teachers" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="admins" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Schools by Region */}
            <Card>
              <CardHeader>
                <CardTitle>Schools by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={schoolsByRegion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {schoolsByRegion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Module Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Module Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleUsage} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="module" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      <Bar dataKey="usage" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Schools */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sunrise Public School", revenue: "$12,500", growth: "+25%" },
                    { name: "Green Valley Academy", revenue: "$10,800", growth: "+18%" },
                    { name: "Mountain View School", revenue: "$9,200", growth: "+15%" },
                    { name: "Ocean Blue Institute", revenue: "$8,700", growth: "+12%" },
                    { name: "Golden Gate High", revenue: "$7,900", growth: "+8%" },
                  ].map((school, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{school.name}</p>
                        <p className="text-sm text-gray-500">Monthly Revenue: {school.revenue}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600">{school.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "New school onboarded", school: "Tech Valley Academy", time: "2 hours ago" },
                    { action: "Subscription upgraded", school: "Sunrise Public School", time: "4 hours ago" },
                    { action: "User limit reached", school: "Green Valley Academy", time: "6 hours ago" },
                    { action: "Payment received", school: "Mountain View School", time: "8 hours ago" },
                    { action: "Support ticket created", school: "Ocean Blue Institute", time: "12 hours ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.school}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
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