package com.daypoo.api.repository;

import com.daypoo.api.entity.Inventory;
import com.daypoo.api.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
  @Query("SELECT i FROM Inventory i JOIN FETCH i.item WHERE i.user = :user")
  List<Inventory> findAllByUser(@Param("user") User user);

  @Query("SELECT i FROM Inventory i JOIN FETCH i.item WHERE i.user = :user AND i.item.id = :itemId")
  Optional<Inventory> findByUserAndItemId(@Param("user") User user, @Param("itemId") Long itemId);

  boolean existsByUserAndItemId(User user, Long itemId);

  boolean existsByItemId(Long itemId);
}
