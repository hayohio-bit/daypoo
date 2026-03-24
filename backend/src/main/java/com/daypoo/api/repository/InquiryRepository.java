package com.daypoo.api.repository;

import com.daypoo.api.entity.Inquiry;
import com.daypoo.api.entity.User;
import com.daypoo.api.entity.enums.InquiryStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
  List<Inquiry> findAllByUserOrderByCreatedAtDesc(User user);

  Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

  Page<Inquiry> findAllByStatusOrderByCreatedAtDesc(InquiryStatus status, Pageable pageable);

  long countByStatus(InquiryStatus status);

  void deleteAllByUser(User user);
}
