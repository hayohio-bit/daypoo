package com.daypoo.api.repository;

import com.daypoo.api.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :start AND :end")
    List<Payment> findAllByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
