package com.pharmacy.repository;

import com.pharmacy.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
  List<Medicine> findByQuantityGreaterThanEqual(int quantity);
  Optional<Medicine> findByBatchNo(String batchNo);
}
