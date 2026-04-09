# 섹션 5: 서비스 계층 통신 처리 활동 로깅 (AOP)

**[정합성 검증 완료 사항]**
> 기획안에 명시된 `AdminAuditAspect.java`는 현재 `com.daypoo.api.global.aop` 패키지 하위에 별도로 존재하지 않습니다! 
> 대신, 관리자 패널 뿐 아니라 전체 아키텍처에 적용되어 있는 범용 **`ServiceLoggingAspect.java`** 파일이 AOP 기반의 메서드 수행 성능 및 예외 로깅을 주도하고 있음을 발견했습니다.

## 1. ServiceLoggingAspect AOP 설계 분석

스프링 프레임워크의 강력한 무기 중 하나인 AOP(관점 지향 프로그래밍) 기술을 통해, 기존 서비스 로직들의 내부 코드를 단 한 줄도 오염시키지 않으면서 전역적으로 로그를 기록합니다.

```java
// backend/src/main/java/com/daypoo/api/global/aop/ServiceLoggingAspect.java
package com.daypoo.api.global.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ServiceLoggingAspect {

  // 포인트컷(Pointcut): "service 패키지 하위의 모든 클래스의 모든 파라미터형 메서드"에 대해 실행
  @Around("execution(* com.daypoo.api.service.*.*(..))")
  public Object logServiceMethod(ProceedingJoinPoint joinPoint) throws Throwable {
  
    String method = joinPoint.getSignature().toShortString();
    log.debug("[SERVICE] Start: {}", method);
    long start = System.currentTimeMillis();
    
    try {
      // 1. 실제 핵심 비즈니스 로직(Target Method) 진입
      Object result = joinPoint.proceed();
      
      // 2. 비즈니스 로직 수행이 끝나면 응답 속도 반환
      log.debug("[SERVICE] End: {} ({}ms)", method, System.currentTimeMillis() - start);
      return result;
      
    } catch (Exception e) {
    
      // 3. 에러 발생 시 잡아내어 어드바이스 로깅
      log.error("[SERVICE] Error: {} - {}", method, e.getMessage());
      throw e;
      
    }
  }
}
```

## 2. [추가 제안] `AdminAuditAspect` 확장 요건

현재의 공통 로깅 체계를 바탕으로, "어떤 관리자가 누구를 삭제했는가?" 같은 추적 데이터 베이스(Audit DB) 적재 기능을 구성하고 싶다면, 아래와 같은 `@AdminAudit` 커스텀 어노테이션 기반의 AOP 추가를 제안합니다.

```java
// 제안 스펙터
@Aspect
@Component
@Slf4j
public class AdminAuditAspect {

    @Around("@annotation(AdminAudit) && args(.., @AuthenticationPrincipal email)")
    public Object auditAdminAction(ProceedingJoinPoint joinPoint, String email) throws Throwable {
        String method = joinPoint.getSignature().getName();
        log.info("[AUDIT] Manager ({}) invoked -> {}", email, method);
        // 향후 action_logs DB 테이블 Insert
        return joinPoint.proceed();
    }
}
```
