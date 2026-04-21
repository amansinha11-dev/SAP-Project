package com.pharmacy.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "bill_item")
public class BillItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "medicine_id")
  private Long medicineId;

  @Column(name = "medicine_name", length = 255)
  private String medicineName;

  private Double price;

  private Integer quantity;

  @ManyToOne
  @JoinColumn(name = "bill_id")
  private Bill bill;
}
