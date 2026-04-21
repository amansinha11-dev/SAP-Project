**Stock Deduction on Billing Feature Plan**

**Information Gathered:**
- Frontend uses mockApi.localStorage (api.ts): createBill already implements stock deduction:
  ```
  bill.items.forEach((it) => {
    const m = meds.find((x) => x.id === it.medicineId);
    if (m) m.quantity = Math.max(0, m.quantity - it.quantity);
  });
  save(KEYS.MEDS, meds);
  ```
- Example medicine 'Atorvastatin 10mg', brand 'Lipitor', category 'Cardiovascular', quantity:90.
- Billing.tsx calls createBill → stock updates.
- Pages (Medicines.tsx, Inventory.tsx, Dashboard.tsx) fetch listMedicines → see updated stock on refresh.
- Backend minimal (HealthController only), JPA ready but no entities/API.
- Cart limits qty to available stock.

**Current Status:** Feature **already works** in mock layer. Test:
1. Go Medicines → add Atorvastatin to cart (Billing).
2. Generate bill.
3. Refresh Medicines/Inventory/Dashboard → stock 89.

**Plan:** No code changes needed for mock. Demo works.

**If real backend needed:**
- Backend: Add Medicine entity, MedicineRepository, MedicineController deductStock(billItems).
- Frontend: Replace mockApi.createBill with api.post('/bills', bill) → refresh medicines.
- Dependent Files: api.ts, Billing.tsx backend entities/services.

**Followup steps:**
- Test feature in app.
- If backend real: create entities etc.

Is the feature working when you test (refresh pages after bill)? Or want real backend persistence? Proceed?
