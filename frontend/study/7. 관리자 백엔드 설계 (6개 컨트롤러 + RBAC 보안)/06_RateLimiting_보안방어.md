# 섹션 6: Rate Limiting & 보안 아키텍처 수립

**[정합성 검증 완료 사항]**
> `backend/src/main/java/com/daypoo/api/global/aop` 경로 하위에 애플리케이션 계층에서의 DDOS 방어를 위한 **`RateLimitAspect.java`**가 성공적으로 도입되어 있습니다. 관리자 API나 알림 소켓 호출 빈도 제어에 핵심 역할을 합니다.

## 1. RateLimiting AOP 구현체 분석 (처리율 제한 장치)

동일한 유저(혹은 IP)가 초당 수 백건의 조회를 남발하여 서버 리소스를 고갈시키는 행위를 방어하기 위해 토큰 버킷-유사 개념의 캐시 연산 AOP가 가동 중입니다. (주로 Redis 연계 사용)

```java
// backend/src/main/java/com/daypoo/api/global/aop/RateLimitAspect.java (개념 복원)
package com.daypoo.api.global.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
// ... 

@Aspect
@Component
public class RateLimitAspect {
    // 내부적으로 Redis Atomic 카운터(INCR)를 사용하여 
    // 동일 클라이언트 아이덴티티(IP 또는 Access Token)에 대해
    // 특정 초당 임계치량 연산을 초과했는지 필터링하는 로직이 적용되어 보안 코어를 뒷받침합니다.
}
```

## 2. 관리자 접근을 위한 CORS 전역 설정

`SecurityConfig.java`에 이식되어 있는 `UrlBasedCorsConfigurationSource` 관련 코드를 보면, 관리자 백오피스 프론트엔드가 접속할 때 발생하는 쿠키 전송 및 이종 도메인 보안 정책에 빈틈이 없도록 맞춤 세팅되어 있습니다.

```java
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    
    // application.yml(환경변수)의 Allowed Origins 만 리스트 지정하여 화이트리스트 검사
    config.setAllowedOrigins(allowedOrigins); 
    
    // CRUD용 전체 Http 메서드 허용
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    
    // 인증과 MDC(요청 추적)에 이용되는 상관ID 헤더 허용
    config.setAllowedHeaders(
        List.of("Authorization", "Content-Type", "Accept", "X-Correlation-Id"));
        
    config.setExposedHeaders(List.of("Authorization"));
    
    // 관리자 JWT 쿠키 전송을 비롯한 크리덴셜(Credential)을 True로 부여하여 CORS 해제
    config.setAllowCredentials(true);
    config.setMaxAge(3600L); // Pre-flight 응답 캐시로 속도 상승

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
```

---

> [!WARNING] 보안 체크리스트
> **관리자 페이지 전용 IP 격리 체계 제안** <br>
> 백오피스는 권한자만 들르는 매우 민감한 보안 구역입니다. CORS나 JWT만으로는 계정이 털렸을 시 2차 방어가 어렵습니다. 실무 보안 규정에 따라 `/api/v1/admin/**` 라우터로 인입되는 AWS ALB(로드밸런서) 단계나 스프링 내부 `Filter` 레벨에서 관리자 지정 사내망(Office IP Proxy) 대역만 허용하는 WAF 스펙터트럼을 향후 얹어야 완벽한 백오피스가 구성됩니다.
