# 백엔드 알림 시스템(Notification) 스터디 계획서

본 기획서는 사용자께서 요청하신 7개 섹션을 바탕으로 하되, 실제 `backend/src/main/java/com/daypoo/api/` 폴더 내에 구현되어 있는 **실제 코드의 아키텍처와 스펙을 철저히 검증**하여 작성된 맞춤형 스터디 가이드 제작 계획입니다.

---

### ⚠️ 실제 백엔드 구현 vs 스터디 제안 (정합성 분석 결과)

백엔드 코드베이스 스캔 결과, 사용자님이 추정하신 내용과 실제 코드는 다음과 같은 중요한 차이가 있었습니다. 본 스터디 자료는 **실제 코드에 기반하여 정확한 팩트를 전달**하는 방향으로 구성됩니다.

1. **실시간 알림 전달 전략 (가장 큰 차이점)**
   - **사용자 추정:** 현재 REST Polling 추정, 향후 SSE 전환 설계.
   - **실제 구현 팩트:** **이미 고도화된 타임라인(SSE + Redis Pub/Sub 분산 환경) 아키텍처**로 구현되어 있습니다! `NotificationController`에 `/sse-token` 및 `/subscribe` 엔드포인트가 있고, `NotificationService`에서 `SseEmitter`와 `RedisMessageListenerContainer`를 결합하여 완벽한 실시간 분산 알림을 처리 중입니다.
   - **조치:** 섹션 6의 방향을 "Polling의 단점 분석" 대신 **"기 생성된 SSE + Redis Pub/Sub 기반 고성능 분산 알림 아키텍처 집중 해부"**로 대폭 상향 조정합니다.

2. **Entity 및 Enum 구조의 차이**
   - **사용자 추정:** `type(Enum)`, `message`, `relatedUrl`, `metadata(JSON)` / `RANKING_UP`, `RANKING_DOWN` 등 상세 타입.
   - **실제 구현 팩트:** `type`(`HEALTH, SOCIAL, SYSTEM, EMERGENCY, ACHIEVEMENT`), `content`, `redirectUrl`로 명명되어 있으며 `metadata(JSON)` 필드는 없고, Enum 내부의 정적 템플릿 로직 대신 서비스단에서 조합하고 있습니다.
   - **조치:** 현재 시스템을 있는 그대로 문서화하되, 확장성을 위해 사용자가 제안한 `metadata(JSON)` 및 `메시지 템플릿(치환 로직)`을 **추가 스펙(향후 도입하면 좋은 권장 사항)**으로 제안합니다.

3. **Controller API 및 Pagination 차이**
   - **사용자 추정:** 커서/오프셋 기반 페이지네이션, `unread-count`, `읽은 알림 전체 삭제` 존재.
   - **실제 구현 팩트:** 현재는 List로 모든 알림을 한 번에 반환하고 있으며, 페이지네이션이나 카운트 API는 별도로 없습니다 (`getNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotification`).
   - **조치:** 기존 코드를 먼저 보여주고, 대규모 유저 처리를 위해 **"무한 스크롤(Cursor) 적용 및 뱃지용(Unread-Count) API 추가 설계 방안"**을 추가 스터디 포인트로 제안합니다.

---

### 📄 생성할 7개 스터디 파일 및 주요 내용 (경로: `frontend/study/backend_notification_Ex/`)

**1. `01_Notification_엔티티_및_인덱스_설계.md`**
   - 현재 구현된 `Notification.java` 100% 매핑 코드.
   - 조회 성능 극대화를 위한 `(user_id, is_read)` 기반 DB 인덱싱 전략 가이드.
   - "알림 설계 핵심" / "성능 고려 사항" 박스 추가.

**2. `02_NotificationType_및_메시지_템플릿.md`**
   - 현재 5종(HEALTH, SOCIAL 등) 분류 체계의 코드 리뷰.
   - (제안) 요청하신 플레이스홀더 치환(`{newRank}`) 구조를 위한 Enum 템플릿 고도화 방안.

**3. `03_이벤드_기반_알림_발행_아키텍처.md`**
   - 강결합 방지를 위한 커스텀 이벤트 기반(@Async, @TransactionalEventListener) 퍼블리셔(Publisher)/리스너(Listener) 구현 다이어그램.
   - 트랜잭션 성공 후(AFTER_COMMIT) 발행의 정합성 이점 분석.

**4. `04_NotificationController_API_설계.md`**
   - 작성된 `NotificationController` 코드 및 SSE 특화 엔드포인트(`.TEXT_EVENT_STREAM_VALUE`) 분석.
   - (제안) No-Offset(Cursor) 방식 페이지네이션 확장 API 설계안.

**5. `05_NotificationService_비즈니스_로직.md`**
   - SSE 로컬 인스턴트 메모리 해제 로직(`removeEmitter`) 및 이벤트 생성 비즈니스 로직.
   - 알림 삭제 권한 증명(Access Denied 처리) 등.

**6. `06_실시간_알림_전달_전략_비교_분석.md`**
   - DayPoo의 핵심 경쟁력: **서버 다중화(Scale-Out)에서도 유실 없는 Redis Pub/Sub + SSE 동기화 아키텍처** 텍스트 다이어그램 해부.
   - 웹소켓(WebSocket) vs SSE 명확한 차이점 분석 테이블.

**7. `07_관리자_알림_발송_및_스케줄러.md`**
   - 어드민 콘솔 연계를 대비해, 모든 이수자나 특정 상태 유저들에게 강제 푸시를 보내는 `SYSTEM`/`EMERGENCY` 알림 분배 로직 및 스케줄러.

---
**진행 여부 확인:** 
실제 기구현된 하이-퀄리티 코드(Redis Pub/Sub + SSE)를 무시하고 요청된 내용으로만 덮어쓰기보다는, **기구현된 훌륭한 백엔드를 조명하고 부족한 페이징/템플릿 부분을 스터디로 보완하는 방향**으로 융합된 스터디 자료를 구성하겠습니다. 방향성이 일치하신다면 **"승인합니다"** 혹은 **"진행해줘"**라고 답변해주시면 즉시 7개 파일 작성을 시작합니다!
