package com.daypoo.api.entity;

import com.daypoo.api.global.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String paymentKey;

    @Builder
    public Payment(String username, String orderId, Long amount, String paymentKey, LocalDateTime createdAt) {
        this.username = username;
        this.orderId = orderId;
        this.amount = amount;
        this.paymentKey = paymentKey;
        if (createdAt != null) {
            // Manually set createdAt for test data generation
            this.setCreatedAt(createdAt);
        }
    }
}
