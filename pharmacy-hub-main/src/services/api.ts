import axios from "axios";
import { toast } from "react-hot-toast";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    const msg = err.response?.data?.message || err.message || "Request failed";
    if (err.response?.status !== 401) toast.error(msg);
    return Promise.reject(err);
  }
);

// ----- Mock data layer (swap with real Spring Boot backend) -----
export type Medicine = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  expiryDate: string;
  batchNo: string;
};
export type Customer = { id: number; name: string; phone: string; email: string; address: string };
export type BillItem = { medicineId: number; name: string; price: number; quantity: number };
export type Bill = { id: number; customerId: number; customerName: string; items: BillItem[]; total: number; tax: number; grandTotal: number; date: string };
export type Staff = {
  id: number;
  staffId: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
  createdBy: string;
  active: boolean;
};
export type StaffHistoryAction = "ADDED" | "DELETED";
export type StaffHistory = {
  id: number;
  action: StaffHistoryAction;
  staffId: string;
  name: string;
  username: string;
  performedBy: string;
  performedAt: string;
};

const seedMedicines: Medicine[] = [
  { id: 1, name: "Paracetamol 500mg", brand: "Crocin", category: "Analgesic", price: 25, quantity: 240, expiryDate: "2026-08-15", batchNo: "PCM-2024-A1" },
  { id: 2, name: "Amoxicillin 250mg", brand: "Mox", category: "Antibiotic", price: 85, quantity: 120, expiryDate: "2025-12-10", batchNo: "AMX-2024-B2" },
  { id: 3, name: "Cetirizine 10mg", brand: "Zyrtec", category: "Antihistamine", price: 35, quantity: 8, expiryDate: "2026-03-22", batchNo: "CTZ-2024-C3" },
  { id: 4, name: "Ibuprofen 400mg", brand: "Brufen", category: "Analgesic", price: 45, quantity: 180, expiryDate: "2026-11-05", batchNo: "IBU-2024-D4" },
  { id: 5, name: "Omeprazole 20mg", brand: "Prilosec", category: "Antacid", price: 95, quantity: 65, expiryDate: "2026-06-18", batchNo: "OMP-2024-E5" },
  { id: 6, name: "Metformin 500mg", brand: "Glucophage", category: "Antidiabetic", price: 55, quantity: 200, expiryDate: "2027-01-30", batchNo: "MET-2024-F6" },
  { id: 7, name: "Atorvastatin 10mg", brand: "Lipitor", category: "Cardiovascular", price: 120, quantity: 90, expiryDate: "2026-09-14", batchNo: "ATR-2024-G7" },
  { id: 8, name: "Vitamin D3 60K", brand: "Calcirol", category: "Supplement", price: 65, quantity: 4, expiryDate: "2026-04-20", batchNo: "VTD-2024-H8" },
  { id: 9, name: "Azithromycin 500mg", brand: "Azithral", category: "Antibiotic", price: 145, quantity: 75, expiryDate: "2026-07-08", batchNo: "AZI-2024-I9" },
  { id: 10, name: "Pantoprazole 40mg", brand: "Pantop", category: "Antacid", price: 75, quantity: 110, expiryDate: "2026-10-25", batchNo: "PAN-2024-J0" },
];

const seedCustomers: Customer[] = [
  { id: 1, name: "Rohit Sharma", phone: "+91 98765 43210", email: "rohit@example.com", address: "Pune, Maharashtra" },
  { id: 2, name: "Priya Iyer", phone: "+91 90123 45678", email: "priya@example.com", address: "Bengaluru, Karnataka" },
  { id: 3, name: "Anjali Mehta", phone: "+91 88990 11223", email: "anjali@example.com", address: "Mumbai, Maharashtra" },
];

const KEYS = {
  MEDS: "pb_medicines",
  CUSTS: "pb_customers",
  BILLS: "pb_bills",
  STAFFS: "pb_staffs",
  STAFF_HISTORY: "pb_staff_history",
};

const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

const randomPassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const toUsername = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "staff";

export const mockApi = {
  // Auth
  login: async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (!username || !password) throw new Error("Enter username and password");

    if (username.toLowerCase() === "admin") {
      return { token: `mock.${btoa(username)}.${Date.now()}`, role: "ADMIN", name: "admin" };
    }

    const staffs = load<Staff[]>(KEYS.STAFFS, []);
    const matched = staffs.find(
      (s) => s.active && s.username.toLowerCase() === username.toLowerCase() && s.password === password,
    );
    if (!matched) throw new Error("Invalid username or password");

    return { token: `mock.${btoa(matched.username)}.${Date.now()}`, role: "USER", name: matched.name };
  },
  // Medicines
  listMedicines: async (): Promise<Medicine[]> => {
    let m = load<Medicine[]>(KEYS.MEDS, []);
    if (!m.length) { save(KEYS.MEDS, seedMedicines); m = seedMedicines; }
    return m;
  },
  saveMedicine: async (med: Medicine): Promise<Medicine> => {
    const all = load<Medicine[]>(KEYS.MEDS, seedMedicines);
    if (med.id) {
      const idx = all.findIndex((x) => x.id === med.id);
      if (idx >= 0) all[idx] = med;
    } else {
      med.id = Math.max(0, ...all.map((x) => x.id)) + 1;
      all.push(med);
    }
    save(KEYS.MEDS, all);
    return med;
  },
  deleteMedicine: async (id: number) => {
    const all = load<Medicine[]>(KEYS.MEDS, seedMedicines).filter((x) => x.id !== id);
    save(KEYS.MEDS, all);
  },
  // Customers
  listCustomers: async (): Promise<Customer[]> => {
    let c = load<Customer[]>(KEYS.CUSTS, []);
    if (!c.length) { save(KEYS.CUSTS, seedCustomers); c = seedCustomers; }
    return c;
  },
  saveCustomer: async (c: Customer): Promise<Customer> => {
    const all = load<Customer[]>(KEYS.CUSTS, seedCustomers);
    if (c.id) {
      const idx = all.findIndex((x) => x.id === c.id);
      if (idx >= 0) all[idx] = c;
    } else {
      c.id = Math.max(0, ...all.map((x) => x.id)) + 1;
      all.push(c);
    }
    save(KEYS.CUSTS, all);
    return c;
  },
  deleteCustomer: async (id: number) => {
    const all = load<Customer[]>(KEYS.CUSTS, seedCustomers).filter((x) => x.id !== id);
    save(KEYS.CUSTS, all);
  },
  // Bills
  listBills: async (): Promise<Bill[]> => load<Bill[]>(KEYS.BILLS, []),
  createBill: async (b: Omit<Bill, "id" | "date">): Promise<Bill> => {
    const all = load<Bill[]>(KEYS.BILLS, []);
    const bill: Bill = { ...b, id: Math.max(0, ...all.map((x) => x.id)) + 1, date: new Date().toISOString() };
    all.unshift(bill);
    save(KEYS.BILLS, all);
    // decrement stock
    const meds = load<Medicine[]>(KEYS.MEDS, seedMedicines);
    bill.items.forEach((it) => {
      const m = meds.find((x) => x.id === it.medicineId);
      if (m) m.quantity = Math.max(0, m.quantity - it.quantity);
    });
    save(KEYS.MEDS, meds);
    return bill;
  },
  // Staff (admin)
  listStaff: async (): Promise<Staff[]> => {
    const all = load<Staff[]>(KEYS.STAFFS, []);
    return all.filter((s) => s.active).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  listStaffHistory: async (): Promise<StaffHistory[]> => {
    const all = load<StaffHistory[]>(KEYS.STAFF_HISTORY, []);
    return all.sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  },
  createStaff: async ({ name, username, createdBy }: { name: string; username?: string; createdBy: string }): Promise<Staff> => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Staff name is required");

    const all = load<Staff[]>(KEYS.STAFFS, []);
    const nextId = Math.max(0, ...all.map((x) => x.id)) + 1;
    const generatedStaffId = `STF-${String(nextId).padStart(4, "0")}`;
    const baseUsername = (username?.trim() || toUsername(cleanName)).toLowerCase();

    let candidate = baseUsername;
    let suffix = 1;
    while (all.some((s) => s.active && s.username.toLowerCase() === candidate)) {
      candidate = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const created: Staff = {
      id: nextId,
      staffId: generatedStaffId,
      name: cleanName,
      username: candidate,
      password: randomPassword(8),
      createdAt: new Date().toISOString(),
      createdBy: createdBy || "admin",
      active: true,
    };

    const history = load<StaffHistory[]>(KEYS.STAFF_HISTORY, []);
    const historyEntry: StaffHistory = {
      id: Math.max(0, ...history.map((x) => x.id)) + 1,
      action: "ADDED",
      staffId: created.staffId,
      name: created.name,
      username: created.username,
      performedBy: created.createdBy,
      performedAt: created.createdAt,
    };

    all.push(created);
    history.unshift(historyEntry);
    save(KEYS.STAFFS, all);
    save(KEYS.STAFF_HISTORY, history);
    return created;
  },
  deleteStaff: async ({ id, performedBy }: { id: number; performedBy: string }) => {
    const all = load<Staff[]>(KEYS.STAFFS, []);
    const target = all.find((s) => s.id === id && s.active);
    if (!target) throw new Error("Staff not found");

    target.active = false;
    const history = load<StaffHistory[]>(KEYS.STAFF_HISTORY, []);
    history.unshift({
      id: Math.max(0, ...history.map((x) => x.id)) + 1,
      action: "DELETED",
      staffId: target.staffId,
      name: target.name,
      username: target.username,
      performedBy: performedBy || "admin",
      performedAt: new Date().toISOString(),
    });

    save(KEYS.STAFFS, all);
    save(KEYS.STAFF_HISTORY, history);
  },
};
