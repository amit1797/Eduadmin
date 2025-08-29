import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

interface FeeItem {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "term" | "annual";
}

interface PaymentRecord {
  id: string;
  student: string;
  studentId: string;
  item: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

export default function AdminAccounts() {
  const { user } = useAuth();

  // Demo state (MVP – local only)
  const [items, setItems] = useState<FeeItem[]>([
    { id: "1", name: "Tuition", amount: 2500, frequency: "term" },
    { id: "2", name: "Transport", amount: 600, frequency: "monthly" },
    { id: "3", name: "Library", amount: 150, frequency: "annual" },
  ]);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    { id: "p1", student: "Alice Johnson", studentId: "STU-101", item: "Tuition", amount: 2500, date: new Date().toISOString().slice(0,10), status: "paid" },
    { id: "p2", student: "Bob Smith", studentId: "STU-102", item: "Transport", amount: 600, date: new Date().toISOString().slice(0,10), status: "pending" },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newItem, setNewItem] = useState<Partial<FeeItem>>({ name: "", amount: 0, frequency: "term" });

  const filteredPayments = useMemo(() => {
    if (filterStatus === "all") return payments;
    return payments.filter(p => p.status === filterStatus);
  }, [payments, filterStatus]);

  const totals = useMemo(() => {
    const collected = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
    return { collected, pending };
  }, [payments]);

  const addItem = () => {
    if (!newItem.name || !newItem.frequency || !newItem.amount || newItem.amount <= 0) return;
    setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), name: newItem.name!, amount: newItem.amount!, frequency: newItem.frequency as any }]);
    setNewItem({ name: "", amount: 0, frequency: "term" });
  };

  const markPaid = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "paid" } : p));
  };

  return (
    <PageLayout
      title="Accounts"
      subtitle="Fees & Payments"
      sidebar={{ userRole: "school_admin", schoolId: user?.schoolId }}
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Fee Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{payments.filter(p => p.status === "pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paid This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{payments.filter(p => p.status === "paid").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Items */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem(v => ({ ...v, name: e.target.value }))} />
              <Input type="number" placeholder="Amount" value={newItem.amount} onChange={(e) => setNewItem(v => ({ ...v, amount: Number(e.target.value) }))} />
              <Select value={newItem.frequency} onValueChange={(v) => setNewItem(s => ({ ...s, frequency: v as FeeItem["frequency"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term">Per Term</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addItem}>Add Item</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-base font-normal text-gray-600">₹ {item.amount} ({item.frequency})</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Filter:</span>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto border rounded-md bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-3">Student</th>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3">{p.student}</td>
                      <td className="p-3">{p.studentId}</td>
                      <td className="p-3">{p.item}</td>
                      <td className="p-3">₹ {p.amount.toLocaleString()}</td>
                      <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={p.status === "paid" ? "text-green-600" : "text-red-600"}>{p.status}</span>
                      </td>
                      <td className="p-3">
                        {p.status === "pending" && (
                          <Button size="sm" onClick={() => markPaid(p.id)}>Mark Paid</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
