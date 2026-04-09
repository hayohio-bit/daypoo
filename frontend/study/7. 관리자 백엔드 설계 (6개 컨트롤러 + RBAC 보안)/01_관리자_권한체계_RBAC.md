# 섹션 1: 관리자 권한 체계 (RBAC) 설계 검증

DayPoo 프로젝트의 보안 설정을 집중적으로 관장하는 `SecurityConfig.java` 파일과 `Role` 기반 권한 설계를 파악한 스터디 문서입니다.

**[정합성 검증 완료 사항]**
> 사용자가 추정하셨던 `@PreAuthorize("hasRole('ADMIN')")` 어노테이션 기반 메서드 레벨 제어는 일부 사용될 수 있지만, 본 백엔드 시스템은 프론트 컨트롤러에 닿기 전인 **`SecurityFilterChain` (필터 체인) 단계에서 일괄적으로 경로 기반(URL-based) 강력한 인가 라우팅**을 적용하고 있습니다.

## 1. 관리자 접근 제어 (SecurityFilterChain)

Spring Security 내부 필터를 선언하는 `filterChain` 메서드를 보면, `/api/v1/admin/**` 하위로 들어오는 모든 요청(대시보드 서치부터, 회원 강제 탈퇴 기능까지)은 일괄적으로 `hasRole("ADMIN")`이라는 제약을 통과해야 합니다.

```java
// backend/src/main/java/com/daypoo/api/security/SecurityConfig.java

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http.csrf(AbstractHttpConfigurer::disable)
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .sessionManagement(
          session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // JWT 사용
      
      // ... 로그인 비활성화 등 생략
      
      .authorizeHttpRequests(auth -> auth
          .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Pre-flight 허용
          
          // [핵심] 관리자 전용 엔드포인트는 무조건 ADMIN 역할만 접근 가능
          .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
          
          .requestMatchers("/api/v1/auth/**", "/login/oauth2/**").permitAll()
          .requestMatchers("/actuator/health").permitAll()
          .anyRequest().authenticated()
      );
      
    // JWT 필터 삽입 순서 제어
    return http.build();
}
```

## 2. 권한의 분리 로직 점검 (Self-권한 제어)

`Role` Enum에는 실제 구현상 `ROLE_USER`, `ROLE_PRO`, `ROLE_PREMIUM`, `ROLE_ADMIN` 등 4가지 권한이 세분화되어 나누어져 있습니다. 백엔드 `AdminManagementService.java`를 분석해보면, 관리자가 '다른 관리자'의 권한을 마음대로 강등하거나 '자신 스스로'를 삭제할 수 없도록 강제하고 있습니다.

```java
// AdminManagementService.java 일부 파편
@Transactional
public void updateUserRole(Long userId, Role role, String currentAdminEmail) {
  User user = userRepository.findById(userId).orElseThrow(...);

  // [보안 포인트] 자기 자신의 Role을 바꾸려고 할 경우 (조작 방지)
  if (user.getEmail().equals(currentAdminEmail)) {
    throw new BusinessException(ErrorCode.ADMIN_CANNOT_CHANGE_OWN_ROLE);
  }
  user.updateRole(role);
}

@Transactional
public void deleteUser(Long userId, String currentAdminEmail) {
  User user = userRepository.findById(userId).orElseThrow(...);

  // [보안 포인트] 관리자 권한 오남용 및 실수로 자기 자신 삭제(물리적 삭제) 방지
  if (user.getEmail().equals(currentAdminEmail)) {
    throw new BusinessException(ErrorCode.ADMIN_CANNOT_DELETE_SELF);
  }
}
```

---

> [!TIP] 관리자 설계 팁
> **필터 계층과 애플리케이션 계층 권한 제어의 이원화** <br>
> Spring Security `hasRole("ADMIN")`을 통해 URL 레벨에서 불량 접근(일반 유저의 백오피스 침투 시도)을 원천 차단하고, `AdminManagementService` 비즈니스 로직 내부에서 '관리자 간의 자기 파괴(Self-Destroy) 행위'를 추가로 막아낸 DayPoo의 보안 패턴은 클라우드 백오피스 설계의 정석입니다.
