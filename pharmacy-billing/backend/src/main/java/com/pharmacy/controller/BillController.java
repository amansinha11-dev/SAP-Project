package com.pharmacy.controller;

import com.pharmacy.model.Bill;
import com.pharmacy.model.BillItem;
import com.pharmacy.repository.BillRepository;
import com.pharmacy.repository.MedicineRepository;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {
  @Autowired
  private BillRepository billRepo;
  @Autowired
  private MedicineRepository medicineRepo;

  @PostMapping
  public ResponseEntity<Bill> createBill(@RequestBody BillRequest request) {
    // Deduct stock first
    request.items.forEach(item -> {
      Long medicineId = Objects.requireNonNull(item.medicineId, "medicineId is required");
      var m = medicineRepo.findById(medicineId).orElseThrow();
      if (m.getQuantity() < item.quantity) {
        throw new IllegalArgumentException("Insufficient stock for " + m.getName());
      }
      m.setQuantity(m.getQuantity() - item.quantity);
      medicineRepo.save(m);
    });

    // Create bill
    Bill bill = new Bill();
    bill.setCustomerId(request.customerId);
    bill.setCustomerName(request.customerName);
    bill.setTotal(request.total);
    bill.setTax(request.tax);
    bill.setGrandTotal(request.grandTotal);
    bill = billRepo.save(bill);

    // Add items
    for (var item : request.items) {
      BillItem bi = new BillItem();
      bi.setMedicineId(item.medicineId);
      bi.setMedicineName(item.medicineName);
      bi.setPrice(item.price);
      bi.setQuantity(item.quantity);
      bi.setBill(bill);
      bill.getItems().add(bi);
    }
    billRepo.save(bill);

    return ResponseEntity.ok(bill);
  }

  @GetMapping
  public List<Bill> getBills() {
    return billRepo.findAllByOrderByDateDesc();
  }

  public static class BillRequest {
    public Long customerId;
    public String customerName;
    public List<BillItemRequest> items;
    public Double total, tax, grandTotal;
  }

  public static class BillItemRequest {
    public Long medicineId;
    public String medicineName;
    public Double price;
    public Integer quantity;
  }
}
