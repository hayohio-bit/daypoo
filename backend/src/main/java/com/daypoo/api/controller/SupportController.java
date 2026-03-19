package com.daypoo.api.controller;

import com.daypoo.api.dto.FaqResponse;
import com.daypoo.api.dto.InquiryRequest;
import com.daypoo.api.dto.InquiryResponse;
import com.daypoo.api.entity.User;
import com.daypoo.api.repository.UserRepository;
import com.daypoo.api.service.SupportService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

  private final SupportService supportService;
  private final UserRepository userRepository;

  /** 1:1 문의 등록 */
  @PostMapping("/inquiries")
  public ResponseEntity<?> createInquiry(
      @AuthenticationPrincipal Object principal, @RequestBody InquiryRequest request) {
    try {
      if (principal == null) {
        return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
      }
      String username = extractUsername(principal);
      User user = getUserByUsername(username);
      supportService.createInquiry(user, request);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.internalServerError().body(Map.of("message", "문의 등록 중 오류 발생: " + e.getMessage()));
    }
  }

  /** 내 문의 내역 조회 */
  @GetMapping("/inquiries")
  public ResponseEntity<?> getMyInquiries(@AuthenticationPrincipal Object principal) {
    try {
      if (principal == null) {
        return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
      }
      String username = extractUsername(principal);
      User user = getUserByUsername(username);
      return ResponseEntity.ok(supportService.getMyInquiries(user));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.internalServerError().body(Map.of("message", "문의 내역 로드 중 오류 발생: " + e.getMessage()));
    }
  }

  /** FAQ 조회 */
  @GetMapping("/faqs")
  public ResponseEntity<List<FaqResponse>> getFaqs(
      @RequestParam(required = false) String category) {
    return ResponseEntity.ok(supportService.getFaqs(category));
  }

  private String extractUsername(Object principal) {
    if (principal instanceof UserDetails) {
      return ((UserDetails) principal).getUsername();
    }
    return (String) principal;
  }

  private User getUserByUsername(String username) {
    return userRepository
        .findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
  }
}
