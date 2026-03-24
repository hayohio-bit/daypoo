package com.daypoo.api.global.aop;

import com.daypoo.api.global.exception.BusinessException;
import com.daypoo.api.global.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

  private final StringRedisTemplate redisTemplate;

  @Around("@annotation(rateLimit)")
  public Object checkRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit)
      throws Throwable {
    String key = resolveKey(joinPoint, rateLimit);
    Long count = redisTemplate.opsForValue().increment("rate:" + key);

    if (count != null && count > rateLimit.maxAttempts()) {
      // 429 Too Many Requests -> BusinessException 체계 활용 (사용자 정의 ErrorCode 필요 가능성)
      throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS);
    }
    if (count != null && count == 1) {
      redisTemplate.expire("rate:" + key, rateLimit.windowSeconds(), TimeUnit.SECONDS);
    }
    return joinPoint.proceed();
  }

  private String resolveKey(ProceedingJoinPoint joinPoint, RateLimit rateLimit) {
    HttpServletRequest request =
        ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    String ip = request.getRemoteAddr();
    String method = joinPoint.getSignature().toShortString();
    return ip + ":" + method;
  }
}
