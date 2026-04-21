import { useEffect, useMemo, useState } from "react";
import { mockApi, type Bill, type Medicine } from "@/services/api";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, IndianRupee, Receipt } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const Reports = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => { mockApi.listBills().then(setBills); mockApi.listMedicines().then(setMeds); }, []);

  const revenue = bills.reduce((s, b) => s + b.grandTotal, 0);
  const avgBill = bills.length ? revenue / bills.length : 0;

  const last7 = useMemo(() => {
    const days: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short" });
      const rev = bills.filter((b) => new Date(b.date).toDateString() === d.toDateString()).reduce((s, b) => s + b.grandTotal, 0);
      days.push({ day: key, revenue: rev });
    }
    return days;
  }, [bills]);

  const catData = useMemo(() => {
    const map = new Map<string, number>();
    meds.forEach((m) => map.set(m.category, (map.get(m.category) || 0) + m.quantity));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [meds]);

  const COLORS = ["hsl(175 70% 35%)", "hsl(170 75% 50%)", "hsl(158 70% 55%)", "hsl(38 92% 55%)", "hsl(220 70% 55%)", "hsl(280 60% 60%)"];

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" /> Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Business insights at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} icon={IndianRupee} accent="success" />
        <StatCard label="Bills Generated" value={bills.length} icon={Receipt} delay={0.1} />
        <StatCard label="Avg Bill Value" value={`₹${avgBill.toFixed(0)}`} icon={TrendingUp} delay={0.2} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card-soft">
          <h2 className="font-display font-semibold mb-4">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card-soft">
          <h2 className="font-display font-semibold mb-4">Stock by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-card-soft">
        <h2 className="font-display font-semibold mb-4">Recent Transactions</h2>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No bills yet.</p>
        ) : (
          <div className="space-y-2">
            {bills.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/40">
                <div>
                  <div className="font-medium">#{b.id} · {b.customerName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.date).toLocaleString("en-IN")}</div>
                </div>
                <div className="font-display font-bold">₹{b.grandTotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
