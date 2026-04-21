package com.pharmacy.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "bill")
public class Bill {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "customer_id")
  private Long customerId;

  @Column(name = "customer_name", length = 255)
  private String customerName;

  private Double total;

  private Double tax;

  @Column(name = "grand_total")
  private Double grandTotal;

  private LocalDateTime date = LocalDateTime.now();

  @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
  private List<BillItem> items;
}
