package com.daypoo.api.controller;

import com.daypoo.api.dto.AdminStatsResponse;
import com.daypoo.api.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin", description = "관리자 전용 통계 및 데이터 관리 API")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "관리자 대시보드 통계 조회", description = "유저 추이, 매출, 문의 현황 등 관리자 대시보드에 필요한 통계 정보를 반환합니다.")
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @Operation(summary = "테스트 데이터 생성", description = "통계 그래프 확인을 위해 과거 14일치 결제 테스트 데이터를 생성합니다.")
    @PostMapping("/generate-test-data")
    public ResponseEntity<String> generateTestData() {
        adminService.generateTestData();
        return ResponseEntity.ok("테스트 데이터가 생성되었습니다.");
    }
}
