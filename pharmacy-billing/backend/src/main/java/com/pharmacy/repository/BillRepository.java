package com.pharmacy.repository;

import com.pharmacy.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
  List<Bill> findByCustomerIdOrderByDateDesc(Long customerId);
  List<Bill> findAllByOrderByDateDesc();
}
