import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { mockApi, type Bill, type Customer } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Trash2, Minus, Plus, ShoppingCart, FileText, Printer } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const TAX_RATE = 0.05;

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const Billing = () => {
  const { items, remove, setQty, clear, subtotal } = useCart();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);

  useEffect(() => { mockApi.listCustomers().then(setCustomers); }, []);
  useEffect(() => {
    if (!customerId && customers.length) {
      setCustomerId(customers[0].id.toString());
    }
  }, [customers, customerId]);

  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const grandTotal = +(subtotal + tax).toFixed(2);
  const generatedItemCount = generatedBill
    ? generatedBill.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const generatedDate = generatedBill
    ? new Date(generatedBill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";

  const generateBill = async () => {
    if (!customerId) return toast.error("Select a customer");
    if (!items.length) return toast.error("Cart is empty");
    const cust = customers.find((c) => c.id === +customerId)!;
    const bill = await mockApi.createBill({
      customerId: cust.id, customerName: cust.name,
      items: items.map((i) => ({ medicineId: i.medicine.id, name: i.medicine.name, price: i.medicine.price, quantity: i.quantity })),
      total: subtotal, tax, grandTotal,
    });
    toast.success(`Bill #${bill.id} created`);
    setGeneratedBill(bill);
    clear();
  };

  const printGeneratedBill = () => {
    if (!generatedBill) {
      toast.error("Generate a bill first");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the bill");
      return;
    }

    const generatedAt = new Date(generatedBill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const rows = generatedBill.items
      .map((item, idx) => {
        const lineTotal = item.price * item.quantity;
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatCurrency(lineTotal)}</td>
          </tr>
        `;
      })
      .join("");

    const printHtml = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Bill #${generatedBill.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 24px; font-family: Segoe UI, Arial, sans-serif; color: #0f172a; }
          .wrap { max-width: 760px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
          .heading { font-size: 24px; font-weight: 700; margin: 0 0 6px; }
          .meta { font-size: 13px; color: #334155; line-height: 1.4; }
          .title { margin: 16px 0 10px; padding: 10px 12px; background: #e6f7f4; border: 1px solid #bdebe1; border-radius: 8px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; text-align: left; }
          th { background: #f8fafc; }
          .totals { margin-top: 12px; margin-left: auto; width: 300px; }
          .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .totals .grand { font-size: 18px; font-weight: 700; border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 10px; }
          .foot { margin-top: 28px; font-size: 12px; color: #475569; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <div>
              <p class="heading">MediBill Pharmacy</p>
              <div class="meta">GSTIN: 27ABCDE1234F1Z5<br/>Phone: +91 98765 43210<br/>Address: Main Market Road, Pune</div>
            </div>
            <div class="meta">
              <strong>Bill No:</strong> #${generatedBill.id}<br/>
              <strong>Date:</strong> ${generatedAt}<br/>
              <strong>Customer:</strong> ${escapeHtml(generatedBill.customerName)}
            </div>
          </div>

          <div class="title">Tax Invoice</div>

          <table>
            <thead>
              <tr>
                <th style="width: 70px">#</th>
                <th>Medicine</th>
                <th style="width: 90px">Qty</th>
                <th style="width: 120px">Rate</th>
                <th style="width: 120px">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="totals">
            <div class="row"><span>Subtotal</span><strong>${formatCurrency(generatedBill.total)}</strong></div>
            <div class="row"><span>Tax (5%)</span><strong>${formatCurrency(generatedBill.tax)}</strong></div>
            <div class="row grand"><span>Grand Total</span><strong>${formatCurrency(generatedBill.grandTotal)}</strong></div>
          </div>

          <div class="foot">Thank you for your purchase. Please keep this bill for returns and warranty claims.</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
          <Receipt className="h-8 w-8 text-primary" /> Billing
        </h1>
        <p className="text-muted-foreground mt-1">Create a new invoice for your customer</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/60 shadow-card-soft">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Cart Items
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add medicines from the Medicines page</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div
                    key={it.medicine.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{it.medicine.name}</div>
                      <div className="text-xs text-muted-foreground">₹{it.medicine.price} × {it.quantity}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setQty(it.medicine.id, it.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <Input className="h-7 w-14 text-center" type="number" value={it.quantity} onChange={(e) => setQty(it.medicine.id, +e.target.value)} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setQty(it.medicine.id, it.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <div className="font-display font-bold w-20 text-right">₹{(it.medicine.price * it.quantity).toFixed(2)}</div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(it.medicine.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-gradient-card border-border/60 shadow-card-soft h-fit lg:sticky lg:top-20">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" /> Invoice Summary
          </h2>

          <div className="space-y-4 mb-4">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name} · {c.phone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 py-4 border-y border-border/60 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-display font-bold text-lg pt-2"><span>Grand Total</span><span className="gradient-text">₹{grandTotal.toFixed(2)}</span></div>
          </div>

          <Button onClick={generateBill} disabled={!items.length} className="w-full mt-4 h-11 bg-gradient-primary shadow-md-soft">
            Generate Bill
          </Button>

          {generatedBill && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30 text-sm">
              <div className="flex items-center justify-between">
                <span>Bill #{generatedBill.id} created ✓</span>
                <Button size="sm" variant="ghost" onClick={printGeneratedBill}><Printer className="h-3.5 w-3.5 mr-1" /> Print</Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>

      {generatedBill && (
        <Card className="p-6 bg-gradient-card border-border/60 shadow-card-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display font-semibold text-xl">Bill Preview</h2>
              <p className="text-sm text-muted-foreground">This is the invoice that will be printed.</p>
            </div>
            <Button onClick={printGeneratedBill} className="sm:w-auto w-full">
              <Printer className="h-4 w-4 mr-2" /> Print Bill
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-5 text-sm">
            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
              <p className="text-muted-foreground">Bill Number</p>
              <p className="font-semibold">#{generatedBill.id}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
              <p className="text-muted-foreground">Customer</p>
              <p className="font-semibold">{generatedBill.customerName}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
              <p className="text-muted-foreground">Date</p>
              <p className="font-semibold">{generatedDate}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">Medicine</th>
                  <th className="py-2 px-2 font-medium text-right">Qty</th>
                  <th className="py-2 px-2 font-medium text-right">Rate</th>
                  <th className="py-2 pl-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {generatedBill.items.map((item) => (
                  <tr key={`${generatedBill.id}-${item.medicineId}`} className="border-b border-border/40">
                    <td className="py-2 pr-2">{item.name}</td>
                    <td className="py-2 px-2 text-right">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-2 pl-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
              <p className="text-muted-foreground">Total items sold</p>
              <p className="font-semibold">{generatedItemCount}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/60 p-3 space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(generatedBill.total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(generatedBill.tax)}</span></div>
              <div className="flex justify-between font-display font-bold text-base pt-1 border-t border-border/70"><span>Grand Total</span><span>{formatCurrency(generatedBill.grandTotal)}</span></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Billing;
