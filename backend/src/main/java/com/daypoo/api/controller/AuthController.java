package com.daypoo.api.controller;

import com.daypoo.api.dto.LoginRequest;
import com.daypoo.api.dto.SignUpRequest;
import com.daypoo.api.dto.TokenResponse;
import com.daypoo.api.dto.UserResponse;
import com.daypoo.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "인증 및 회원가입 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
  @ApiResponse(responseCode = "200", description = "조회 성공")
  @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 오류)")
  @GetMapping("/me")
  public ResponseEntity<UserResponse> getCurrentUser() {
    UserResponse response = authService.getCurrentUserInfo();
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "아이디 중복 확인", description = "입력한 아이디(이메일)의 중복 여부를 확인합니다.")
  @ApiResponse(responseCode = "200", description = "사용 가능한 아이디")
  @ApiResponse(responseCode = "400", description = "이미 존재하는 아이디")
  @GetMapping("/check-username")
  public ResponseEntity<String> checkUsername(@RequestParam String username) {
    authService.checkUsernameDuplicate(username);
    return ResponseEntity.ok("사용 가능한 아이디입니다.");
  }

  @Operation(summary = "닉네임 중복 확인", description = "입력한 닉네임의 중복 여부를 확인합니다.")
  @ApiResponse(responseCode = "200", description = "사용 가능한 닉네임")
  @ApiResponse(responseCode = "400", description = "이미 존재하는 닉네임")
  @GetMapping("/check-nickname")
  public ResponseEntity<String> checkNickname(@RequestParam String nickname) {
    authService.checkNicknameDuplicate(nickname);
    return ResponseEntity.ok("사용 가능한 닉네임입니다.");
  }

  @Operation(summary = "회원가입", description = "아이디, 비밀번호, 닉네임을 입력받아 신규 회원을 등록합니다.")
  @ApiResponse(responseCode = "200", description = "회원가입 성공")
  @ApiResponse(responseCode = "400", description = "잘못된 입력값 또는 중복된 아이디/닉네임")
  @PostMapping("/signup")
  public ResponseEntity<String> signUp(@Valid @RequestBody SignUpRequest request) {
    authService.signUp(request);
    return ResponseEntity.ok("회원가입이 완료되었습니다.");
  }

  @Operation(summary = "로그인", description = "아이디와 비밀번호를 검증하여 JWT 토큰을 발급합니다.")
  @ApiResponse(responseCode = "200", description = "로그인 성공 및 토큰 발급")
  @ApiResponse(responseCode = "401", description = "인증 실패")
  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
    TokenResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "비밀번호 재설정", description = "아이디(이메일)를 입력받아 해당 이메일로 임시 비밀번호를 발송합니다.")
  @ApiResponse(responseCode = "200", description = "임시 비밀번호 발송 성공")
  @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자")
  @PostMapping("/password/reset")
  public ResponseEntity<String> resetPassword(@RequestParam String username) {
    authService.resetPassword(username);
    return ResponseEntity.ok("임시 비밀번호가 이메일로 발송되었습니다.");
  }
}
