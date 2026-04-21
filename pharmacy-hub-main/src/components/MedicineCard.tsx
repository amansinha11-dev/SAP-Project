import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Package, Calendar } from "lucide-react";
import type { Medicine } from "@/services/api";
import { motion } from "framer-motion";

type Props = { medicine: Medicine; onAdd?: (m: Medicine) => void; onEdit?: (m: Medicine) => void; onDelete?: (m: Medicine) => void };

const MedicineCard = ({ medicine, onAdd, onEdit, onDelete }: Props) => {
  const lowStock = medicine.quantity > 0 && medicine.quantity < 20;
  const outOfStock = medicine.quantity === 0;
  const expSoon = new Date(medicine.expiryDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden p-5 bg-gradient-card border-border/60 shadow-card-soft hover:shadow-lg-soft transition-all">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
        <div className="relative flex items-start justify-between mb-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md-soft">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {outOfStock && <Badge variant="destructive">Out of Stock</Badge>}
            {!outOfStock && lowStock && <Badge className="bg-warning text-warning-foreground border-0">Low Stock</Badge>}
            {expSoon && !outOfStock && <Badge variant="outline" className="border-warning/50 text-warning">Expires Soon</Badge>}
          </div>
        </div>

        <div className="relative space-y-1 mb-4">
          <h3 className="font-display font-semibold text-base leading-tight">{medicine.name}</h3>
          <p className="text-xs text-muted-foreground">{medicine.brand} · {medicine.category}</p>
        </div>

        <div className="relative grid grid-cols-2 gap-3 text-xs mb-4">
          <div>
            <div className="text-muted-foreground">Price</div>
            <div className="font-display font-bold text-lg text-foreground">₹{medicine.price}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Stock</div>
            <div className="font-display font-bold text-lg text-foreground">{medicine.quantity}</div>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Exp: {new Date(medicine.expiryDate).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</span>
            <span className="ml-auto font-mono text-[10px]">{medicine.batchNo}</span>
          </div>
        </div>

        <div className="relative flex gap-2">
          {onAdd && (
            <Button
              onClick={() => onAdd(medicine)}
              disabled={outOfStock}
              size="sm"
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(medicine)} size="sm" variant="outline" className="flex-1">Edit</Button>
          )}
          {onDelete && (
            <Button onClick={() => onDelete(medicine)} size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">Delete</Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default MedicineCard;
