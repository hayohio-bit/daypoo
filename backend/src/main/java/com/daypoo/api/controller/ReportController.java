package com.daypoo.api.controller;

import com.daypoo.api.dto.HealthReportResponse;
import com.daypoo.api.entity.User;
import com.daypoo.api.entity.enums.ReportType;
import com.daypoo.api.service.ReportService;
import com.daypoo.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;
  private final UserService userService;

  /** AI 건강 리포트 조회/생성 */
  @GetMapping("/{type}")
  public ResponseEntity<HealthReportResponse> getReport(
      @AuthenticationPrincipal String email, @PathVariable ReportType type) {
    User user = userService.getByEmail(email);
    return ResponseEntity.ok(reportService.generateReport(user, type));
  }
}
