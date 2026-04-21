import { createClient } from "@supabase/supabase-js";

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

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type BillItem = {
  medicineId: number;
  name: string;
  price: number;
  quantity: number;
};

export type Bill = {
  id: number;
  customerId: number;
  customerName: string;
  items: BillItem[];
  total: number;
  tax: number;
  grandTotal: number;
  date: string;
};

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

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const requireSupabase = () => {
  if (!supabase) throw new Error("Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
  return supabase;
};

const TABLES = {
  medicines: "pb_medicines",
  customers: "pb_customers",
  bills: "pb_bills",
  staffs: "pb_staffs",
  staffHistory: "pb_staff_history",
};

const throwIfError = (error: { message?: string } | null, msg: string) => {
  if (error) throw new Error(error.message || msg);
};

const randomPassword = (len = 8) =>
  Array.from({ length: len }, () => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"[Math.floor(Math.random() * 57)]).join("");

const toUsername = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "staff";

type MedicineRow = { id: number; name: string; brand: string; category: string; price: number; quantity: number; expiry_date: string; batch_no: string };
type CustomerRow = { id: number; name: string; phone: string; email: string; address: string };
type BillRow = { id: number; customer_id: number; customer_name: string; items: BillItem[]; total: number; tax: number; grand_total: number; date: string };
type StaffRow = { id: number; staff_id: string; name: string; username: string; password: string; created_at: string; created_by: string; active: boolean };
type StaffHistoryRow = { id: number; action: StaffHistoryAction; staff_id: string; name: string; username: string; performed_by: string; performed_at: string };

const toMedicine = (r: MedicineRow): Medicine => ({ id: r.id, name: r.name, brand: r.brand, category: r.category, price: r.price, quantity: r.quantity, expiryDate: r.expiry_date, batchNo: r.batch_no });
const toCustomer = (r: CustomerRow): Customer => ({ id: r.id, name: r.name, phone: r.phone, email: r.email, address: r.address });
const toBill = (r: BillRow): Bill => ({ id: r.id, customerId: r.customer_id, customerName: r.customer_name, items: r.items || [], total: r.total, tax: r.tax, grandTotal: r.grand_total, date: r.date });
const toStaff = (r: StaffRow): Staff => ({ id: r.id, staffId: r.staff_id, name: r.name, username: r.username, password: r.password, createdAt: r.created_at, createdBy: r.created_by, active: r.active });
const toStaffHistory = (r: StaffHistoryRow): StaffHistory => ({ id: r.id, action: r.action, staffId: r.staff_id, name: r.name, username: r.username, performedBy: r.performed_by, performedAt: r.performed_at });

export const dataMode = "supabase";

export const mockApi = {
  login: async (username: string, password: string) => {
    const client = requireSupabase();
    await new Promise((r) => setTimeout(r, 250));
    if (!username || !password) throw new Error("Enter username and password");
    if (username.toLowerCase() === "admin") {
      const adminToken = `admin.${btoa(username)}.${Date.now()}`;
      return { token: adminToken, role: "ADMIN" as const, name: "admin" };
    }
    const { data, error } = await client.from(TABLES.staffs).select("*").ilike("username", username).eq("active", true).limit(1).maybeSingle<StaffRow>();
    throwIfError(error, "Unable to verify login");
    if (!data || data.password !== password) throw new Error("Invalid username or password");
    const userToken = `sb.${btoa(data.username)}.${Date.now()}`;
    return { token: userToken, role: "USER" as const, name: data.name };
  },

  listMedicines: async () => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.medicines).select("*").order("id", { ascending: true });
    throwIfError(error, "Unable to load medicines");
    return ((data ?? []) as MedicineRow[]).map(toMedicine);
  },

  saveMedicine: async (med: Medicine) => {
    const client = requireSupabase();
    if (med.id > 0) {
      const { data, error } = await client.from(TABLES.medicines).update({ name: med.name, brand: med.brand, category: med.category, price: med.price, quantity: med.quantity, expiry_date: med.expiryDate, batch_no: med.batchNo }).eq("id", med.id).select("*").single<MedicineRow>();
      throwIfError(error, "Unable to update medicine");
      return toMedicine(data);
    }
    const { data, error } = await client.from(TABLES.medicines).insert({ name: med.name, brand: med.brand, category: med.category, price: med.price, quantity: med.quantity, expiry_date: med.expiryDate, batch_no: med.batchNo }).select("*").single<MedicineRow>();
    throwIfError(error, "Unable to create medicine");
    return toMedicine(data);
  },

  deleteMedicine: async (id: number) => {
    const client = requireSupabase();
    const { error } = await client.from(TABLES.medicines).delete().eq("id", id);
    throwIfError(error, "Unable to delete medicine");
  },

  listCustomers: async () => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.customers).select("*").order("id", { ascending: true });
    throwIfError(error, "Unable to load customers");
    return ((data ?? []) as CustomerRow[]).map(toCustomer);
  },

  saveCustomer: async (cust: Customer) => {
    const client = requireSupabase();
    if (cust.id > 0) {
      const { data, error } = await client.from(TABLES.customers).update({ name: cust.name, phone: cust.phone, email: cust.email, address: cust.address }).eq("id", cust.id).select("*").single<CustomerRow>();
      throwIfError(error, "Unable to update customer");
      return toCustomer(data);
    }
    const { data, error } = await client.from(TABLES.customers).insert({ name: cust.name, phone: cust.phone, email: cust.email, address: cust.address }).select("*").single<CustomerRow>();
    throwIfError(error, "Unable to create customer");
    return toCustomer(data);
  },

  deleteCustomer: async (id: number) => {
    const client = requireSupabase();
    const { error } = await client.from(TABLES.customers).delete().eq("id", id);
    throwIfError(error, "Unable to delete customer");
  },

  listBills: async () => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.bills).select("*").order("date", { ascending: false });
    throwIfError(error, "Unable to load bills");
    return ((data ?? []) as BillRow[]).map(toBill);
  },

  createBill: async (billInput: Omit<Bill, "id" | "date">) => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.bills).insert({ customer_id: billInput.customerId, customer_name: billInput.customerName, items: billInput.items, total: billInput.total, tax: billInput.tax, grand_total: billInput.grandTotal, date: new Date().toISOString() }).select("*").single<BillRow>();
    throwIfError(error, "Unable to create bill");
    const bill = toBill(data);
    for (const item of bill.items) {
      const { data: medRow, error: medError } = await client.from(TABLES.medicines).select("id, quantity").eq("id", item.medicineId).single<{ id: number; quantity: number }>();
      throwIfError(medError, "Unable to fetch medicine");
      const nextQty = Math.max(0, (medRow?.quantity ?? 0) - item.quantity);
      const { error: updateError } = await client.from(TABLES.medicines).update({ quantity: nextQty }).eq("id", item.medicineId);
      throwIfError(updateError, "Unable to update stock");
    }
    return bill;
  },

  listStaff: async () => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.staffs).select("*").eq("active", true).order("created_at", { ascending: false });
    throwIfError(error, "Unable to load staff");
    return ((data ?? []) as StaffRow[]).map(toStaff);
  },

  listStaffHistory: async () => {
    const client = requireSupabase();
    const { data, error } = await client.from(TABLES.staffHistory).select("*").order("performed_at", { ascending: false });
    throwIfError(error, "Unable to load staff history");
    return ((data ?? []) as StaffHistoryRow[]).map(toStaffHistory);
  },

  createStaff: async ({ name, username, createdBy }: { name: string; username?: string; createdBy: string }) => {
    const client = requireSupabase();
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Staff name is required");
    const { data: current, error: listError } = await client.from(TABLES.staffs).select("id, username, active");
    throwIfError(listError, "Unable to load staff list");
    const all = (current ?? []) as Array<{ id: number; username: string; active: boolean }>;
    const nextId = Math.max(0, ...all.map((x) => x.id)) + 1;
    const paddedId = String(nextId).padStart(4, "0");
    const generatedStaffId = `STF-${paddedId}`;
    const baseUsername = (username?.trim() || toUsername(cleanName)).toLowerCase();
    let candidate = baseUsername;
    let suffix = 1;
    while (all.some((s) => s.active && s.username.toLowerCase() === candidate)) {
      candidate = `${baseUsername}${suffix}`;
      suffix += 1;
    }
    const createdAt = new Date().toISOString();
    const password = randomPassword(8);
    const { data: createdRow, error: createError } = await client.from(TABLES.staffs).insert({ staff_id: generatedStaffId, name: cleanName, username: candidate, password, created_at: createdAt, created_by: createdBy || "admin", active: true }).select("*").single<StaffRow>();
    throwIfError(createError, "Unable to create staff");
    const { error: historyError } = await client.from(TABLES.staffHistory).insert({ action: "ADDED", staff_id: createdRow.staff_id, name: createdRow.name, username: createdRow.username, performed_by: createdBy || "admin", performed_at: createdAt });
    throwIfError(historyError, "Unable to write staff history");
    return toStaff(createdRow);
  },

  deleteStaff: async ({ id, performedBy }: { id: number; performedBy: string }) => {
    const client = requireSupabase();
    const { data: target, error: targetError } = await client.from(TABLES.staffs).select("*").eq("id", id).eq("active", true).maybeSingle<StaffRow>();
    throwIfError(targetError, "Unable to find staff");
    if (!target) throw new Error("Staff not found");
    const { error: disableError } = await client.from(TABLES.staffs).update({ active: false }).eq("id", id);
    throwIfError(disableError, "Unable to delete staff");
    const perfAt = new Date().toISOString();
    const { error: historyError } = await client.from(TABLES.staffHistory).insert({ action: "DELETED", staff_id: target.staff_id, name: target.name, username: target.username, performed_by: performedBy || "admin", performed_at: perfAt });
    throwIfError(historyError, "Unable to write staff history");
  },
};
