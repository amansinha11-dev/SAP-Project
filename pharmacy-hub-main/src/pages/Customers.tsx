import { useEffect, useState } from "react";
import { mockApi, type Customer } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Users, Mail, Phone, MapPin, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const empty: Customer = { id: 0, name: "", phone: "", email: "", address: "" };

const Customers = () => {
  const [list, setList] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer>(empty);

  const load = () => mockApi.listCustomers().then(setList);
  useEffect(() => { load(); }, []);

  const filtered = list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  const handleSave = async () => {
    if (!editing.name || !editing.phone) return toast.error("Name and phone required");
    await mockApi.saveCustomer(editing);
    toast.success(editing.id ? "Customer updated" : "Customer added");
    setOpen(false); setEditing(empty); load();
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    await mockApi.deleteCustomer(c.id); toast.success("Deleted"); load();
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> Customers
          </h1>
          <p className="text-muted-foreground mt-1">{list.length} registered</p>
        </div>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-gradient-primary shadow-md-soft">
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone..." className="pl-10 h-11" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 bg-gradient-card border-border/60 shadow-card-soft hover:shadow-lg-soft transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shadow-md-soft">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">ID #{c.id.toString().padStart(4, "0")}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone}</div>
                <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" /> {c.email}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {c.address}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(c); setOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Address</Label><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
