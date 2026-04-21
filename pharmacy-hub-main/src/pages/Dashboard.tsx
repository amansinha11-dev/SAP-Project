import { useEffect, useState } from "react";
import { mockApi, type Medicine, type Bill, type Staff, type StaffHistory } from "@/services/api";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Pill, Users, Receipt, AlertTriangle, TrendingUp, Clock, UserPlus, Trash2, History } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [custCount, setCustCount] = useState(0);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffHistory, setStaffHistory] = useState<StaffHistory[]>([]);
  const [newStaff, setNewStaff] = useState({ name: "", username: "" });
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);
  const [generatedStaff, setGeneratedStaff] = useState<Staff | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const loadStaffData = async () => {
    const [s, h] = await Promise.all([mockApi.listStaff(), mockApi.listStaffHistory()]);
    setStaffs(s);
    setStaffHistory(h);
  };

  useEffect(() => {
    Promise.all([mockApi.listMedicines(), mockApi.listBills(), mockApi.listCustomers()])
      .then(([m, b, c]) => { setMeds(m); setBills(b); setCustCount(c.length); });
    if (isAdmin) {
      loadStaffData().catch(() => toast.error("Unable to load staff data"));
    }
  }, [isAdmin]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStaff(true);
    try {
      const created = await mockApi.createStaff({
        name: newStaff.name,
        username: newStaff.username,
        createdBy: user?.name || "admin",
      });
      setGeneratedStaff(created);
      setNewStaff({ name: "", username: "" });
      toast.success(`Staff created: ${created.staffId}`);
      await loadStaffData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create staff";
      toast.error(msg);
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    setDeletingStaffId(id);
    try {
      await mockApi.deleteStaff({ id, performedBy: user?.name || "admin" });
      toast.success("Staff deleted");
      await loadStaffData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete staff";
      toast.error(msg);
    } finally {
      setDeletingStaffId(null);
    }
  };

  const lowStock = meds.filter((m) => m.quantity > 0 && m.quantity < 20);
  const outOfStock = meds.filter((m) => m.quantity === 0);
  const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);
  const todayBills = bills.filter((b) => new Date(b.date).toDateString() === new Date().toDateString());

  return (
    <div className="container py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          Good day, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at your pharmacy today.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines" value={meds.length} icon={Pill} trend="+12%" delay={0} />
        <StatCard label="Customers" value={custCount} icon={Users} trend="+5%" delay={0.1} />
        <StatCard label="Today's Bills" value={todayBills.length} icon={Receipt} delay={0.2} accent="success" />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={TrendingUp} trend="+18%" delay={0.3} accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/60 shadow-card-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Recent Bills</h2>
            <Badge variant="outline">{bills.length} total</Badge>
          </div>
          {bills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bills yet. Create your first bill from the Billing page.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bills.slice(0, 6).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(b.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold">₹{b.grandTotal.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-muted-foreground">{b.items.length} items</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-gradient-card border-border/60 shadow-card-soft">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-display font-semibold text-lg">Stock Alerts</h2>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {outOfStock.map((m) => (
              <div key={m.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{m.name}</span>
                  <Badge variant="destructive" className="text-[10px]">OUT</Badge>
                </div>
              </div>
            ))}
            {lowStock.map((m) => (
              <div key={m.id} className="p-3 rounded-lg bg-warning/5 border border-warning/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="text-xs font-mono font-semibold text-warning">{m.quantity} left</span>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && outOfStock.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">All stock levels healthy ✓</p>
            )}
          </div>
        </Card>
      </div>

      {isAdmin && (
        <Card className="p-6 bg-gradient-card border-border/60 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display font-semibold text-xl">Admin Staff Management</h2>
              <p className="text-sm text-muted-foreground">Add/remove staff members and review complete staff activity history.</p>
            </div>
            <Badge variant="outline">{staffs.length} active staff</Badge>
          </div>

          <Tabs defaultValue="manage">
            <TabsList>
              <TabsTrigger value="manage" className="gap-2"><UserPlus className="h-4 w-4" />Manage Staff</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" />Full History</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-4">
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="staff-name">Staff Name</Label>
                  <Input
                    id="staff-name"
                    placeholder="e.g. Rahul Verma"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="staff-username">Username (optional)</Label>
                  <Input
                    id="staff-username"
                    placeholder="auto-generated if empty"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff((p) => ({ ...p, username: e.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={creatingStaff} className="h-10">
                  {creatingStaff ? "Creating..." : "Generate Staff ID & Credentials"}
                </Button>
              </form>

              {generatedStaff && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="font-semibold text-sm mb-2">Generated credentials (share with staff securely):</p>
                  <div className="grid sm:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Staff ID:</span> <span className="font-mono font-semibold">{generatedStaff.staffId}</span></div>
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{generatedStaff.name}</span></div>
                    <div><span className="text-muted-foreground">Username:</span> <span className="font-mono">{generatedStaff.username}</span></div>
                    <div><span className="text-muted-foreground">Password:</span> <span className="font-mono">{generatedStaff.password}</span></div>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No staff added yet.</TableCell>
                    </TableRow>
                  ) : (
                    staffs.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-mono">{staff.staffId}</TableCell>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="font-mono">{staff.username}</TableCell>
                        <TableCell>{new Date(staff.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingStaffId === staff.id}
                            onClick={() => handleDeleteStaff(staff.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No staff history yet.</TableCell>
                    </TableRow>
                  ) : (
                    staffHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.performedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                        <TableCell>
                          <Badge variant={entry.action === "ADDED" ? "default" : "destructive"}>{entry.action}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{entry.staffId}</TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell className="font-mono">{entry.username}</TableCell>
                        <TableCell>{entry.performedBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
