package com.pharmacy.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "medicine")
public class Medicine {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  private String brand;

  private String category;

  @Column(nullable = false)
  private Double price;

  @Column(nullable = false)
  private Integer quantity;

  private LocalDate expiryDate;

  private String batchNo;
}
