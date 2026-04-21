package com.pharmacy.controller;

import com.pharmacy.model.Medicine;
import com.pharmacy.repository.MedicineRepository;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
  @Autowired
  private MedicineRepository repository;

  @GetMapping
  public List<Medicine> getAllMedicines() {
    return repository.findAll();
  }

  @PostMapping("/deduct")
  public ResponseEntity<Void> deductStock(@RequestBody List<DeductItem> items) {
    items.forEach(item -> {
      Long medicineId = Objects.requireNonNull(item.medicineId, "medicineId is required");
      Medicine m = repository.findById(medicineId).orElseThrow();
      if (m.getQuantity() < item.quantity) {
        throw new IllegalArgumentException("Insufficient stock for " + m.getName());
      }
      m.setQuantity(m.getQuantity() - item.quantity);
      repository.save(m);
    });
    return ResponseEntity.ok().build();
  }

public static class DeductItem {
    public Long medicineId;
    public int quantity;
  }
  
  @GetMapping("/{id}")
  public ResponseEntity<Medicine> getMedicine(@PathVariable Long id) {
    Long safeId = Objects.requireNonNull(id, "id is required");
    return repository.findById(safeId)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }
}
