import { createContext, useContext, useState, ReactNode } from "react";
import type { Medicine } from "@/services/api";

export type CartItem = { medicine: Medicine; quantity: number };

type CartContextType = {
  items: CartItem[];
  add: (m: Medicine) => void;
  remove: (id: number) => void;
  setQty: (id: number, q: number) => void;
  clear: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (m: Medicine) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.medicine.id === m.id);
      if (existing) return prev.map((x) => x.medicine.id === m.id ? { ...x, quantity: Math.min(x.quantity + 1, m.quantity) } : x);
      return [...prev, { medicine: m, quantity: 1 }];
    });
  };
  const remove = (id: number) => setItems((p) => p.filter((x) => x.medicine.id !== id));
  const setQty = (id: number, q: number) => setItems((p) => p.map((x) => x.medicine.id === id ? { ...x, quantity: Math.max(1, Math.min(q, x.medicine.quantity)) } : x));
  const clear = () => setItems([]);
  const subtotal = items.reduce((s, x) => s + x.medicine.price * x.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};
