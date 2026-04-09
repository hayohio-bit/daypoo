# 섹션 4: NotificationController API 설계

이 문서는 DayPoo 프로젝트의 실제 `NotificationController.java` 구조를 분석하고, 실시간 반응형 웹(Real-time Web)을 완성하는 SSE 전용 API 구성을 학습합니다.

## 1. 실제 구현된 컨트롤러 스펙 분석

현재 구동 중인 알림 API는 클라이언트에게 푸시 알림을 내려주기 위한 `SseEmitter` 엔드포인트와 기본 CRUD 엔드포인트를 혼합하여 제공하고 있습니다.

```java
package com.daypoo.api.controller;

import com.daypoo.api.dto.NotificationResponse;
import com.daypoo.api.entity.User;
import com.daypoo.api.security.JwtProvider;
import com.daypoo.api.service.NotificationService;
import com.daypoo.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;
  private final UserService userService;
  private final JwtProvider jwtProvider;

  // === 1. Server-Sent Events (SSE) 설정 채널 ===

  @PostMapping("/sse-token")
  public ResponseEntity<Map<String, String>> getSseToken(@AuthenticationPrincipal String email) {
    // 보안을 위해 웹소켓/SSE 접속용 임시 단기 토큰 발급
    User user = userService.getByEmail(email);
    String sseToken = jwtProvider.createSseToken(email, user.getRole().name());
    return ResponseEntity.ok(Map.of("sseToken", sseToken));
  }

  @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> subscribe(@AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    SseEmitter emitter = notificationService.subscribe(user.getId());
    return ResponseEntity.ok()
        .header("X-Accel-Buffering", "no") // Nginx 프록시 버퍼링 무시 (즉각 전송)
        .header("Cache-Control", "no-cache") 
        .body(emitter);
  }

  // === 2. 기본 CRUD 엔드포인트 ===

  @GetMapping // 내 전체 알림 목록 조회
  public ResponseEntity<List<NotificationResponse>> getNotifications(
      @AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    return ResponseEntity.ok(notificationService.getMyNotifications(user));
  }

  @PatchMapping("/{notificationId}/read") // 단일 요소 읽음 처리
  public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
    notificationService.markAsRead(notificationId);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/mark-all-read") // 일괄 읽음 처리
  public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    notificationService.markAllAsRead(user);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{notificationId}") // 개별 삭제
  public ResponseEntity<Void> deleteNotification(
      @PathVariable Long notificationId, @AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    notificationService.deleteNotification(notificationId, user);
    return ResponseEntity.ok().build();
  }
}
```

## 2. [추가 스터디 제안] No-Offset(Cursor) 기반 페이지네이션 설계

현재의 `@GetMapping` 방식은 데이터베이스의 모든 알림 내역을 `List` 컬렉션으로 한 번에 퍼올립니다. 회원이 1만 명이고 알림이 인당 500개라면 메모리 초과 장애가 발생합니다.

### Offset (기존 페이징) vs Cursor (제안 페이징)

- **Offset 기반 (`Page<T>` 사용):** `LIMIT 10 OFFSET 1000`. 페이지가 뒤로 갈수록 DB 엔진이 앞에서부터 1000개를 읽고 버려야 하므로 속도가 $O(N)$으로 매우 느려집니다. 알림처럼 실시간성이 강한 도메인에는 비적합.
- **Cursor 기반 (No-Offset):** `WHERE notification_id < 980 LIMIT 10`. 마지막 읽은 알림의 ID 값을 기준으로 끊어오기 때문에 항상 $O(1)$의 탐색 속도를 보장합니다. 무한 스크롤(Infinite Scroll) 프론트엔드 연동에 압도적인 퍼포먼스를 냅니다.

---

> [!TIP] 알림 설계 핵심
> **SSE를 위한 엔드포인트 세팅 (`TEXT_EVENT_STREAM_VALUE`)** <br>
> SSE API는 응답을 한 번만 보내고 끝내는 일반 HTTP 규격이 아니라 통로를 열어두고 지속적으로 스트림 전송을 할 수 있습니다. 이때 Nginx 같은 리버스 프록시 서버를 중간에 둔 경우 묶어서 한 번에 보내려는 버퍼링(Buffering) 습성 탓에 실시간 알림이 늦어집니다. 따라서 헤더에 `X-Accel-Buffering: no`를 명시하는 현DayPoo의 설계는 실무적인 장애 대응의 모법 사례입니다.

> [!WARNING] 성능 고려 사항
> **읽지 않은 알림 카운트 (Badge 숫자)** <br>
> 앱 화면 진입 시 종 모양 아이콘 옆에 "안 읽은 알림 수(뱃지)"를 표시해야 합니다. 이를 위해 서버에서 매번 카운트를 하면 부담이 되니, Redis에 `notification:unread:user_id` 형태의 Cache를 걸어 카운트를 캐싱하고 알림이 발생할 때마다 `INCR` 시켜주는 패턴 적용을 고려해야 합니다.
