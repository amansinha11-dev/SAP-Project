import { useEffect, useMemo, useState } from "react";
import { mockApi, type Medicine } from "@/services/api";
import MedicineCard from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pill } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const empty: Medicine = { id: 0, name: "", brand: "", category: "", price: 0, quantity: 0, expiryDate: "", batchNo: "" };

const Medicines = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { add } = useCart();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine>(empty);

  const load = () => mockApi.listMedicines().then(setMeds);
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(meds.map((m) => m.category)))], [meds]);
  const filtered = useMemo(() => meds.filter((m) =>
    (cat === "All" || m.category === cat) &&
    (m.name.toLowerCase().includes(q.toLowerCase()) || m.brand.toLowerCase().includes(q.toLowerCase()))
  ), [meds, q, cat]);

  const handleSave = async () => {
    if (!editing.name || editing.price <= 0) return toast.error("Name and price are required");
    await mockApi.saveMedicine(editing);
    toast.success(editing.id ? "Medicine updated" : "Medicine added");
    setOpen(false); setEditing(empty); load();
  };

  const handleDelete = async (m: Medicine) => {
    if (!confirm(`Delete ${m.name}?`)) return;
    await mockApi.deleteMedicine(m.id); toast.success("Deleted"); load();
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
            <Pill className="h-8 w-8 text-primary" /> Medicines
          </h1>
          <p className="text-muted-foreground mt-1">{filtered.length} of {meds.length} products</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-gradient-primary shadow-md-soft">
            <Plus className="h-4 w-4 mr-2" /> Add Medicine
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or brand..." className="pl-10 h-11" />
        </div>
        <div className="flex gap-2 overflow-auto pb-1">
          {categories.map((c) => (
            <Button
              key={c}
              variant={c === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCat(c)}
              className={c === cat ? "bg-gradient-primary" : ""}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m) => (
          <MedicineCard
            key={m.id}
            medicine={m}
            onAdd={(med) => { add(med); toast.success(`${med.name} added to bill`); }}
            onEdit={isAdmin ? (med) => { setEditing(med); setOpen(true); } : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit" : "Add"} Medicine</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Name</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" value={editing.expiryDate?.slice(0, 10)} onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Batch No.</Label>
              <Input value={editing.batchNo} onChange={(e) => setEditing({ ...editing, batchNo: e.target.value })} />
            </div>
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

export default Medicines;
