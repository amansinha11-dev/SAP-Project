# Implement Real Backend Stock Deduction on Billing

Approved plan: Move from localStorage mock to real Spring Boot + MySQL.

**Steps:**
- [x] Step 1: Medicine entity/repo created.
- [x] Step 2: Bill/BillItem repo created.
- [x] Step 3: Controllers created.
- [ ] Step 4: Frontend api.ts update.

- [ ] Step 4: Backend - BillController: POST /api/bills → create bill + deduct stock.
- [ ] Step 5: Frontend - Update api.ts: Replace mock listMedicines/createBill with real axios calls.
- [ ] Step 6: Frontend - Billing.tsx/Medicines.tsx/Inventory.tsx: Refresh data after bill.
- [ ] Step 7: Update setup.sql with tables (medicine, bill, bill_item).
- [ ] Step 8: Restart backend, test bill → stock deducts persisted.
- [ ] Step 9: Verify DB tables/data.

**Notes:**
- Reuse JPA/Hikari config.
- Use pharmacy_user/Pharmacy@12345 (update application.properties or .env).
- Lombok for entities.
- Secure with JWT (add BillController with @PreAuthorize if needed).
