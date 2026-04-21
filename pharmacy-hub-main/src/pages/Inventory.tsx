import { useEffect, useState } from "react";
import { mockApi, type Medicine } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, AlertTriangle } from "lucide-react";

const Inventory = () => {
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { mockApi.listMedicines().then(setMeds); }, []);

  const filtered = meds.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  const totalValue = meds.reduce((s, m) => s + m.price * m.quantity, 0);
  const lowCount = meds.filter((m) => m.quantity < 20).length;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" /> Inventory
        </h1>
        <p className="text-muted-foreground mt-1">Track stock levels & batch expiry</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-card shadow-card-soft">
          <div className="text-sm text-muted-foreground">Total SKUs</div>
          <div className="text-3xl font-display font-bold mt-1">{meds.length}</div>
        </Card>
        <Card className="p-5 bg-gradient-card shadow-card-soft">
          <div className="text-sm text-muted-foreground">Inventory Value</div>
          <div className="text-3xl font-display font-bold mt-1 gradient-text">₹{totalValue.toLocaleString("en-IN")}</div>
        </Card>
        <Card className="p-5 bg-gradient-card shadow-card-soft">
          <div className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-warning" /> Low / Out</div>
          <div className="text-3xl font-display font-bold mt-1 text-warning">{lowCount}</div>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card-soft overflow-hidden">
        <div className="p-4 border-b border-border/60">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory..." className="pl-10" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const status = m.quantity === 0 ? "OUT" : m.quantity < 20 ? "LOW" : "OK";
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.brand}</TableCell>
                  <TableCell className="font-mono text-xs">{m.batchNo}</TableCell>
                  <TableCell className="text-right">₹{m.price}</TableCell>
                  <TableCell className="text-right font-semibold">{m.quantity}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(m.expiryDate).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    {status === "OUT" && <Badge variant="destructive">Out</Badge>}
                    {status === "LOW" && <Badge className="bg-warning text-warning-foreground border-0">Low</Badge>}
                    {status === "OK" && <Badge className="bg-success text-success-foreground border-0">OK</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Inventory;
