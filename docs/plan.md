# DayPoo 백엔드 성능 및 구조 개선 계획 (dazzling-sauteeing-peach.md 참조)

사용자가 제공한 `dazzling-sauteeing-peach.md` 내용을 바탕으로 백엔드(및 AI 서비스) 개선 항목만 발췌하여 순차적으로 진행합니다.

## 🛠 작업 목록

### Phase 1: 긴급 버그 및 정합성 수정 (B2)
1.  **[B2] ShopService 구매 로직 Race Condition 수정**
    -   `inventories` 테이블에 `(user_id, item_id)` 유니크 제약 조건 추가 (Flyway V991__add_unique_to_inventories.sql)
    -   `ShopService.purchaseItem()`에서 `DataIntegrityViolationException` 처리로 정합성 보장

### Phase 2: 비동기 처리 및 성능 최적화 (B1, B7)
2.  **[B1, B7] PooRecordService 비동기화 및 전용 스레드풀 설정**
    -   `AsyncConfig.java` 생성: `ThreadPoolTaskExecutor` 설정 (core=5, max=20, queue=100)
    -   `PooRecordService.createRecord()` 내 AI 분석, Geocoding, 랭킹, 칭호 처리를 별도 `@Async` 메서드(`applyPostSaveEffects`)로 분리

### Phase 3: 데이터 조회 및 필터링 최적화 (B3, B4)
3.  **[B3] ShopService 장착 상태 필터링 최적화**
    -   `findAllByUser()` 후 스트림 필터링 대신 JPA 쿼리(JPQL/QueryDSL)를 사용하여 SQL 레벨에서 처리 (ex: `findByUserAndIsEquippedTrue`)
4.  **[B4] ToiletReviewService 통계 쿼리 통합**
    -   리뷰 개수(COUNT)와 평점 평균(AVG)을 각각 조회하는 대신 단일 쿼리로 통합 조회

### Phase 4: AI 연동 및 보안 강화 (B5, B9)
5.  **[B5] ToiletReviewService AI 요약 비동기화**
    -   리뷰 5개 이상 시 호출되는 AI 요약 로직을 `@Async`로 전환하여 응답 지연 방지
6.  **[B9] AI 서비스(FastAPI) CORS 정책 강화**
    -   `ai-service/main.py`의 `allow_origins=["*"]`를 특정 도메인으로 제한 (보안 강화)

### Phase 5: DB 인덱스 및 로깅 최적화 (B10, B6, B8)
7.  **[B10] 성능 향상을 위한 DB 인덱스 추가**
    -   `toilet_reviews`, `inventories` 등 자주 조회되는 복합 조건 컬럼에 대한 인덱스 추가 기여
8.  **[B6] SSE 통계 및 알림 (분산 환경 고려)**
    -   `NotificationService`의 `ConcurrentHashMap` 기반 관리 구조에 대한 메모리 누수 방지 로직 및 로깅 강화 (필요시 Redis 전환 기반 준비)
9.  **[B8] ServiceLoggingAspect 로깅 레벨 조정**
    -   모든 서비스 메서드 `INFO` 로깅을 `DEBUG`로 전환하거나 조건부 로깅으로 변경하여 로그 부하 감소

### Phase 6: 인프라 및 모니터링 강화 (I2, I3)
10. **[I2] Redis 보안 및 영속성 설정**
    -   Redis 비밀번호 설정 및 데이터 영속성(AOF/RDB) 설정 검토
11. **[I3] Actuator 및 모니터링 환경 설정**
    -   Spring Boot Actuator 노출 및 Prometheus 연동 설정

---

## 🚀 실행 전략 (Phase 1부터 시작)

1.  새로운 작업 브랜치(`improvement/backend-optimization`) 생성
2.  항목별 순차 구현 및 단위 테스트
3.  `docs/backend-modification-history.md`에 변경 사항 기록

[✅ 규칙을 잘 수행했습니다.]
